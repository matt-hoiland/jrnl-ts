/**
 * Utility Function Tests
 *
 * @author Matt Hoiland
 * @date 2019-09-25
 * @license GPL-3.0
 */

/** Imports */
import * as utils from './utils';

describe('utils.simplifyTitle', () => {
  const tcs: Array<{ i: string; o: string; n?: number | false }> = [
    { i: 'hello', o: 'hello' },
    { i: '', o: '' },
    { i: 'SpongeBob', o: 'spongebob' },
    { i: 'Hello, World!', o: 'hello_world' },
    { i: "Lot's of stuff! Yeah.", o: 'lots_of_stuff_yeah' },
    {
      i: 'abc def ghi jkl mno pqr stu vwx yz',
      o: 'abc_def_ghi_jkl_mno_pqr_stu_vwx',
    },
    {
      i: 'abc def ghi jkl mno pqr stu vwx yz',
      o: 'abc_def_ghi_jkl_mno_pqr_stu_vwx_zy',
      n: false,
    },
    {
      i: 'abc def ghi jkl mno pqr stu vwx yz',
      o: 'abc_def_ghi_jkl_mno_pqr_stu_vwx_zy',
      n: -1,
    },
    { i: 'abc def ghi jkl mno pqr stu vwx yz', o: 'abc_def', n: 8 },
    { i: 'abc def ghi jkl mno pqr stu vwx yz', o: 'abc_def', n: 9 },
    { i: 'abc def ghi jkl mno pqr stu vwx yz', o: 'abc_def', n: 10 },
    { i: 'abc def ghi jkl mno pqr stu vwx yz', o: 'abc_def_ghi', n: 11 },
    { i: 'abc def ghi jkl mno pqr stu vwx yz', o: 'abc_def_ghi', n: 12 },
  ];

  it('simplifies', () => {
    for (const { i, o, n = 32 } of tcs) {
      expect(utils.simplifyTitle(i, n)).withContext(`${n} | '${i}'`).toEqual(o);
    }
  });
});
