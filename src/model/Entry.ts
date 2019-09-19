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

  /**
   *
   */
  toString(): string {
    // Not dedented because of JSON stringification
    return `# ${this.metadata.title}

\`\`\`json
${JSON.stringify(this.metadata, undefined, 2)}
\`\`\`

${this.text}
`;
  }
}
