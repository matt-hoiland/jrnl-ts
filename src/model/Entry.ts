import { isValidMetaData } from './MetaData.validator';
import { MetaData } from './MetaData';

export class Entry {
  constructor(public metadata: MetaData, public text: string) {}
}
