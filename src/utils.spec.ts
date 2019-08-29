import { loadEntry, FileNotFoundError } from './utils';
import { MetaData } from './model/MetaData';
import { Entry } from './model/Entry';
import * as fs from 'fs';

const WELLFORMED_METADATA_NO_TAGS: MetaData = {
  date: "1970-01-01T00:00:00Z",
  file_name: "1970-01-01_Th_Dummy_Title.md",
  title: "Dummy Title"
};

const TESTFILE = `
# Dummy Title

\`\`\`json
${JSON.stringify(WELLFORMED_METADATA_NO_TAGS, undefined, 2)}
\`\`\`

Body text
`;

describe("loadEntry", () => {

  beforeAll(() => {
    fs.writeFileSync(WELLFORMED_METADATA_NO_TAGS.file_name, TESTFILE);
  });

  afterAll(() => {
    fs.unlinkSync(WELLFORMED_METADATA_NO_TAGS.file_name);
  });

  it("should throw an error for a missing entry", () => {
    const file = 'nonexistent';
    expect(() => loadEntry(file)).toThrow(new FileNotFoundError(file));
  });

  it("should successfully load good data", () => {
    let entry: Entry | null = null;

    entry = loadEntry(WELLFORMED_METADATA_NO_TAGS.file_name);

    expect(entry).not.toBeNull();
  });
});
