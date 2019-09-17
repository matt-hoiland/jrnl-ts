import * as fs from 'fs';
import * as path from 'path';
import * as dedent from 'dedent';

import { EntryIO } from './EntryIO';
import { FormatError, InvalidFileTypeError } from './errors';
import { MetaData } from './model/MetaData';
import { Entry } from './model/Entry';

describe('EntryIO.load errors', () => {
  it("throws Node Error (code 'ENOENT') missing file", () => {
    expect(() => {
      EntryIO.load('nonexistent');
    }).toThrowMatching(err => {
      return err.code === 'ENOENT';
    });
  });

  it('throws InvalidFileTypeError for non-text file', () => {
    expect(() => {
      EntryIO.load('resources/tinyimage.png');
    }).toThrowError(InvalidFileTypeError);
  });
});

describe('EntryIO.load', () => {
  let metadata: MetaData = { date: '', filename: '', title: '' };
  afterEach(() => {
    fs.unlinkSync(metadata.filename);
  });

  it('accepts file with correct format', () => {
    metadata = {
      date: '1970-01-01T00:00:00Z',
      filename: '1970-01-01_Th_dummy_title.md',
      title: 'Dummy Title',
    };

    fs.writeFileSync(
      metadata.filename,
      dedent`
        # Dummy Title

        \`\`\`json
        ${JSON.stringify(metadata)}
        \`\`\`

        Body text
      `
    );

    const entry = EntryIO.load(metadata.filename);
    expect(entry).not.toBeNull();
    expect(entry.metadata).toEqual(metadata);
    expect(entry.metadata.tags).toBeUndefined();
    expect(entry.text).toEqual('Body text');
  });

  it('throws FormatError file with wrong format', () => {
    metadata = {
      date: '1970-01-01T00:00:00Z',
      filename: '1970-01-01_Th_dummy_title.md',
      title: 'Dummy Title',
    };

    fs.writeFileSync(
      metadata.filename,
      dedent`
        # Dummy Title
        Breaking text
        \`\`\`json
        ${JSON.stringify(metadata)}
        \`\`\`

        Body text
      `
    );

    expect(() => EntryIO.load(metadata.filename)).toThrowError(FormatError);
  });
});

describe('EntryIO.save', () => {
  const goodEntry = new Entry(
    {
      date: '1970-01-01T00:00:00Z',
      filename: '1970-01-01_Th_entry.md',
      title: 'Entry',
    },
    'Body text'
  );

  const badEntry = new Entry(
    {
      date: '1970-01-01',
      filename: '1970-01-01_Th_Entry.md',
      title: 'Entry',
    },
    'Body text'
  );

  const testdir = 'test';
  const nontrivialPath = path.join(testdir);
  const nondirectoryFile = path.join(nontrivialPath, 'blah.txt');
  const nonexistentPath = './non/existent/path';

  beforeAll(() => {
    fs.mkdirSync(nontrivialPath, { recursive: true });
    fs.writeFileSync(nondirectoryFile, nondirectoryFile);
  });

  afterAll(() => {
    fs.unlinkSync(nondirectoryFile);
    fs.rmdirSync(testdir);
  });

  it('accepts correct data on default path', () => {
    expect(() => EntryIO.save(goodEntry)).not.toThrow();
  });

  it('accepts correct data on non-trivial path', () => {
    expect(() => EntryIO.save(goodEntry, nontrivialPath)).not.toThrow();
  });

  it('rejects correct data on non-existent path', () => {
    expect(() => EntryIO.save(goodEntry, nonexistentPath)).toThrowError(
      InvalidFileTypeError
    );
  });

  it('rejects correct data on non-directory file', () => {
    expect(() => EntryIO.save(goodEntry, nondirectoryFile)).toThrowError(
      InvalidFileTypeError
    );
  });

  it('rejects bad data on default path', () => {
    expect(() => EntryIO.save(badEntry)).toThrowError(FormatError);
  });

  it('rejects bad data on non-trivial path', () => {
    expect(() => EntryIO.save(badEntry, nontrivialPath)).toThrowError(
      FormatError
    );
  });
});

