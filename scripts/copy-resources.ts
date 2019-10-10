/**
 * Copies all type declaration and JSON-defined object files to the output
 * directory.
 *
 * @author Matt Hoiland
 * @date 2019-09-01
 * @license GPL-3.0
 */

/** Imports */
import * as fs from 'fs';
import * as path from 'path';

const TSCONFIG = JSON.parse(fs.readFileSync('./tsconfig.json').toString('utf-8'));
let outDir = '.';
const srcDir = 'src';

if (TSCONFIG.hasOwnProperty('compilerOptions') &&
  TSCONFIG.compilerOptions.hasOwnProperty('outDir')) {
  outDir = TSCONFIG.compilerOptions.outDir;
}

function walk(dir: string, action: (file: string, dir: string) => void): void {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      walk(path.join(dir, file), action);
    }
    action(file, dir);
  }
}

const fileExtensions: RegExp[] = [
  /.*\.d\.ts/,
  /.*\.json/
];

walk(srcDir, (file, dir) => {
  // console.log({dir, file, "*.d.ts": file.match(fileExtensions[0]), "*.json": file.match(fileExtensions[1])});
  if (fileExtensions.map((exp) => file.match(exp)).reduce((a, b) => a || b)) {
    fs.mkdirSync(path.join(outDir, dir), {recursive: true});
    fs.copyFileSync(path.join(dir, file), path.join(outDir, dir, file));
  }
});
