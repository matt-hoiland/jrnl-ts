export { Argv } from 'yargs';

export interface Args {
  [argName: string]: string[] | string;
  _: string[];
  $0: string;
}
