/**
 * # Utility Functions
 *
 * @author Matt Hoiland
 * @date 2019-09-24
 * @license GPL-3.0
 */

/**
 * Takes any single line string and produces a valid title part for the
 * `filename` property of [[MetaData]]. Performs the following actions:
 *
 * 1. Split string on ` ` characters
 * 2. Lowercase each substring
 * 3. Drop all non alphanumeric characters
 * 4. Throw out empty strings
 * 5. Join substrings with `_` to not exceed the given `maxLength` defaulting to
 * 32
 *
 * Due to the naïve restriction for matching the regex
 * `/[a-z0-9][a-z0-9_]+[a-z0-9]/`, the minimum string length is by consequence
 * 3. However, this function doesn't care as this will probably be patched
 * later to be more robust.
 *
 * @param title The single line string to be simplified
 * @param maxLength the length of the output string. The returned string will
 *   stop at the last word that does not exceed the max length. If assigned
 *   `false` or a value less than 0, the maxLength requirement will be ignored.
 * @returns a string matching `/[a-z0-9][a-z0-9_]+[a-z]/` whose length does not
 *   exceed `maxLength` unless `maxLength === false || maxLength < 0` in which
 *   case the string length will not be considered
 */
export function simplifyTitle(
  title: string,
  maxLength: number | false = 32
): string {
  return title
    .split(/\s+/)
    .map(s => s.toLowerCase().replace(/\W/g, ''))
    .filter(s => s.length > 0)
    .filter((s, i, a) => {
      return (
        maxLength === false ||
        maxLength < 0 ||
        a.slice(0, i).join('_').length + s.length + 1 <= maxLength
      );
    })
    .join('_');
}
