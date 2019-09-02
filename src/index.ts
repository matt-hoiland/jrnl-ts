#!/usr/bin/env node

import { argv, exit } from 'process';
import * as yargs from 'yargs';
import { createCommand } from './create';

export function main(args: string[]) {
  console.log('Hello, World! It is a change!');
  return 0;
}

if (require.main === module) {
  const argv = yargs
    .usage('$0 [-h] [-v|-q] [--version] <command> ...')
    // .command('create <title>', 'Create a new journal entry', yargs => {
    //   return yargs.positional('title', {
    //     desc: 'Title of the entry to be made',
    //     type: 'string'
    //   });
    // })
    .command(createCommand)
    .command('list [--oneline]', 'List all existing entries', yargs => {
      return yargs.option('oneline', {
        desc: 'Use one line per entry',
        type: 'boolean',
      });
    })
    .option('verbose', {
      alias: 'v',
      description: 'Execute with verbose output',
      type: 'boolean',
    })
    .option('quiet', {
      alias: 'q',
      description: 'Execute while supressing output',
      type: 'boolean',
    })
    .conflicts('verbose', 'quiet')
    .help('help', 'Show this help message and exit')
    .alias('help', 'h')
    .describe('version', 'Show version number and exit')
    .parse();

  console.dir(argv);

  // const status = main(argv);
  // exit(status);
}
