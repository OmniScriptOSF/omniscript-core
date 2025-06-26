import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import { parse, serialize, OSFDocument } from '../../parser/dist';

interface CliCommand {
  name: string;
  description: string;
  usage: string;
  args: string[];
}

const commands: CliCommand[] = [
  {
    name: 'parse',
    description: 'Parse and validate OSF file syntax',
    usage: 'osf parse <file>',
    args: ['file'],
  },
  {
    name: 'lint',
    description: 'Style and structure checks',
    usage: 'osf lint <file>',
    args: ['file'],
  },
  {
    name: 'diff',
    description: 'Semantic diff of two OSF files',
    usage: 'osf diff <file1> <file2>',
    args: ['file1', 'file2'],
  },
  {
    name: 'render',
    description: 'Render OSF to HTML output',
    usage: 'osf render <file> [--format <html>] [--output <file>]',
    args: ['file'],
  },
  {
    name: 'export',
    description: 'Export OSF to other formats',
    usage: 'osf export <file> [--target <md|json>] [--output <file>]',
    args: ['file'],
  },
  {
    name: 'format',
    description: 'Auto-format OSF for style consistency',
    usage: 'osf format <file> [--output <file>]',
    args: ['file'],
  },
];

const schema = JSON.parse(readFileSync(join(__dirname, '../../spec/v0.5/osf.schema.json'), 'utf8'));
const ajv = new Ajv();
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
const validateOsf = ajv.compile(schema);

function showHelp(): void {
  console.log('OmniScript Format (OSF) CLI v0.1.0');
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
  console.log('  osf export data.osf --target md --output output.md');
}

