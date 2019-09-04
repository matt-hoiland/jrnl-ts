import * as fs from 'fs';
import { Entry } from './model/Entry';
import { MetaData } from './model/MetaData';
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
export function loadEntry(filename: string): Entry {
  try {
    const data = loadFile(filename);
    if (!isValidEntryFormat(data)) {
      throw new NotImplementedError('loadEntry#!isValidEntryFormat');
    }
    const metadata = extractMetaData(data);
    const bodytext = extractBodyText(data);
    return new Entry(metadata, bodytext);
  } catch (err) {
    throw err;
  }
}

export function loadFile(filename: string): Buffer {
  const stats = fs.lstatSync(filename);
  const data = fs.readFileSync(filename);
  if (isBinaryFileSync(data, stats.size)) {
    const err: NodeJS.ErrnoException = new Error(
      `${filename} not a text file`
    );
    err.code = 'ERR_INVALID_FD_TYPE';
    throw err;
  }
  return data;
}

export function isValidEntryFormat(filename: string): boolean;
export function isValidEntryFormat(data: Buffer): boolean;
export function isValidEntryFormat(data: string | Buffer): boolean {
  if (typeof(data) === 'string') {
    return isValidEntryFormat(loadFile(data));
  } else {
    throw new NotImplementedError('isValidEntryFormat');
  }
}

export function extractMetaData(filename: string): MetaData;
export function extractMetaData(data: Buffer): MetaData;
export function extractMetaData(data: string | Buffer): MetaData {
  if (typeof(data) === 'string') {
    return extractMetaData(loadFile(data));
  } else {
    throw new NotImplementedError('extractMetaData');
  }
}

export function extractBodyText(filename: string): string;
export function extractBodyText(data: Buffer): string;
export function extractBodyText(data: string | Buffer): string {
  if (typeof(data) === 'string') {
    return extractBodyText(loadFile(data));
  } else {
    throw new NotImplementedError('extractBodyText');
  }
}
