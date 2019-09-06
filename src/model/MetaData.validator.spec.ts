import { isValidMetaData } from './MetaData.validator';

describe('properties', () => {
  it("accepts without 'tags' property", () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: '',
      })
    ).toBeTruthy();
  });

  it("accepts empty 'tags' array", () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: '',
        tags: [],
      })
    ).toBeTruthy();
  });

  it('rejects extra properties', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: '',
        star: true,
      })
    ).toBeFalsy();
  });

  it('rejects missing properties', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        title: '',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        filename: '',
        title: '',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
      })
    ).toBeFalsy();
  });

  it('rejects duplicate tags', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: '',
        tags: ['a', 'b', 'a'],
      })
    ).toBeFalsy();
  });

  it('rejects required properties on type violation', () => {
    expect(
      isValidMetaData({
        date: 0,
        filename: '',
        title: '',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: true,
        title: '',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: {},
      })
    ).toBeFalsy();
  });

  it("rejects 'tags' property on type violation", () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: '',
        tags: 'star',
      })
    ).toBeFalsy();
  });
});

describe('ISOTime', () => {
  it('accepts UTC', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: '',
      })
    ).toBeTruthy();
  });

  it('accepts timezone offsets', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00-06:00',
        filename: '',
        title: '',
      })
    ).toBeTruthy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00.0000-06:00',
        filename: '',
        title: '',
      })
    ).toBeTruthy();
  });

  it('accepts timestamps with seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '',
        title: '',
      })
    ).toBeTruthy();
  });

  it('accepts timestamps with factional seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00.0000Z',
        filename: '',
        title: '',
      })
    ).toBeTruthy();
  });

  it('rejects timestamps without seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00Z',
        filename: '',
        title: '',
      })
    ).toBeFalsy();
  });

  it('rejects timestamps with fractional seconds and NO seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00.0000Z',
        filename: '',
        title: '',
      })
    ).toBeFalsy();
  });

  it('rejects timestamps without timezone indicators', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00',
        filename: '',
        title: '',
      })
    ).toBeFalsy();
  });

  it('rejects bad ISO time', () => {
    expect(
      isValidMetaData({
        date: '70-01-01T00:00Z',
        filename: '',
        title: '',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01 00:00Z',
        filename: '',
        title: '',
      })
    ).toBeFalsy();
  });
});
