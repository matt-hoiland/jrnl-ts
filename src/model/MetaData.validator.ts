import { MetaData } from './MetaData';
import * as Ajv from 'ajv';

const ajv = new Ajv();
const schema = ajv.compile(require('./MetaData.json'));

export function isValidMetaData(candidate: any): candidate is MetaData {
  return schema(candidate) === true;
}