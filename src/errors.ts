export class FormatError extends Error {}

export class InvalidFileTypeError extends Error {}

export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`${name} has not yet been implemented`);
  }
}
