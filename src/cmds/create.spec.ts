/**
 * Unit tests for `./create.ts`
 *
 * @author Matt Hoiland
 * @date 2019-09-20
 * @license GPL-3.0
 */

/** Imports */
import * as fs from 'fs';
import * as path from 'path';
import { Args } from '../common.d';
import { handler } from './create';

/**
 * `create.handler` tests
 */
describe('create.hanlder', () => {
  it('creates a new entry given correct input', () => {
    const args: Args = {
      $0: 'jrnl',
      _: ['create'],
      p: '.',
      path: '.',
      title: 'First Entry Ever!',
    };

    const result = handler(args);
    expect(result).not.toBeNull();
    if (result != null) {
      expect(result.metadata.title).toEqual(args['title'] as string);
      expect(fs.existsSync(result.metadata.filename)).toBeTruthy();
      fs.unlink(result.metadata.filename, () => {});
    }
  });

  it('creates a new entry at the designated path', () => {
    const args: Args = {
      $0: 'jrnl',
      _: ['create'],
      p: './spec',
      path: './spec',
      title: 'First Entry Ever!',
    };

    const result = handler(args);
    expect(result).not.toBeNull();
    if (result != null) {
      expect(result.metadata.title).toEqual(args['title'] as string);
      expect(
        fs.existsSync(path.join(args['p'] as string, result.metadata.filename))
      ).toBeTruthy();
      fs.unlink(
        path.join(args['p'] as string, result.metadata.filename),
        () => {}
      );
    }
  });

  it('does not create an entry if one of the same filename already exists', () => {
    const args: Args = {
      $0: 'jrnl',
      _: ['create'],
      p: '.',
      path: '.',
      title: 'First Entry Ever!',
    };

    const entry = handler(args);
    const result = handler(args);
    expect(result).toBeNull();

    if (entry != null) {
      fs.unlink(
        path.join(args['p'] as string, entry.metadata.filename),
        () => {}
      );
    }
  });
});
