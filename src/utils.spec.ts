import { loadEntry } from './utils';
import { MetaData } from './model/MetaData';
import { Entry } from './model/Entry';
import * as fs from 'fs';

const WELLFORMED_METADATA_NO_TAGS: MetaData = {
  date: '1970-01-01T00:00:00Z',
  file_name: '1970-01-01_Th_Dummy_Title.md',
  title: 'Dummy Title',
};

const TESTFILE_GOOD = `
# Dummy Title

\`\`\`json
${JSON.stringify(WELLFORMED_METADATA_NO_TAGS, undefined, 2)}
\`\`\`

Body text
`;

describe('loadEntry', () => {
  beforeAll(() => {
    fs.writeFileSync(WELLFORMED_METADATA_NO_TAGS.file_name, TESTFILE_GOOD);
  });

  afterAll(() => {
    fs.unlinkSync(WELLFORMED_METADATA_NO_TAGS.file_name);
  });

  it('rejects missing file', () => {
    loadEntry('nonexisten', (error, entry) => {
      expect(error).not.toBeNull();
      expect(error!.code).toEqual('ENOENT');
    });
  });

  // it('rejects non-text file', () => { fail(); });
  // it('accepts markdown file extension', () => { fail(); });
  //
  // describe('entry format', () => {
  //   it('rejects non-title text before MetaData', () => { fail(); });
  //   it('accepts entry without a title line', () => { fail(); });
  //   it('accepts entry with empty body', () => { fail(); });
  // });
  //
  // describe('parsing MetaData', () => {
  //   describe('json', () => {
  //     it('rejects missing json', () => { fail(); });
  //     it('rejects malformed json', () => { fail(); });
  //     it('accepts wellformed json', () => { fail(); });
  //     it('accepts when entry has multiple json blocks', () => { fail(); });
  //   });
  //
  //   describe('properties', () => {
  //     it('rejects extra properties', () => { fail(); });
  //     it('rejects missing properties', () => { fail(); });
  //     it('rejects duplicate tags', () => { fail(); });
  //     it('accepts without 'tags' propertie', () => { fail(); });
  //   });
  //
  //   describe('timestamp', () => {
  //     it('rejects bad ISO time', () => { fail(); });
  //     it('accepts UTC', () => { fail(); });
  //     it('accepts timezone offsets', () => { fail(); });
  //   });
  // });
});
