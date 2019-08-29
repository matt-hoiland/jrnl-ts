#!/usr/bin/env node

const fs = require('fs');
const jsonts = require('json-schema-to-typescript');
const path = require('path');
const process = require('process');

const SCHEMAS_DIR = path.join('src', 'model');
const TYPES_DIR = path.join('src', 'model');
const VALIDATORS_DIR = path.join('src', 'model');

const F_OK = fs.constants.F_OK;
const R_OK = fs.constants.R_OK;
const W_OK = fs.constants.W_OK;

function isDirectoryReady(path) {
  try {
    fs.accessSync(path, F_OK|R_OK|W_OK)
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
}

if (!isDirectoryReady(SCHEMAS_DIR)) {
  console.error(`No schemas directory: ${SCHEMAS_DIR}`);
  process.exit();
}

if (!isDirectoryReady(TYPES_DIR)) {
  fs.mkdirSync(TYPES_DIR);
}

if (!isDirectoryReady(VALIDATORS_DIR)) {
  fs.mkdirSync(VALIDATORS_DIR);
}

const schemas = fs.readdirSync(SCHEMAS_DIR).filter(f => path.extname(f) === '.json');

for (const schema of schemas) {
  try {
    const basename = path.basename(schema, '.json');
    jsonts
      .compileFromFile(path.join(SCHEMAS_DIR, schema))
      .then(ts => fs.writeFileSync(path.join(TYPES_DIR, basename + '.d.ts'), ts));

    const validator = `
import { ${basename} } from './${basename}';
import * as Ajv from 'ajv';

const ajv = new Ajv();
const schema = ajv.compile(require('../schemas/metadata.json'));

export function isValid${basename}(candidate: any): candidate is ${basename} {
  return schema(candidate) === true;
}
`
    fs.writeFileSync(path.join(VALIDATORS_DIR, basename + '.validator.ts'), validator);

  } catch (err) {
    console.error(err);
  }
}
