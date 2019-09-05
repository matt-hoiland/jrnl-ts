import * as fs from 'fs';
import { Entry } from './model/Entry';
import { MetaData } from './model/MetaData';
import { isBinaryFileSync } from 'isbinaryfile';
import { isValidMetaData } from './model/MetaData.validator';

export const trimr = (str: string): string => str.replace(/\s+$/, '');

export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`${name} has not yet been implemented`);
  }
}

export class FormatError extends Error {}
export class InvalidFileTypeError extends Error {}

export function loadEntry(filename: string): Entry {
  const data = loadFile(filename);
  if (!isValidEntryFormat(data)) {
    throw new FormatError(`${filename} violates required Entry format`);
  }
  const metadata = extractMetaData(data);
  const bodytext = extractBodyText(data);
  return new Entry(metadata, bodytext);
}

export function loadFile(filename: string): Buffer {
  const stats = fs.lstatSync(filename);
  const data = fs.readFileSync(filename);
  if (isBinaryFileSync(data, stats.size)) {
    throw new InvalidFileTypeError(`${filename} is not a text file`);
  }
  return data;
}

export function isValidEntryFormat(filename: string): boolean;
export function isValidEntryFormat(data: Buffer): boolean;
export function isValidEntryFormat(data: string | Buffer): boolean {
  if (typeof data === 'string') {
    return isValidEntryFormat(loadFile(data));
  } else {
    const text = data.toString('utf-8');
    const lines = text.split('\n').map(trimr);

    const mdStart = lines.findIndex(line => line.match(/^\`\`\`json$/));
    const mdEnd = lines.findIndex(line => line.match(/^\`\`\`$/));
    if (mdStart === -1 || mdEnd === -1) {
      return false;
    }

    let header = lines.slice(0, mdStart);
    if (header.length > 0) {
      header = header.filter(line => line !== '');
      if (header.length > 1 || !header[0].match(/^# .*$/)) {
        return false;
      }
    }

    return true;
  }
}

export function extractMetaData(filename: string): MetaData;
export function extractMetaData(data: Buffer): MetaData;
export function extractMetaData(data: string | Buffer): MetaData {
  if (typeof data === 'string') {
    return extractMetaData(loadFile(data));
  } else {
    throw new NotImplementedError('extractMetaData');
  }
}

export function extractBodyText(filename: string): string;
export function extractBodyText(data: Buffer): string;
export function extractBodyText(data: string | Buffer): string {
  if (typeof data === 'string') {
    return extractBodyText(loadFile(data));
  } else {
    throw new NotImplementedError('extractBodyText');
  }
}
