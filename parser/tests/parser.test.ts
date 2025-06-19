const { parse, serialize } = require('../src');
const { readFileSync } = require('fs');

const sample = readFileSync(require.resolve('../../examples/test_minimal.osf'), 'utf8');
const doc = parse(sample);
const round = serialize(doc);
const again = parse(round);
if (JSON.stringify(doc) !== JSON.stringify(again)) {
  throw new Error('round trip failed');
}

const meta = doc.blocks[0];
if (meta.type !== 'meta' || meta.props.title !== 'Demo') {
  throw new Error('meta block missing');
}

const slide = doc.blocks.find(b => b.type === 'slide');
if (!slide || !Array.isArray(slide.bullets) || slide.bullets.length !== 2) {
  throw new Error('slide parsing failed');
}

const sheet = doc.blocks.find(b => b.type === 'sheet');
if (!sheet || !Array.isArray(sheet.cols) || sheet.cols[0] !== 'A') {
  throw new Error('sheet cols parse failed');
}
