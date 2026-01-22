// File: omniscript-core/cli/src/osf.ts
// What: Main CLI orchestrator - argument parsing and command routing
// Why: Entry point for OSF CLI tool
// Related: commands/*.ts, main.ts

import { dirname } from 'path';
import { ParseOptions } from 'omniscript-parser';
import { version as cliVersion } from '../package.json';
import {
  parseCommand,
  lintCommand,
  diffCommand,
  renderCommand,
  exportCommand,
  formatCommand,
} from './commands';
import { commands } from './types';

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
  console.log('  --resolve-includes  Resolve @include directives (requires filesystem access)');
  console.log('  --max-depth <n>     Max include depth (default: 10)');
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

type ParsedArgs = {
  positionals: string[];
  flags: Record<string, string | boolean>;
};

const VALUE_FLAGS = new Set(['--format', '--output', '--theme', '--target', '--max-depth']);

function parseArgs(args: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    if (arg.startsWith('--')) {
      if (VALUE_FLAGS.has(arg)) {
        const value = args[i + 1];
        if (value && !value.startsWith('--')) {
          flags[arg] = value;
          i++;
        } else {
          flags[arg] = '';
        }
      } else {
        flags[arg] = true;
      }
    } else {
      positionals.push(arg);
    }
  }

  return { positionals, flags };
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

function buildParseOptions(
  fileName: string,
  flags: Record<string, string | boolean>
): ParseOptions {
  const resolveIncludes = flags['--resolve-includes'] === true;
  if (!resolveIncludes) return {};

  const maxDepthRaw = flags['--max-depth'];
  const maxDepthCandidate =
    typeof maxDepthRaw === 'string' && maxDepthRaw.trim() !== '' ? Number(maxDepthRaw) : undefined;

  const options: ParseOptions = {
    resolveIncludes: true,
    basePath: dirname(fileName),
  };

  if (typeof maxDepthCandidate === 'number' && Number.isFinite(maxDepthCandidate)) {
    options.maxDepth = maxDepthCandidate;
  }

  return options;
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
  const parsedArgs = parseArgs(commandArgs);

  if (!command) {
    handleError(new Error('No command provided'), 'main');
  }

  try {
    validateArgs(command, parsedArgs.positionals);

    switch (command) {
      case 'parse': {
        const fileName = parsedArgs.positionals[0];
        if (!fileName) {
          handleError(new Error('No file specified for parse command'), 'parse');
        }
        parseCommand(fileName, buildParseOptions(fileName, parsedArgs.flags));
        break;
      }

      case 'lint': {
        const fileName = parsedArgs.positionals[0];
        if (!fileName) {
          handleError(new Error('No file specified for lint command'), 'lint');
        }
        lintCommand(fileName, buildParseOptions(fileName, parsedArgs.flags));
        break;
      }

      case 'diff': {
        const fileA = parsedArgs.positionals[0];
        const fileB = parsedArgs.positionals[1];
        if (!fileA || !fileB) {
          handleError(new Error('Two files required for diff command'), 'diff');
        }
        diffCommand(
          fileA,
          fileB,
          buildParseOptions(fileA, parsedArgs.flags),
          buildParseOptions(fileB, parsedArgs.flags)
        );
        break;
      }

      case 'render': {
        const file = parsedArgs.positionals[0];
        if (!file) {
          handleError(new Error('No file specified for render command'), 'render');
        }
        const format =
          typeof parsedArgs.flags['--format'] === 'string' && parsedArgs.flags['--format']
            ? String(parsedArgs.flags['--format'])
            : 'html';
        const outputFile =
          typeof parsedArgs.flags['--output'] === 'string' && parsedArgs.flags['--output']
            ? String(parsedArgs.flags['--output'])
            : undefined;
        const theme =
          typeof parsedArgs.flags['--theme'] === 'string' && parsedArgs.flags['--theme']
            ? String(parsedArgs.flags['--theme'])
            : 'default';

        await renderCommand(
          file,
          format,
          outputFile,
          theme,
          buildParseOptions(file, parsedArgs.flags)
        );
        break;
      }

      case 'export': {
        const file = parsedArgs.positionals[0];
        if (!file) {
          handleError(new Error('No file specified for export command'), 'export');
        }
        const target =
          typeof parsedArgs.flags['--target'] === 'string' && parsedArgs.flags['--target']
            ? String(parsedArgs.flags['--target'])
            : 'md';
        const outputFile =
          typeof parsedArgs.flags['--output'] === 'string' && parsedArgs.flags['--output']
            ? String(parsedArgs.flags['--output'])
            : undefined;

        exportCommand(file, target, outputFile, buildParseOptions(file, parsedArgs.flags));
        break;
      }

      case 'format': {
        const file = parsedArgs.positionals[0];
        if (!file) {
          handleError(new Error('No file specified for format command'), 'format');
        }
        const outputFile =
          typeof parsedArgs.flags['--output'] === 'string' && parsedArgs.flags['--output']
            ? String(parsedArgs.flags['--output'])
            : undefined;

        formatCommand(file, outputFile, buildParseOptions(file, parsedArgs.flags));
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
