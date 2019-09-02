import * as fs from 'fs';
import { Entry } from './model/Entry';
import { isBinaryFileSync } from 'isbinaryfile';
import { isValidMetaData } from './model/MetaData.validator';

export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`${name} has not yet been implemented`);
  }
}

/**
 * loadEntry - asynchronously load Entry from file
 *
 * @param  {string} filename  path to file to be loaded
 * @return  {Entry | null} cb callback to be executed on success or fail
 * @throws {NodeJS.ErrnoException} Error if file not found, incorrect file type, etc.
 */
export function loadEntry(filename: string): Entry | null {
  try {
    const stats = fs.lstatSync(filename);
    const data = fs.readFileSync(filename);
    if (isBinaryFileSync(data, stats.size)) {
      const err: NodeJS.ErrnoException = new Error(
        `${filename} not a text file`
      );
      err.code = 'ERR_INVALID_FD_TYPE';
      throw err;
    }

    const text = data.toString('utf-8');
    const lines = text.split('\n').map(line => line.replace(/\s+$/, ''));
    const blockOpen = lines.findIndex((line, i, a) => line === '```json');
    const blockClose = lines.findIndex((line, i, a) => line === '```');
    const mdText = lines.slice(blockOpen + 1, blockClose).join('\n');

    const metadata = JSON.parse(mdText);

    let bodyOpen = blockClose + 1;
    while (bodyOpen < lines.length && lines[bodyOpen] === '') {
      bodyOpen++;
    }

    if (isValidMetaData(metadata)) {
      return new Entry(metadata, lines.splice(bodyOpen).join('\n'));
    }

    return null;
  } catch (err) {
    throw err;
  }
}