describe('EntryIO.isValidFormat', () => {
  const metadata: MetaData = { date: '', filename: '', title: '' };

  it('accepts entry without a title line', () => {
    const text = dedent`
      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`

      Body text
    `;

    expect(EntryIO.isValidFormat(Buffer.from(text))).toBeTruthy();
  });

  it('accepts entry with empty body', () => {
    const text = dedent`
      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`
    `;

    expect(EntryIO.isValidFormat(Buffer.from(text))).toBeTruthy();
  });

  it('rejects non-title text before MetaData', () => {
    const text = dedent`
      # Title
      breaking text
      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`

      body
    `;

    expect(EntryIO.isValidFormat(Buffer.from(text))).toBeFalsy();
  });

  it('rejects broken metadata code frames', () => {
    expect(
      EntryIO.isValidFormat(
        Buffer.from(
          dedent`
            # Title
            ${JSON.stringify(metadata)}
            \`\`\`
          `
        )
      )
    ).toBeFalsy();

    expect(
      EntryIO.isValidFormat(
        Buffer.from(
          dedent`
            # Title
            \`\`\`json
            ${JSON.stringify(metadata)}
          `
        )
      )
    ).toBeFalsy();

    expect(
      EntryIO.isValidFormat(
        Buffer.from(
          dedent`
            # Title
            \`\`\`markdown
            ${JSON.stringify(metadata)}
            \`\`\`
          `
        )
      )
    ).toBeFalsy();
  });

  it('rejects multiple title lines', () => {
    const text = dedent`
      # Title
      # Also a title
      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`
    `;

    expect(EntryIO.isValidFormat(Buffer.from(text))).toBeFalsy();
  });

  it('rejects title line that is not h1', () => {
    const text = dedent`
      ## Title

      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`
    `;

    expect(EntryIO.isValidFormat(Buffer.from(text))).toBeFalsy();
  });
});

describe('EntryIO.extractMetaData', () => {
  it('accepts wellformed json', () => {
    const text = dedent`
      \`\`\`json
      {
        "title": "A good title",
        "date": "1970-01-01T00:00:00Z",
        "filename": "1970-01-01_Th_a_good_title.md"
      }
      \`\`\`
    `;

    expect(EntryIO.extractMetaData(Buffer.from(text))).toEqual({
      title: 'A good title',
      date: '1970-01-01T00:00:00Z',
      filename: '1970-01-01_Th_a_good_title.md',
    });
  });

  it('accepts when entry has multiple json blocks', () => {
    const text = dedent`
      \`\`\`json
      {
        "title": "A good title",
        "date": "1970-01-01T00:00:00Z",
        "filename": "1970-01-01_Th_a_good_title.md"
      }
      \`\`\`

      \`\`\`json
      {
        "data": "other data"
      }
      \`\`\`
    `;

    expect(EntryIO.extractMetaData(Buffer.from(text))).toEqual({
      title: 'A good title',
      date: '1970-01-01T00:00:00Z',
      filename: '1970-01-01_Th_a_good_title.md',
    });
  });

  it('throws FormatError for missing json', () => {
    expect(() => EntryIO.extractMetaData(Buffer.from('No json!'))).toThrowError(
      FormatError
    );
  });

  it('throws FormatError for invalid MetaData', () => {
    const text = dedent`
      \`\`\`json
      {
        "Title": "A good title",
        "date": "01/01/1970 12:00 AM",
        "file_name": "1970-01-01_Th_a_good_title.md"
      }
      \`\`\`
    `;

    expect(() => EntryIO.extractMetaData(Buffer.from(text))).toThrowError(
      FormatError
    );
  });

  it('throws SyntaxError for malformed json', () => {
    const text = dedent`
      \`\`\`json
      {
        'title': "A good title",
        date: "1970-01-01T00:00:00Z",
        "filename": "1970-01-01_Th_a_good_title.md",
      }
      \`\`\`
    `;

    expect(() => EntryIO.extractMetaData(Buffer.from(text))).toThrowError(
      SyntaxError
    );
  });
});

describe('EntryIO.extractBodyText', () => {
  it('trims leading whitespace', () => {
    const text = dedent`
      \`\`\`





      body`;

    expect(EntryIO.extractBodyText(Buffer.from(text))).toEqual('body');
  });

  it('trims trailing whitespace', () => {
    const text = '```\nbody\n\n\n\n\n';

    expect(EntryIO.extractBodyText(Buffer.from(text))).toEqual('body');
  });

  it('produces empty string for an empty body', () => {
    expect(EntryIO.extractBodyText(Buffer.from('```'))).toEqual('');
  });

  it('only looks for first instance of /^```$/ to find start of body text', () => {
    const text = dedent`
      \`\`\`
      This is a paragraph that does not have a starting code fence.

      \`\`\`json
        "more data"
      \`\`\`
    `;

    expect(EntryIO.extractBodyText(Buffer.from(text))).toEqual(
      text
        .split('\n')
        .slice(1)
        .join('\n')
    );
  });

  it('throws FormatError for text without a /^```$/ line', () => {
    const text = 'There is not starting code fence';

    expect(() => EntryIO.extractBodyText(Buffer.from(text))).toThrowError(
      FormatError
    );
  });
});
