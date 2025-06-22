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

let threw = false;
try {
  parse('@meta { 1abc: true; }');
} catch (e) {
  threw = true;
}
if (!threw) {
  throw new Error('digits cannot start an identifier');
}

threw = false;
try {
  parse('@meta { _abc: true; }');
} catch (e) {
  threw = true;
}
if (!threw) {
  throw new Error('underscores cannot start an identifier');
}

threw = false;
try {
  parse('@meta { foo: _bar; }');
} catch (e) {
  threw = true;
}
if (!threw) {
  throw new Error('underscores cannot start identifier values');
}

threw = false;
try {
  parse('@meta { foo: 1bar; }');
} catch (e) {
  threw = true;
}
if (!threw) {
  throw new Error('digits cannot start identifier values');
}
