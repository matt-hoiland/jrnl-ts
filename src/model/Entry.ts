import { MetaData } from './MetaData';

/**
 * Simple data model for a journal entry.
 */
export class Entry {
  /**
   * @param metadata The file's MetaData.
   * @param text The file's body text. Contains everything that follows the
   *   MetaData code fence with leading and trailing whitespace trimmed.
   */
  constructor(public metadata: MetaData, public text: string) {}
}