function showVersion(): void {
  console.log('0.1.0');
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

function loadFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file '${filePath}': ${(error as Error).message}`);
  }
}

function saveFile(filePath: string, content: string): void {
  try {
    writeFileSync(filePath, content, 'utf8');
    console.log(`Output written to ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to write file '${filePath}': ${(error as Error).message}`);
  }
}

// --- Spreadsheet formula helpers ---

function columnToNumber(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

function evalExpr(expr: string, get: (r: number, c: number) => any): number {
  const inner = expr.startsWith('=') ? expr.slice(1) : expr;
  const replaced = inner.replace(/[A-Za-z]+\d+/g, ref => {
    const m = /^([A-Za-z]+)(\d+)$/.exec(ref);
    if (!m) return '0';
    const col = columnToNumber(m[1]!);
    const row = Number(m[2]!);
    const val = get(row, col);
    return String(val ?? 0);
  });
  try {
    return Function(`"use strict"; return (${replaced});`)();
  } catch {
    return NaN;
  }
}

function applyFormulas(sheet: any): Record<string, any> {
  const result: Record<string, any> = { ...(sheet.data || {}) };
  if (sheet.data && sheet.formulas) {
    const getter = (r: number, c: number) => result[`${r},${c}`];
    for (const f of sheet.formulas) {
      result[`${f.cell[0]},${f.cell[1]}`] = evalExpr(f.expr, getter);
    }
  }
  return result;
}

function renderHtml(doc: OSFDocument): string {
  const parts: string[] = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>OSF Document</title>',
    '  <style>',
    '    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }',
    '    .slide { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }',
    '    table { border-collapse: collapse; width: 100%; margin: 20px 0; }',
    '    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }',
    '    th { background-color: #f5f5f5; font-weight: 600; }',
    '  </style>',
    '</head>',
    '<body>',
  ];

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta': {
        const meta = block as any;
        if (meta.props.title) {
          parts.push(`  <h1>${meta.props.title}</h1>`);
        }
        if (meta.props.author) {
          parts.push(`  <p><strong>Author:</strong> ${meta.props.author}</p>`);
        }
        if (meta.props.date) {
          parts.push(`  <p><strong>Date:</strong> ${meta.props.date}</p>`);
        }
        break;
      }
      case 'doc': {
        const content = (block as any).content || '';
        // Simple Markdown-like processing
        const processed = content
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
        parts.push(`  <div class="doc">${processed}</div>`);
        break;
      }
      case 'slide': {
        const slide = block as any;
        parts.push('  <section class="slide">');
        if (slide.title) {
          parts.push(`    <h2>${slide.title}</h2>`);
        }
        if (slide.bullets) {
          parts.push('    <ul>');
          for (const bullet of slide.bullets) {
            parts.push(`      <li>${bullet}</li>`);
          }
          parts.push('    </ul>');
        }
        parts.push('  </section>');
        break;
      }
      case 'sheet': {
        const sheet = block as any;
        if (sheet.name) {
          parts.push(`  <h3>${sheet.name}</h3>`);
        }
        parts.push('  <table>');

        if (sheet.cols) {
          const cols = Array.isArray(sheet.cols)
            ? sheet.cols
            : String(sheet.cols)
                .replace(/[\[\]]/g, '')
                .split(',')
                .map((s: string) => s.trim());
          parts.push(
            '    <thead><tr>' + cols.map((c: string) => `<th>${c}</th>`).join('') + '</tr></thead>'
          );
        }

        if (sheet.data) {
          parts.push('    <tbody>');
          const rows: Record<string, any> = applyFormulas(sheet);
          const coords = Object.keys(rows).map(k => k.split(',').map(Number));
          const maxRow = Math.max(...coords.map(c => c[0]!));
          const maxCol = Math.max(...coords.map(c => c[1]!));

          for (let r = 1; r <= maxRow; r++) {
            parts.push('      <tr>');
            for (let c = 1; c <= maxCol; c++) {
              const key = `${r},${c}`;
              const val = rows[key] ?? '';
              parts.push(`        <td>${val}</td>`);
            }
            parts.push('      </tr>');
          }
          parts.push('    </tbody>');
        }

        parts.push('  </table>');
        break;
      }
    }
  }

  parts.push('</body>', '</html>');
  return parts.join('\n');
}

function exportMarkdown(doc: OSFDocument): string {
  const out: string[] = [];

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta': {
        const meta = block as any;
        out.push('---');
        for (const [k, v] of Object.entries(meta.props)) {
          if (typeof v === 'string') {
            out.push(`${k}: ${v}`);
          } else {
            out.push(`${k}: ${JSON.stringify(v)}`);
          }
        }
        out.push('---');
        out.push('');
        break;
      }
      case 'doc': {
        out.push((block as any).content);
        out.push('');
        break;
      }
      case 'slide': {
        const slide = block as any;
        if (slide.title) {
          out.push(`## ${slide.title}`);
        }
        if (slide.bullets) {
          for (const bullet of slide.bullets) {
            out.push(`- ${bullet}`);
          }
        }
        out.push('');
        break;
      }
      case 'sheet': {
        const sheet = block as any;
        if (sheet.name) {
          out.push(`### ${sheet.name}\n`);
        }

        if (sheet.cols) {
          const cols = Array.isArray(sheet.cols)
            ? sheet.cols
            : String(sheet.cols)
                .replace(/[\[\]]/g, '')
                .split(',')
                .map((s: string) => s.trim());
          out.push('| ' + cols.join(' | ') + ' |');
          out.push('|' + cols.map(() => '---').join('|') + '|');
        }

        if (sheet.data) {
          const rows: Record<string, any> = applyFormulas(sheet);
          const coords = Object.keys(rows).map(k => k.split(',').map(Number));
          const maxRow = Math.max(...coords.map(c => c[0]!));
          const maxCol = Math.max(...coords.map(c => c[1]!));

          for (let r = 1; r <= maxRow; r++) {
            const cells: string[] = [];
            for (let c = 1; c <= maxCol; c++) {
              const key = `${r},${c}`;
              const val = rows[key] ?? '';
              cells.push(String(val));
            }
            out.push('| ' + cells.join(' | ') + ' |');
          }
        }
        out.push('');
        break;
      }
    }
  }

  return out.join('\n').trim();
}

