import * as fs from 'fs';
import { Entry } from './model/Entry';

export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`${name} has not yet been implemented`);
  }
}

/**
 * loadEntry - asynchronously load Entry from file
 *
 * @param  {string} filename  path to file to be loaded
 * @param  {(NodeJS.ErrnoException | null, Entry) => void} cb callback to be executed on success or fail
 */
export function loadEntry(
  filename: string,
  cb: (error: NodeJS.ErrnoException | null, entry?: Entry) => void
): void {
  fs.readFile(filename, (error, data) => {
    cb(error);
  });
}
