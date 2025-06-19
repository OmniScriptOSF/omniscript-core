const { execFileSync } = require('child_process');
const path = require('path');
const file = path.resolve(__dirname, '../../examples/test_minimal.osf');
const out = execFileSync('node', [require.resolve('../bin/osf.js'), 'parse', file], { encoding: 'utf8' });
const result = JSON.parse(out);
if (!Array.isArray(result.blocks)) {
  throw new Error('parse failed');
}
