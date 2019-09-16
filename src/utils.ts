import * as fs from 'fs';
import { isBinaryFileSync } from 'isbinaryfile';

import { FormatError, InvalidFileTypeError } from './errors';
import { Entry } from './model/Entry';
import { MetaData } from './model/MetaData';
import { isValidMetaData } from './model/MetaData.validator';

export const trimr = (str: string): string => str.replace(/\s+$/, '');

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

function decodeBuffer(data: Buffer): [string, string[], number, number] {
  const text = data.toString('utf-8');
  const lines = text.split('\n').map(trimr);

  const mdStart = lines.findIndex(line => line.match(/^\`\`\`json$/));
  const mdEnd = lines.findIndex(line => line.match(/^\`\`\`$/));
  return [text, lines, mdStart, mdEnd];
}

export function isValidEntryFormat(filename: string): boolean;
export function isValidEntryFormat(data: Buffer): boolean;
export function isValidEntryFormat(data: string | Buffer): boolean {
  if (typeof data === 'string') {
    return isValidEntryFormat(loadFile(data));
  } else {
    const [text, lines, mdStart, mdEnd] = decodeBuffer(data);

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
    const [text, lines, mdStart, mdEnd] = decodeBuffer(data);

    if (mdStart === -1 || mdEnd === -1) {
      throw new FormatError('markdown code fencing missing for MetaData');
    }

    const mdText = lines.slice(mdStart + 1, mdEnd).join('\n');
    const metadata = JSON.parse(mdText);

    if (isValidMetaData(metadata)) {
      return metadata;
    } else {
      throw new FormatError(
        `MetaData schema violation: ${JSON.stringify(metadata)}`
      );
    }
  }
}

export function extractBodyText(filename: string): string;
export function extractBodyText(data: Buffer): string;
export function extractBodyText(data: string | Buffer): string {
  if (typeof data === 'string') {
    return extractBodyText(loadFile(data));
  } else {
    const [text, lines, mdStart, mdEnd] = decodeBuffer(data);

    if (mdEnd === -1) {
      throw new FormatError('ending markdown code fence missing for body text');
    }

    let [a, b] = [mdEnd + 1, lines.length - 1];

    // Trim leading empty lines
    for (let i = a; i < lines.length; i++) {
      if (!lines[i].match(/^\s*$/)) {
        a = i;
        break;
      }
    }

    // Trim trailing empty lines
    for (let i = b; i > mdEnd; i--) {
      if (!lines[i].match(/^\s*$/)) {
        b = i + 1;
        break;
      }
    }

    return lines.slice(a, b).join('\n');
  }
}
