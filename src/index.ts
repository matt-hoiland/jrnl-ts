#!/usr/bin/env node

import { argv, exit } from 'process';

export function main(args: string[]) {
  console.log('Hello, World! It is a change!');
  return 0;
}

if (require.main === module) {
  const status = main(argv);
  exit(status);
}
