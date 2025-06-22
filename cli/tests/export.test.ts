const { execFileSync } = require('child_process');
const path = require('path');
const cli = require.resolve('../bin/osf.js');
const file = path.resolve(__dirname, '../../examples/test_minimal.osf');

const out = execFileSync('node', [cli, 'export', file, '--target', 'md'], { encoding: 'utf8' });
if (!out.includes('title: Demo') || !out.includes('Hello World') ||
    !out.includes('## Intro') || !out.includes('| A | B |') || !out.includes('| 1 | 2 |')) {
  throw new Error('markdown export failed');
}
