import * as fs from 'fs';
import * as path from 'path';
import { isBinaryFileSync } from 'isbinaryfile';

import { FormatError, InvalidFileTypeError } from './errors';
import { Entry } from './model/Entry';
import { MetaData } from './model/MetaData';
import { isValidMetaData } from './model/MetaData.validator';

/**
 * Entry read & write operations as well as some siple format validation
 */
export class EntryIO {
  /**
   * Loads the given filename as a newly constructed Entry object
   *
   * @param filename Path to journal entry document. The given file must conform
   *   to the defined journal entry format in both contents and filename.
   * @returns A newly constructed Entry object containing the data from the
   *   given file.
   * @throws [[FormatError]] when the contents of the file violate the defined
   *   journal entry format.
   * @throws [[InvalidFileTypeError]] when the given path does not lead to a
   *   text file.
   */
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
   * @param dir the path-like string pointing to the directory to be saved.
   * @throws [[InvalidFileTypeError]] if `path` does not point to a directory
   *   (including if the path doesn't exist)
   * @throws [[FormatError]] if `entry.metadata` does not conform to schema
   *   [[isValidMetaData]]
   */
  static save(entry: Entry, dir = '.'): void {
    if (!fs.existsSync(dir)) {
      throw new InvalidFileTypeError(`Path ${dir} does not exist`);
    }
    if (!fs.statSync(dir).isDirectory()) {
      throw new InvalidFileTypeError(`${dir} is not a directory`);
    }
    if (!isValidMetaData(entry.metadata)) {
      throw new FormatError(`Entry contains corrupted metadata`);
    }

    fs.writeFileSync(path.join(dir, entry.metadata.filename), entry.toString());
  }

  /**
   * Tests the contents of the given file for conformance to the defined journal
   * entry format
   *
   * @param filename Path to file
   * @returns `true` if file contents conforms to format, `false` otherwise
   */
  static isValidFormat(filename: string): boolean;
  /**
   * Tests the contents of the given buffer for conformance to the defined
   * journal entry format
   *
   * @param data The buffer to test
   * @returns `true` if buffer contents conforms to format, `false` otherwise
   */
  static isValidFormat(data: Buffer): boolean;
  // isValidFormat implementation
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

  /**
   * Extracts the text following the [[MetaData]] section of the journal entry
   * from the given file.
   *
   * @param filename Path to file
   * @returns The body text trimmed of leading and trailing whitespace
   */
  static extractBodyText(filename: string): string;
  /**
   * Extracts the text following the [[MetaData]] section of the journal entry
   * from the given buffer.
   *
   * @param data Buffer from which to pull the text
   * @returns The body text trimmed of leading and trailing whitespeace
   */
  static extractBodyText(data: Buffer): string;
  // extractBodyText implementation
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

  /**
   * Extracts the [[MetaData]] from the given file.
   *
   * @param filename Path to file
   * @returns The [[MetaData]] of the file
   * @throws [[FormatError]] when the markdown code fence is missing __or__ when
   *   the extracted JSON violates the schema
   */
  static extractMetaData(filename: string): MetaData;
  /**
   * Extracts the [[MetaData]] from the given buffer.
   *
   * @param data Buffer from which to extract the data
   * @returns The [[MetaData]] of the file
   * @throws [[FormatError]] when the markdown code fence is missing __or__ when
   *   the extracted JSON violates the schema
   */
  static extractMetaData(data: Buffer): MetaData;
  // extractMetaData implementation
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

  /**
   * Decodes buffer using `utf-8`, splits the text into lines, and locates the
   * starting and ending lines of the first code fence, returning each as a
   * 4-tuple in that order.
   *
   * @param data Buffer to decode
   * @returns 0. decoded text
   * 1. same text split into lines
   * 2. starting index of first code fence or -1 if none found
   * 3. terminating index of first code fence or -1 if none found
   */
  private static decodeBuffer(
    data: Buffer
  ): [string, string[], number, number] {
    const text = data.toString('utf-8');
    const lines = text.split('\n').map(line => line.trimRight());

    const mdStart = lines.findIndex(line => line.match(/^\`\`\`json$/));
    const mdEnd = lines.findIndex(line => line.match(/^\`\`\`$/));
    return [text, lines, mdStart, mdEnd];
  }

  /**
   * Loads the given file to a Buffer and checks if it is a text file.
   *
   * @param filename Path to file
   * @returns Buffer containing the text of the file
   * @throws [[InvalidFileTypeError]] when the given file is not a text file
   */
  private static loadFile(filename: string): Buffer {
    const stats = fs.lstatSync(filename);
    const data = fs.readFileSync(filename);
    if (isBinaryFileSync(data, stats.size)) {
      throw new InvalidFileTypeError(`${filename} is not a text file`);
    }
    return data;
  }
}
