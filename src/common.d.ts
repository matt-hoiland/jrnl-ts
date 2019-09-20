export { Argv } from 'yargs';

export interface Args {
  [argName: string]: unknown;
  _: string[];
  $0: string;
}
