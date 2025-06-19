const { spawnSync } = require('child_process');
const path = require('path');
const cli = require.resolve('../bin/osf.js');
const file = path.resolve(__dirname, '../../examples/test_minimal.osf');

// render with unknown format should exit with error
const res = spawnSync('node', [cli, 'render', file, '--format', 'foo'], { encoding: 'utf8' });
if (res.status === 0 || !res.stderr.includes('Unknown format')) {
  throw new Error('expected render to fail for unknown format');
}
