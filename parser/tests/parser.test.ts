const { parse, serialize } = require('../src');

const sample = '@doc {\nHello\n}';
const doc = parse(sample);
if (serialize(doc) !== sample) {
  throw new Error('round trip failed');
}
