import { Entry } from './model/Entry';

export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`${name} has not yet been implemented`);
  }
}
export class FileNotFoundError extends Error {
  constructor(filename: string) {
    super(`File ${filename} not found`);
  }
}

export function loadEntry(filename: string): Entry {
  throw new NotImplementedError('loadEntry');
}
