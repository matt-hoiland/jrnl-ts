import * as fs from 'fs';
import * as dedent from 'dedent';

import {
  extractBodyText,
  extractMetaData,
  isValidEntryFormat,
  loadEntry,
} from './utils';
import { FormatError, InvalidFileTypeError } from './errors';
import { MetaData } from './model/MetaData';
import { Entry } from './model/Entry';

describe('loadFile', () => {
  it("throws Node Error (code 'ENOENT') missing file", () => {
    expect(() => {
      loadEntry('nonexistent');
    }).toThrowMatching(err => {
      return err.code === 'ENOENT';
    });
  });

  it('throws InvalidFileTypeError for non-text file', () => {
    expect(() => {
      loadEntry('resources/tinyimage.png');
    }).toThrowError(InvalidFileTypeError);
  });
});

describe('loadEntry', () => {
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

    const entry = loadEntry(metadata.filename);
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

    expect(() => loadEntry(metadata.filename)).toThrowError(FormatError);
  });
});

describe('isValidEntryFormat', () => {
  const metadata: MetaData = { date: '', filename: '', title: '' };

  it('accepts entry without a title line', () => {
    const text = dedent`
      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`

      Body text
    `;

    expect(isValidEntryFormat(Buffer.from(text))).toBeTruthy();
  });

  it('accepts entry with empty body', () => {
    const text = dedent`
      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`
    `;

    expect(isValidEntryFormat(Buffer.from(text))).toBeTruthy();
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

    expect(isValidEntryFormat(Buffer.from(text))).toBeFalsy();
  });

  it('rejects broken metadata code frames', () => {
    expect(
      isValidEntryFormat(
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
      isValidEntryFormat(
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
      isValidEntryFormat(
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

    expect(isValidEntryFormat(Buffer.from(text))).toBeFalsy();
  });

  it('rejects title line that is not h1', () => {
    const text = dedent`
      ## Title

      \`\`\`json
      ${JSON.stringify(metadata)}
      \`\`\`
    `;

    expect(isValidEntryFormat(Buffer.from(text))).toBeFalsy();
  });
});

describe('extractMetaData', () => {
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

    expect(extractMetaData(Buffer.from(text))).toEqual({
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

    expect(extractMetaData(Buffer.from(text))).toEqual({
      title: 'A good title',
      date: '1970-01-01T00:00:00Z',
      filename: '1970-01-01_Th_a_good_title.md',
    });
  });

  it('throws FormatError for missing json', () => {
    expect(() => extractMetaData(Buffer.from('No json!'))).toThrowError(
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

    expect(() => extractMetaData(Buffer.from(text))).toThrowError(FormatError);
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

    expect(() => extractMetaData(Buffer.from(text))).toThrowError(SyntaxError);
  });
});

describe('extractBodyText', () => {
  it('trims leading whitespace', () => {
    const text = dedent`
      \`\`\`





      body`;

    expect(extractBodyText(Buffer.from(text))).toEqual('body');
  });

  it('trims trailing whitespace', () => {
    const text = '```\nbody\n\n\n\n\n';

    expect(extractBodyText(Buffer.from(text))).toEqual('body');
  });

  it('produces empty string for an empty body', () => {
    expect(extractBodyText(Buffer.from('```'))).toEqual('');
  });

  it('only looks for first instance of /^```$/ to find start of body text', () => {
    const text = dedent`
      \`\`\`
      This is a paragraph that does not have a starting code fence.

      \`\`\`json
        "more data"
      \`\`\`
    `;

    expect(extractBodyText(Buffer.from(text))).toEqual(
      text
        .split('\n')
        .slice(1)
        .join('\n')
    );
  });

  it('throws FormatError for text without a /^```$/ line', () => {
    const text = 'There is not starting code fence';

    expect(() => extractBodyText(Buffer.from(text))).toThrowError(FormatError);
  });
});
