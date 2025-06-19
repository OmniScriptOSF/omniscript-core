const { execFileSync } = require('child_process');
const path = require('path');
const file = path.resolve(__dirname, '../../examples/test_minimal.osf');
const out = execFileSync('node', [require.resolve('../bin/osf.js'), 'parse', file], { encoding: 'utf8' });
const result = JSON.parse(out);
if (!Array.isArray(result.blocks) || result.blocks.length !== 4) {
  throw new Error('parse failed');
}
const sheet = result.blocks.find(b => b.type === 'sheet');
if (!Array.isArray(sheet.cols)) {
  throw new Error('sheet cols not parsed');
}
if (!sheet.formulas || sheet.formulas[0].expr !== '=A1') {
  throw new Error('sheet formula missing');
}
const slide = result.blocks.find(b => b.type === 'slide');
if (!slide || slide.bullets[1] !== 'Second') {
  throw new Error('slide bullets missing');
}
