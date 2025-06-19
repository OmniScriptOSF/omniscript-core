import { readFileSync } from 'fs';
import { parse } from '../../parser/src';

const file = process.argv[2];
const text = readFileSync(file, 'utf8');
const doc = parse(text);
console.log(JSON.stringify(doc, null, 2));
