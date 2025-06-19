const { spawnSync, execFileSync } = require('child_process');
const path = require('path');
const cli = require.resolve('../bin/osf.js');
const fileA = path.resolve(__dirname, '../../examples/test_minimal.osf');
const fileB = path.resolve(__dirname, '../../examples/test_slides.osf');

// diff should report no differences for identical files
const same = execFileSync('node', [cli, 'diff', fileA, fileA], { encoding: 'utf8' }).trim();
if (same !== 'No differences') {
  throw new Error('diff identical files failed');
}

// diff should detect differences
const diff = spawnSync('node', [cli, 'diff', fileA, fileB], { encoding: 'utf8' });
if (diff.status === 0 || !diff.stdout.includes('Documents differ')) {
  throw new Error('diff failed to detect changes');
}
