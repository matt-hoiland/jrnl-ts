import { isValidMetaData } from './MetaData.validator';

describe('properties', () => {
  it("accepts without 'tags' property", () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeTruthy();
  });

  it("accepts empty 'tags' array", () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
        tags: [],
      })
    ).toBeTruthy();
  });

  it('rejects extra properties', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
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
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
      })
    ).toBeFalsy();
  });

  it('rejects duplicate tags', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
        tags: ['a', 'b', 'a'],
      })
    ).toBeFalsy();
  });

  it('rejects required properties on type violation', () => {
    expect(
      isValidMetaData({
        date: 0,
        filename: '1970-01-01_Th.md',
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
        filename: '1970-01-01_Th.md',
        title: {},
      })
    ).toBeFalsy();
  });

  it("rejects 'tags' property on type violation", () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
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
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeTruthy();
  });

  it('accepts timezone offsets', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00-06:00',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeTruthy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00.0000-06:00',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeTruthy();
  });

  it('accepts timestamps with seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeTruthy();
  });

  it('accepts timestamps with factional seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00.0000Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeTruthy();
  });

  it('rejects timestamps without seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeFalsy();
  });

  it('rejects timestamps with fractional seconds and NO seconds', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00.0000Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeFalsy();
  });

  it('rejects timestamps without timezone indicators', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeFalsy();
  });

  it('rejects bad ISO time', () => {
    expect(
      isValidMetaData({
        date: '70-01-01T00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01 00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeFalsy();
  });
});

describe('filename', () => {
  it('accepts names without the title part', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th.md',
        title: '',
      })
    ).toBeTruthy();
  });

  it('accepts names with the title part', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_Th_this_is_a_nightmare.md',
        title: 'This is a nightmare',
      })
    ).toBeTruthy();
  });

  it('rejects missing weekday', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '1970-01-01_this_is_a_nightmare.md',
        title: 'This is a nightmare',
      })
    ).toBeFalsy();
  });

  it('rejects bad date format', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '70-01-01_Th_this_is_a_nightmare.md',
        title: 'This is a nightmare',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '70-01-01_Th.md',
        title: 'This is a nightmare',
      })
    ).toBeFalsy();
  });

  it('rejects titles with non word characters', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: "70-01-01_Th_abc 098 ! let's.md",
        title: 'This is a nightmare',
      })
    ).toBeFalsy();
  });

  it('rejects titles with capital characters', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '70-01-01_Th_This_is_a_nightmare.md',
        title: 'This is a nightmare',
      })
    ).toBeFalsy();
  });

  it('rejects titles with trailing and leading underscores', () => {
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '70-01-01_Th__what.md',
        title: 'This is a nightmare',
      })
    ).toBeFalsy();
    expect(
      isValidMetaData({
        date: '1970-01-01T00:00:00Z',
        filename: '70-01-01_Th_what_.md',
        title: 'This is a nightmare',
      })
    ).toBeFalsy();
  });
});