function exportJson(doc: OSFDocument): string {
  const out: any = { docs: [], slides: [], sheets: [] };

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta':
        out.meta = (block as any).props;
        break;
      case 'doc':
        out.docs.push({ content: (block as any).content });
        break;
      case 'slide': {
        const slide: any = { ...block };
        delete slide.type;
        out.slides.push(slide);
        break;
      }
      case 'sheet': {
        const sheet: any = { ...block };
        delete sheet.type;
        if (sheet.data) {
          const rows = applyFormulas(sheet);
          sheet.data = Object.entries(rows).map(([cell, value]) => {
            const [r, c] = cell.split(',').map(Number);
            return { row: r, col: c, value };
          });
        }
        if (sheet.formulas) {
          sheet.formulas = sheet.formulas.map((f: any) => ({
            row: f.cell[0],
            col: f.cell[1],
            expr: f.expr,
          }));
        }
        out.sheets.push(sheet);
        break;
      }
    }
  }

  return JSON.stringify(out, null, 2);
}

function main(): void {
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

  try {
    validateArgs(
      command!,
      commandArgs.filter(arg => !arg.startsWith('--'))
    );

    switch (command) {
      case 'parse': {
        const text = loadFile(commandArgs[0]!);
        const doc = parse(text);
        console.log(JSON.stringify(doc, null, 2));
        break;
      }

      case 'lint': {
        const doc = parse(loadFile(commandArgs[0]!));
        const obj = exportJson(doc);
        const parsed = JSON.parse(obj);

        if (!validateOsf(parsed)) {
          console.error('❌ Lint failed: Schema validation errors');
          console.error(ajv.errorsText(validateOsf.errors || undefined));
          process.exit(1);
        } else {
          console.log('✅ Lint passed: Document is valid');
        }
        break;
      }

      case 'diff': {
        const docA = parse(loadFile(commandArgs[0]!));
        const docB = parse(loadFile(commandArgs[1]!));
        const same = JSON.stringify(docA) === JSON.stringify(docB);

        if (same) {
          console.log('✅ No differences found');
        } else {
          console.log('❌ Documents differ');
          // TODO: Implement detailed diff output
          process.exit(1);
        }
        break;
      }

      case 'render': {
        const file = commandArgs[0]!;
        const formatFlag = commandArgs.indexOf('--format');
        const outputFlag = commandArgs.indexOf('--output');
        const format = formatFlag >= 0 ? commandArgs[formatFlag + 1]! : 'html';
        const outputFile = outputFlag >= 0 ? commandArgs[outputFlag + 1] : undefined;

        const doc = parse(loadFile(file));
        let output: string;

        switch (format) {
          case 'html':
            output = renderHtml(doc);
            break;
          default:
            throw new Error(`Unknown format: ${format}. Supported: html`);
        }

        if (outputFile) {
          saveFile(outputFile, output);
        } else {
          console.log(output);
        }
        break;
      }

      case 'export': {
        const file = commandArgs[0]!;
        const targetFlag = commandArgs.indexOf('--target');
        const outputFlag = commandArgs.indexOf('--output');
        const target = targetFlag >= 0 ? commandArgs[targetFlag + 1]! : 'md';
        const outputFile = outputFlag >= 0 ? commandArgs[outputFlag + 1] : undefined;

        const doc = parse(loadFile(file));
        let output: string;

        switch (target) {
          case 'md':
            output = exportMarkdown(doc);
            break;
          case 'json':
            output = exportJson(doc);
            break;
          default:
            throw new Error(`Unknown target: ${target}. Supported: md, json`);
        }

        if (outputFile) {
          saveFile(outputFile, output);
        } else {
          console.log(output);
        }
        break;
      }

      case 'format': {
        const file = commandArgs[0]!;
        const outputFlag = commandArgs.indexOf('--output');
        const outputFile = outputFlag >= 0 ? commandArgs[outputFlag + 1] : undefined;

        const text = loadFile(file);
        const doc = parse(text);
        const formatted = serialize(doc);

        if (outputFile) {
          saveFile(outputFile, formatted);
        } else {
          console.log(formatted);
        }
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    handleError(error as Error, command!);
  }
}

// Run the CLI
main();
