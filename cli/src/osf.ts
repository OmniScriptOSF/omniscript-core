// File: omniscript-core/cli/src/osf.ts
// What: Main CLI orchestrator - argument parsing and command routing
// Why: Entry point for OSF CLI tool
// Related: commands/*.ts, main.ts

import { version as cliVersion } from '../package.json';
import { commands } from './types';
import {
  parseCommand,
  lintCommand,
  diffCommand,
  renderCommand,
  exportCommand,
  formatCommand,
} from './commands';

function showHelp(): void {
  console.log(`OmniScript Format (OSF) CLI v${cliVersion}`);
  console.log('Universal document DSL for LLMs and Git-native workflows\n');
  console.log('Usage: osf <command> [options]\n');
  console.log('Commands:');

  for (const cmd of commands) {
    console.log(`  ${cmd.name.padEnd(8)} ${cmd.description}`);
    console.log(`           ${cmd.usage}`);
  }

  console.log('\nOptions:');
  console.log('  --help, -h     Show help');
  console.log('  --version, -v  Show version');
  console.log('\nExamples:');
  console.log('  osf parse document.osf');
  console.log('  osf render slides.osf --format html');
  console.log('  osf render slides.osf --format pdf');
  console.log('  osf export data.osf --target md --output output.md');
}

function showVersion(): void {
  console.log(cliVersion);
}

function handleError(error: Error, context: string): never {
  console.error(`Error in ${context}: ${error.message}`);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
}

function validateArgs(command: string, args: string[]): void {
  const cmd = commands.find(c => c.name === command);
  if (!cmd) {
    throw new Error(`Unknown command: ${command}`);
  }

  if (args.length < cmd.args.length) {
    throw new Error(`Missing required arguments for ${command}. Usage: ${cmd.usage}`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (!command) {
    handleError(new Error('No command provided'), 'main');
  }

  try {
    validateArgs(
      command,
      commandArgs.filter(arg => !arg.startsWith('--'))
    );

    switch (command) {
      case 'parse': {
        const fileName = commandArgs[0];
        if (!fileName) {
          handleError(new Error('No file specified for parse command'), 'parse');
        }
        parseCommand(fileName);
        break;
      }

      case 'lint': {
        const fileName = commandArgs[0];
        if (!fileName) {
          handleError(new Error('No file specified for lint command'), 'lint');
        }
        lintCommand(fileName);
        break;
      }

      case 'diff': {
        const fileA = commandArgs[0];
        const fileB = commandArgs[1];
        if (!fileA || !fileB) {
          handleError(new Error('Two files required for diff command'), 'diff');
        }
        diffCommand(fileA, fileB);
        break;
      }

      case 'render': {
        const file = commandArgs[0];
        if (!file) {
          handleError(new Error('No file specified for render command'), 'render');
        }
        const formatFlag = commandArgs.indexOf('--format');
        const outputFlag = commandArgs.indexOf('--output');
        const themeFlag = commandArgs.indexOf('--theme');
        
        const format = formatFlag >= 0 ? commandArgs[formatFlag + 1] || 'html' : 'html';
        const outputFile = outputFlag >= 0 ? commandArgs[outputFlag + 1] : undefined;
        const theme = themeFlag >= 0 ? commandArgs[themeFlag + 1] : 'default';

        await renderCommand(file, format, outputFile, theme);
        break;
      }

      case 'export': {
        const file = commandArgs[0];
        if (!file) {
          handleError(new Error('No file specified for export command'), 'export');
        }
        const targetFlag = commandArgs.indexOf('--target');
        const outputFlag = commandArgs.indexOf('--output');
        
        const target = targetFlag >= 0 ? commandArgs[targetFlag + 1] || 'md' : 'md';
        const outputFile = outputFlag >= 0 ? commandArgs[outputFlag + 1] : undefined;

        exportCommand(file, target, outputFile);
        break;
      }

      case 'format': {
        const file = commandArgs[0];
        if (!file) {
          handleError(new Error('No file specified for format command'), 'format');
        }
        const outputFlag = commandArgs.indexOf('--output');
        const outputFile = outputFlag >= 0 ? commandArgs[outputFlag + 1] : undefined;

        formatCommand(file, outputFile);
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    handleError(error as Error, command || 'unknown');
  }
}

// Run the CLI
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
