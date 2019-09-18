import { MetaData } from './MetaData';
import * as Ajv from 'ajv';

/**
 * Ajv instance used to compile the validation function the schema from
 * source
 */
const ajv = new Ajv();
/**
 * The compiled validation function
 */
const schema = ajv.compile(require('./MetaData.json'));

/**
 * The typeguard for the generated schema
 *
 * @param candidate the object to be type checked
 * @return `true` if candidate is a valid instance of MetaData,
 *   `false` otherwise
 */
export function isValidMetaData(candidate: any): candidate is MetaData {
  return schema(candidate) === true;
}
