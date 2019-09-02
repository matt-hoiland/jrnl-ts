import * as yargs from 'yargs';

export const createCommand: yargs.CommandModule = {
  command: 'create <title>',
  describe: 'Create a new journal entry',
  builder: yargs => {
    return yargs.positional('title', {
      desc: 'Title of the entry to be made',
      type: 'string',
    });
  },
  handler: argv => console.dir(argv),
};

// export const command = 'create <title>';
// export const aliases = null;
// export const describe = 'Create a new journal entry';
//
// export const builder = {
//   title: {
//     desc: 'Title of the entry to be made',
//     type: 'string'
//   }
// }

// export function handler(argv: yargs.Argv<{}>) {
//   console.dir(argv);
// }
