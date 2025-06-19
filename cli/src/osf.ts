import { readFileSync } from 'fs';
import { parse } from '../../parser/dist';

function load(file: string): string {
  return readFileSync(file, 'utf8');
}

const [, , command, ...rest] = process.argv;

switch (command) {
  case 'parse': {
    const text = load(rest[0]);
    const doc = parse(text);
    console.log(JSON.stringify(doc, null, 2));
    break;
  }
  case 'lint': {
    try {
      parse(load(rest[0]));
      console.log('OK');
    } catch (err: any) {
      console.error(`Lint error: ${err.message}`);
      process.exit(1);
    }
    break;
  }
  case 'diff': {
    const docA = parse(load(rest[0]));
    const docB = parse(load(rest[1]));
    const same = JSON.stringify(docA) === JSON.stringify(docB);
    console.log(same ? 'No differences' : 'Documents differ');
    if (!same) process.exit(1);
    break;
  }
  default:
    console.log('Usage: osf <parse|lint|diff> <files...>');
}
