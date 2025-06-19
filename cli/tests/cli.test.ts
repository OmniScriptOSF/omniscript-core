const { execFileSync } = require('child_process');
const path = require('path');
const file = path.resolve(__dirname, '../../examples/test_minimal.osf');
const cli = require.resolve('../bin/osf.js');

// parse
const parseOut = execFileSync('node', [cli, 'parse', file], { encoding: 'utf8' });
const result = JSON.parse(parseOut);
if (!Array.isArray(result.blocks)) {
  throw new Error('parse failed');
}

// format
const fmt = execFileSync('node', [cli, 'format', file], { encoding: 'utf8' });
if (!fmt.includes('@doc')) {
  throw new Error('format failed');
}

// render html
const html = execFileSync('node', [cli, 'render', file, '--format', 'html'], { encoding: 'utf8' });
if (!html.includes('<html>')) {
  throw new Error('render failed');
}
