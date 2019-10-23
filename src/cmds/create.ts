/**
 * The `create` command
 *
 * This command generates an empty journal entry with the current time as its
 * `date` and the given `<title>` as its `title` building the `filename` off of
 * those data. It will be default be generated in the current directory, but a
 * path elsewhere can be specified.
 *
 * @author Matt Hoiland
 * @date 2019-09-20
 * @license GPL-3.0
 */

/** Imports */
import * as fs from 'fs';
import * as path from 'path';
import * as utils from '../utils';
import { Argv, Args } from '../common.d';
import { Entry } from '../model/Entry';
import { EntryIO } from '../EntryIO';

/**
 * Usage string for the command
 */
export const command: string | string[] = 'create <title> [-p]';

/**
 * Description for the command
 */
export const describe: string | false = 'Create a new journal entry';

/**
 * Builder function which defines the arguments and options for the command
 *
 * @param yargs The yargs instance
 * @returns The yargs instance
 */
export function builder(yargs: Argv): Argv {
  return yargs
    .positional('title', {
      describe: 'Title of the entry to be made',
      type: 'string',
    })
    .option('p', {
      alias: 'path',
      default: '.',
      describe: 'The directory path to the entry location',
      type: 'string',
    });
}

/**
 * Point of entry for the command.
 *
 * @param argv The parsed arguments where `$0` is the program name, `_` is the
 *   executed command, and all other keys are arguments and their aliases.
 */
export function handler(argv: Args): Entry | null {
  if (typeof argv.title !== 'string') {
    return null;
  }
  if (typeof argv.path !== 'string') {
    return null;
  }

  const jsdate = new Date();
  const date = utils.toLocalISOString(jsdate);
  const title = argv.title;
  const filename =
    [
      date.split('T')[0],
      utils.DAY_NAMES[jsdate.getDay()],
      utils.simplifyTitle(title),
    ].join('_') + '.md';

  if (fs.existsSync(path.join(argv.path, filename))) {
    return null;
  }

  const entry = new Entry({ date, filename, title }, '');
  EntryIO.save(entry, argv.path as string);
  return entry;
}
