const { parse, serialize } = require('../src');

const sample = '@doc {\nHello\n}';
const doc = parse(sample);
if (serialize(doc) !== sample) {
  throw new Error('round trip failed');
}

const complex = `@meta {\n  tags: [a, b, c];\n  settings: {enabled: true; count: 2;};\n}\n`;
const parsed = parse(complex);
if (parsed.blocks[0].type !== 'meta' || parsed.blocks[0].props.tags[1] !== 'b') {
  throw new Error('complex parse failed');
}
const out = serialize(parsed);
parse(out); // should round trip without throwing

const { readFileSync } = require('fs');
const { join } = require('path');
const invalid = readFileSync(join(__dirname, '../../examples/invalid_syntax.osf'), 'utf8');
let threw = false;
try {
  parse(invalid);
} catch (e) {
  threw = true;
}
if (!threw) {
  throw new Error('parser should throw on invalid syntax');
}
