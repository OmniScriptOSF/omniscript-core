const { execFileSync } = require('child_process');
const path = require('path');
const cli = require.resolve('../bin/osf.js');
const file = path.resolve(__dirname, '../../examples/test_minimal.osf');

const md = execFileSync('node', [cli, 'export', file], { encoding: 'utf8' });
if (!md.includes('## Intro') && !md.includes('Hello World')) {
  throw new Error('export output missing expected content');
}
