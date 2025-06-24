const { spawnSync, execFileSync } = require('child_process');
const path = require('path');
const cli = require.resolve('../bin/osf.js');
const valid = path.resolve(__dirname, '../../examples/test_minimal.osf');
const invalid = path.resolve(__dirname, 'fixtures/bad.osf');
const schemaFail = path.resolve(__dirname, 'fixtures/missing_title.osf');

// lint should succeed on valid file
const ok = execFileSync('node', [cli, 'lint', valid], { encoding: 'utf8' }).trim();
if (ok !== 'OK') {
  throw new Error('lint on valid file failed');
}

// lint should fail on invalid syntax
const bad = spawnSync('node', [cli, 'lint', invalid], { encoding: 'utf8' });
if (bad.status === 0 || !bad.stderr.includes('Lint error')) {
  throw new Error('lint did not report error');
}

// lint should fail on schema violation
const badSchema = spawnSync('node', [cli, 'lint', schemaFail], { encoding: 'utf8' });
if (badSchema.status === 0 || !badSchema.stderr.includes('schema validation')) {
  throw new Error('lint did not detect schema issue');
}
