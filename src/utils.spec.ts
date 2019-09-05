import {
  FormatError,
  InvalidFileTypeError,
  isValidEntryFormat,
  loadEntry,
} from './utils';
import { MetaData } from './model/MetaData';
import { Entry } from './model/Entry';
import * as fs from 'fs';

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
      filename: '1970-01-01_Th_Dummy_Title.md',
      title: 'Dummy Title',
    };

    fs.writeFileSync(
      metadata.filename,
      `# Dummy Title

\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
\`\`\`

Body text
`
    );

    const entry = loadEntry(metadata.filename);
    expect(entry).not.toBeNull();
    expect(entry.metadata).toEqual(metadata);
    expect(entry.metadata.tags).toBeUndefined();
    expect(entry.text).toEqual('Body text\n');
  });

  it('throws FormatError file with wrong format', () => {
    metadata = {
      date: '1970-01-01T00:00:00Z',
      filename: '1970-01-01_Th_Dummy_Title.md',
      title: 'Dummy Title',
    };

    fs.writeFileSync(
      metadata.filename,
      `# Dummy Title
Breaking text
\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
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
    const text = `\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
\`\`\`

Body text
`;

    expect(isValidEntryFormat(Buffer.from(text))).toBeTruthy();
  });

  it('accepts entry with empty body', () => {
    const text = `\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
\`\`\``;

    expect(isValidEntryFormat(Buffer.from(text))).toBeTruthy();
  });

  it('rejects non-title text before MetaData', () => {
    const text = `# Title
breaking text
\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
\`\`\`

body`;

    expect(isValidEntryFormat(Buffer.from(text))).toBeFalsy();
  });

  it('rejects broken metadata code frames', () => {
    expect(
      isValidEntryFormat(
        Buffer.from(
          `# Title
${JSON.stringify(metadata, undefined, 2)}
\`\`\`
`
        )
      )
    ).toBeFalsy();

    expect(
      isValidEntryFormat(
        Buffer.from(
          `# Title
\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
`
        )
      )
    ).toBeFalsy();

    expect(
      isValidEntryFormat(
        Buffer.from(
          `# Title
\`\`\`markdown
${JSON.stringify(metadata, undefined, 2)}
\`\`\`
`
        )
      )
    ).toBeFalsy();
  });

  it('rejects multiple title lines', () => {
    const text = `# Title
# Also a title
\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
\`\`\`
`;

    expect(isValidEntryFormat(Buffer.from(text))).toBeFalsy();
  });

  it('rejects title line that is not h1', () => {
    const text = `## Title

\`\`\`json
${JSON.stringify(metadata, undefined, 2)}
\`\`\`
`;

    expect(isValidEntryFormat(Buffer.from(text))).toBeFalsy();
  });
});

describe('extractMetaData', () => {
  it('accepts wellformed json', () => {
    fail('Test not yet written');
  });

  it('accepts when entry has multiple json blocks', () => {
    fail('Test not yet written');
  });

  it('throws FormatError missing json', () => {
    fail('Test not yet written');
  });

  it('throws FormatError malformed json', () => {
    fail('Test not yet written');
  });
});

describe('extractBodyText', () => {
  it('trims leading whitespace', () => {
    fail('Test not yet implemented');
  });

  it('trims trailing whitespace', () => {
    fail('Test not yet implemented');
  });

  it('produces empty string for an empty body', () => {
    fail('Test not yet implemented');
  });

  it('only looks for first instance of /^```$/ to find start of body text', () => {
    fail('Test not yet implemented');
  });

  it('throws FormatError for text without a /^```$/ line', () => {
    fail('Test not yet implemented');
  });
});
