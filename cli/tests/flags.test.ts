const { execFileSync } = require('child_process');
const path = require('path');
const cli = require.resolve('../bin/osf.js');
const pkg = require('../package.json');

// --help
const help = execFileSync('node', [cli, '--help'], { encoding: 'utf8' });
if (!help.includes('Usage: osf') || !help.includes('parse')) {
  throw new Error('help output incorrect');
}

// -h alias
const shortHelp = execFileSync('node', [cli, '-h'], { encoding: 'utf8' });
if (!shortHelp.includes('Usage: osf')) {
  throw new Error('-h output incorrect');
}

// --version
const version = execFileSync('node', [cli, '--version'], { encoding: 'utf8' }).trim();
if (version !== pkg.version) {
  throw new Error('version output incorrect');
}

// -v alias
const versionShort = execFileSync('node', [cli, '-v'], { encoding: 'utf8' }).trim();
if (versionShort !== pkg.version) {
  throw new Error('-v output incorrect');
}
