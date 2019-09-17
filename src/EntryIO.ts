import * as fs from 'fs';
import { isBinaryFileSync } from 'isbinaryfile';

import {
  FormatError,
  InvalidFileTypeError,
  NotImplementedError,
} from './errors';
import { Entry } from './model/Entry';
import { MetaData } from './model/MetaData';
import { isValidMetaData } from './model/MetaData.validator';
import { trimr } from './utils';

export class EntryIO {
  static load(filename: string): Entry {
    const data = EntryIO.loadFile(filename);
    if (!EntryIO.isValidFormat(data)) {
      throw new FormatError(`${filename} violates required Entry format`);
    }
    const metadata = EntryIO.extractMetaData(data);
    const bodytext = EntryIO.extractBodyText(data);
    return new Entry(metadata, bodytext);
  }

  /**
   * Save `entry` to file using its filename found in its [[MetaData]].
   * Optionally specify a target directory.
   *
   * @param entry The entry to be saved
   * @param path the path-like string pointing to the directory to be saved.
   * @throws [[InvalidFileTypeError]] if `path` does not point to a directory
   *   (including if the path doesn't exist)
   * @throws [[FormatError]] if `entry.metadata` does not conform to schema
   *   [[isValidMetaData]]
   */
  static save(entry: Entry, path = '.'): void {
    throw new NotImplementedError('EntryIO.save');
  }

  static isValidFormat(filename: string): boolean;
  static isValidFormat(data: Buffer): boolean;
  static isValidFormat(data: string | Buffer): boolean {
    if (typeof data === 'string') {
      return EntryIO.isValidFormat(EntryIO.loadFile(data));
    } else {
      const [text, lines, mdStart, mdEnd] = EntryIO.decodeBuffer(data);

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

  static extractBodyText(filename: string): string;
  static extractBodyText(data: Buffer): string;
  static extractBodyText(data: string | Buffer): string {
    if (typeof data === 'string') {
      return EntryIO.extractBodyText(EntryIO.loadFile(data));
    } else {
      const [text, lines, mdStart, mdEnd] = EntryIO.decodeBuffer(data);

      if (mdEnd === -1) {
        throw new FormatError(
          'ending markdown code fence missing for body text'
        );
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

  static extractMetaData(filename: string): MetaData;
  static extractMetaData(data: Buffer): MetaData;
  static extractMetaData(data: string | Buffer): MetaData {
    if (typeof data === 'string') {
      return EntryIO.extractMetaData(EntryIO.loadFile(data));
    } else {
      const [text, lines, mdStart, mdEnd] = EntryIO.decodeBuffer(data);

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

  private static decodeBuffer(
    data: Buffer
  ): [string, string[], number, number] {
    const text = data.toString('utf-8');
    const lines = text.split('\n').map(trimr);

    const mdStart = lines.findIndex(line => line.match(/^\`\`\`json$/));
    const mdEnd = lines.findIndex(line => line.match(/^\`\`\`$/));
    return [text, lines, mdStart, mdEnd];
  }

  private static loadFile(filename: string): Buffer {
    const stats = fs.lstatSync(filename);
    const data = fs.readFileSync(filename);
    if (isBinaryFileSync(data, stats.size)) {
      throw new InvalidFileTypeError(`${filename} is not a text file`);
    }
    return data;
  }
}
