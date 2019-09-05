import { isValidMetaData } from './MetaData.validator';

describe('properties', () => {
  it("accepts without 'tags' property", () => {
    fail('Test not yet written');
  });

  it("accepts empty 'tags' array", () => {
    fail('Test not yet written');
  });

  it('rejects extra properties', () => {
    fail('Test not yet written');
  });

  it('rejects missing properties', () => {
    fail('Test not yet written');
  });

  it('rejects duplicate tags', () => {
    fail('Test not yet written');
  });

  it('rejects required properties on type violation', () => {
    fail('Test not yet written');
  });

  it("rejects 'tags' property on type violation", () => {
    fail('Test not yet written');
  });
});

describe('ISOTime', () => {
  it('accepts UTC', () => {
    fail('Test not yet written');
  });

  it('accepts timezone offsets', () => {
    fail('Test not yet written');
  });

  it('accepts timestamps with seconds', () => {
    fail('Test not yet written');
  });

  it('accepts timestamps without seconds', () => {
    fail('Test not yet written');
  });

  it('accepts timestamps with factional seconds', () => {
    fail('Test not yet written');
  });

  it('rejects timestamps with fractional seconds and NO seconds', () => {
    fail('Test not yet written');
  });

  it('rejects timestamps without timezone indicators', () => {
    fail('Test not yet written');
  });

  it('rejects bad ISO time', () => {
    fail('Test not yet written');
  });
});
