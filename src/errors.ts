/**
 * The collection of custom error classes listed in alphabetical order.
 */

/**
 * Thrown when an object does not conform to domain defined formats.
 */
export class FormatError extends Error {}

/**
 * Thrown when a resoruce does not match the expected type.
 */
export class InvalidFileTypeError extends Error {}

/**
 * Thrown __only__ by functions (or branches of functions) that have not yet
 * been implemented.
 */
export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`${name} has not yet been implemented`);
  }
}
