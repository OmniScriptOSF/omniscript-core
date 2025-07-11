import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import { version as cliVersion } from '../package.json';
import {
  parse,
  serialize,
  OSFDocument,
  MetaBlock,
  DocBlock,
  SlideBlock,
  SheetBlock,
  OSFValue,
  TextRun,
} from 'omniscript-parser';

// Type definitions for formula handling
interface FormulaDefinition {
  cell: [number, number];
  expr: string;
}

// Type for spreadsheet cell values (compatible with OSFValue)
type CellValue = string | number | boolean;

// Type for spreadsheet data
type SpreadsheetData = Record<string, CellValue>;

// Helper function to extract text from TextRun objects
function extractText(run: TextRun): string {
  if (typeof run === 'string') {
    return run;
  }
  if ('type' in run) {
    if (run.type === 'link') {
      return run.text;
    }
    if (run.type === 'image') {
      return run.alt;
    }
  }
  if ('text' in run) {
    return run.text;
  }
  return '';
}

// Helper function to convert OSFValue to CellValue
function toSpreadsheetData(data: Record<string, OSFValue> | undefined): SpreadsheetData {
  if (!data) return {};

  const result: SpreadsheetData = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    } else {
      // Convert complex types to string representation
      result[key] = String(value);
    }
  }
  return result;
}

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
    description: 'Render OSF to various output formats',
    usage:
      'osf render <file> [--format <html|pdf|docx|pptx|xlsx>] [--output <file>] [--theme <default|corporate|academic|modern>]',
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

// Load and compile OSF schema
const schemaPath = join(__dirname, '../schema/osf.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv();
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
const validateOsf = ajv.compile(schema);

// Formula evaluator for spreadsheet calculations
class FormulaEvaluator {
  private data: SpreadsheetData;
  private formulas: Map<string, string>;
  private computed: Map<string, CellValue>;
  private evaluating: Set<string>; // For circular reference detection

  constructor(data: SpreadsheetData, formulas: FormulaDefinition[]) {
    this.data = { ...data };
    this.formulas = new Map();
    this.computed = new Map();
    this.evaluating = new Set();

    // Convert formulas to map with string keys
    for (const formula of formulas) {
      const key = `${formula.cell[0]},${formula.cell[1]}`;
      this.formulas.set(key, formula.expr);
    }
  }

  // Convert cell reference (like "A1", "B2") to row,col coordinates
  private cellRefToCoords(cellRef: string): [number, number] {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }

    const colStr = match[1];
    const rowStr = match[2];

    if (!colStr || !rowStr) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }

    // Convert column letters to number (A=1, B=2, ..., Z=26, AA=27, etc.)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64); // A=1, B=2, etc.
    }

    const row = parseInt(rowStr, 10);
    return [row, col];
  }

  // Convert row,col coordinates to cell reference
  private coordsToCellRef(row: number, col: number): string {
    let colStr = '';
    let temp = col;
    while (temp > 0) {
      temp--;
      colStr = String.fromCharCode(65 + (temp % 26)) + colStr;
      temp = Math.floor(temp / 26);
    }
    return `${colStr}${row}`;
  }

  // Get cell value, evaluating formulas if needed
  getCellValue(row: number, col: number): CellValue {
    const key = `${row},${col}`;

    // Check for circular reference
    if (this.evaluating.has(key)) {
      throw new Error(`Circular reference detected at cell ${this.coordsToCellRef(row, col)}`);
    }

    // Return cached computed value if available
    if (this.computed.has(key)) {
      const cached = this.computed.get(key);
      if (cached !== undefined) {
        return cached;
      }
    }

    // Check if there's a formula for this cell
    if (this.formulas.has(key)) {
      this.evaluating.add(key);
      try {
        const formula = this.formulas.get(key);
        if (formula) {
          const result = this.evaluateFormula(formula);
          this.computed.set(key, result);
          this.evaluating.delete(key);
          return result;
        }
      } catch (error) {
        this.evaluating.delete(key);
        throw error;
      }
    }

    // Return raw data value or empty string
    return this.data[key] ?? '';
  }

  // Evaluate a formula expression
  private evaluateFormula(expr: string): CellValue {
    // Remove leading = if present
    if (expr.startsWith('=')) {
      expr = expr.slice(1);
    }

    // Replace cell references with actual values
    const cellRefRegex = /\b([A-Z]+\d+)\b/g;
    const processedExpr = expr.replace(cellRefRegex, match => {
      const [row, col] = this.cellRefToCoords(match);
      const value = this.getCellValue(row, col);

      // Convert to number if possible, otherwise use as string
      if (typeof value === 'number') {
        return value.toString();
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        return value;
      } else {
        // For string values in formulas, wrap in quotes
        return `"${value}"`;
      }
    });

    try {
      // Evaluate the mathematical expression
      return this.evaluateExpression(processedExpr);
    } catch (error) {
      throw new Error(`Formula evaluation error: ${(error as Error).message}`);
    }
  }

  // Safe expression evaluator supporting basic arithmetic
  private evaluateExpression(expr: string): number {
    // Remove whitespace
    expr = expr.replace(/\s+/g, '');

    // Handle parentheses first
    while (expr.includes('(')) {
      const innerMatch = expr.match(/\(([^()]+)\)/);
      if (!innerMatch) break;

      const innerExpr = innerMatch[1];
      const fullMatch = innerMatch[0];
      if (innerExpr && fullMatch) {
        const innerResult = this.evaluateExpression(innerExpr);
        expr = expr.replace(fullMatch, innerResult.toString());
      }
    }

    // Handle multiplication and division (left to right, same precedence)
    expr = this.evaluateOperatorsLeftToRight(expr, ['*', '/']);

    // Handle addition and subtraction (left to right, same precedence)
    expr = this.evaluateOperatorsLeftToRight(expr, ['+', '-']);

    // Parse final result
    const result = parseFloat(expr);
    if (isNaN(result)) {
      throw new Error(`Invalid expression: ${expr}`);
    }

    return result;
  }

  // Evaluate operators with left-to-right precedence
  private evaluateOperatorsLeftToRight(expr: string, operators: string[]): string {
    // Create a regex that matches any of the operators
    const opPattern = operators.map(op => `\\${op}`).join('|');
    const regex = new RegExp(`(-?\\d+(?:\\.\\d+)?)(${opPattern})(-?\\d+(?:\\.\\d+)?)`, 'g');

    // Keep evaluating until no more matches
    while (regex.test(expr)) {
      regex.lastIndex = 0; // Reset regex
      expr = expr.replace(regex, (_, left, op, right) => {
        const leftNum = parseFloat(left);
        const rightNum = parseFloat(right);
        let result: number;

        switch (op) {
          case '+':
            result = leftNum + rightNum;
            break;
          case '-':
            result = leftNum - rightNum;
            break;
          case '*':
            result = leftNum * rightNum;
            break;
          case '/':
            if (rightNum === 0) throw new Error('Division by zero');
            result = leftNum / rightNum;
            break;
          default:
            throw new Error(`Unknown operator: ${op}`);
        }

        return result.toString();
      });
    }

    return expr;
  }

  // Get all computed values for a sheet
  getAllComputedValues(maxRow: number, maxCol: number): SpreadsheetData {
    const result: SpreadsheetData = {};

    for (let r = 1; r <= maxRow; r++) {
      for (let c = 1; c <= maxCol; c++) {
        const key = `${r},${c}`;
        try {
          const value = this.getCellValue(r, c);
          if (value !== '') {
            result[key] = value;
          }
        } catch (error) {
          // Store error message for cells that can't be computed
          result[key] = `#ERROR: ${(error as Error).message}`;
        }
      }
    }

    return result;
  }
}

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
    '    .computed { background-color: #f0f8ff; font-style: italic; }',
    '    .error { background-color: #ffe6e6; color: #d00; }',
    '  </style>',
    '</head>',
    '<body>',
  ];

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta': {
        const meta = block as MetaBlock;
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
        const docBlock = block as DocBlock;
        const content = docBlock.content || '';
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
        const slide = block as SlideBlock;
        parts.push('  <section class="slide">');
        if (slide.title) {
          parts.push(`    <h2>${slide.title}</h2>`);
        }
        if (slide.content && Array.isArray(slide.content)) {
          parts.push('    <div class="slide-content">');
          for (const block of slide.content) {
            if (block.type === 'unordered_list') {
              parts.push('      <ul>');
              for (const item of block.items) {
                const itemText = item.content.map(extractText).join('');
                parts.push(`        <li>${itemText}</li>`);
              }
              parts.push('      </ul>');
            } else if (block.type === 'paragraph') {
              const paragraphText = block.content.map(extractText).join('');
              parts.push(`      <p>${paragraphText}</p>`);
            }
          }
          parts.push('    </div>');
        }
        parts.push('  </section>');
        break;
      }
      case 'sheet': {
        const sheet = block as SheetBlock;
        if (sheet.name) {
          parts.push(`  <h3>${sheet.name}</h3>`);
        }
        parts.push('  <table>');

        if (sheet.cols) {
          const cols = Array.isArray(sheet.cols)
            ? sheet.cols
            : String(sheet.cols)
                .replace(/[[\]]/g, '')
                .split(',')
                .map((s: string) => s.trim());
          parts.push(
            '    <thead><tr>' + cols.map((c: string) => `<th>${c}</th>`).join('') + '</tr></thead>'
          );
        }

        if (sheet.data) {
          // Evaluate formulas
          const evaluator = new FormulaEvaluator(
            toSpreadsheetData(sheet.data),
            sheet.formulas || []
          );

          // Calculate dimensions including formula cells
          const dataCoords = Object.keys(sheet.data).map(k => k.split(',').map(Number));
          const formulaCoords = (sheet.formulas || []).map((f: FormulaDefinition) => f.cell);
          const allCoords = [...dataCoords, ...formulaCoords];

          const maxRow = Math.max(...allCoords.map(c => c[0] || 0));
          const maxCol = Math.max(...allCoords.map(c => c[1] || 0));

          // Get all computed values including formulas
          const allValues = evaluator.getAllComputedValues(maxRow, maxCol);

          parts.push('    <tbody>');
          for (let r = 1; r <= maxRow; r++) {
            parts.push('      <tr>');
            for (let c = 1; c <= maxCol; c++) {
              const key = `${r},${c}`;
              const val = allValues[key] ?? '';
              const hasFormula = sheet.formulas?.some(
                (f: FormulaDefinition) => f.cell[0] === r && f.cell[1] === c
              );
              const isError = typeof val === 'string' && val.startsWith('#ERROR:');

              const cssClass = isError ? 'error' : hasFormula ? 'computed' : '';
              const cellContent = isError ? val.replace('#ERROR: ', '') : val;

              parts.push(`        <td class="${cssClass}">${cellContent}</td>`);
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

// Advanced format renderers using omniscript-converters
async function renderPdf(): Promise<Buffer> {
  throw new Error('PDF rendering not implemented');
}

async function renderDocx(): Promise<Buffer> {
  throw new Error('DOCX rendering not implemented');
}

async function renderPptx(): Promise<Buffer> {
  throw new Error('PPTX rendering not implemented');
}

async function renderXlsx(): Promise<Buffer> {
  throw new Error('XLSX rendering not implemented');
}

function exportMarkdown(doc: OSFDocument): string {
  const out: string[] = [];

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta': {
        const meta = block as MetaBlock;
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
        const doc = block as DocBlock;
        out.push(doc.content);
        out.push('');
        break;
      }
      case 'slide': {
        const slide = block as SlideBlock;
        if (slide.title) {
          out.push(`## ${slide.title}`);
        }

        // Handle bullets property (legacy format)
        if ('bullets' in slide && Array.isArray(slide.bullets)) {
          for (const bullet of slide.bullets) {
            if (typeof bullet === 'string') {
              out.push(`- ${bullet}`);
            }
          }
        }

        if (slide.content) {
          for (const block of slide.content) {
            if (block.type === 'unordered_list') {
              for (const item of block.items) {
                const itemText = item.content.map(extractText).join('');
                out.push(`- ${itemText}`);
              }
            } else if (block.type === 'paragraph') {
              const paragraphText = block.content.map(extractText).join('');
              out.push(paragraphText);
            }
          }
        }
        out.push('');
        break;
      }
      case 'sheet': {
        const sheet = block as SheetBlock;
        if (sheet.name) {
          out.push(`### ${sheet.name}\n`);
        }

        if (sheet.cols) {
          const cols = Array.isArray(sheet.cols)
            ? sheet.cols
            : String(sheet.cols)
                .replace(/[[\]]/g, '')
                .split(',')
                .map((s: string) => s.trim());
          out.push('| ' + cols.join(' | ') + ' |');
          out.push('|' + cols.map(() => '---').join('|') + '|');
        }

        if (sheet.data) {
          // Evaluate formulas
          const evaluator = new FormulaEvaluator(
            toSpreadsheetData(sheet.data),
            sheet.formulas || []
          );

          // Calculate dimensions including formula cells
          const dataCoords = Object.keys(sheet.data).map(k => k.split(',').map(Number));
          const formulaCoords = (sheet.formulas || []).map((f: FormulaDefinition) => f.cell);
          const allCoords = [...dataCoords, ...formulaCoords];

          const maxRow = Math.max(...allCoords.map(c => c[0] || 0));
          const maxCol = Math.max(...allCoords.map(c => c[1] || 0));

          // Get all computed values including formulas
          const allValues = evaluator.getAllComputedValues(maxRow, maxCol);

          for (let r = 1; r <= maxRow; r++) {
            const cells: string[] = [];
            for (let c = 1; c <= maxCol; c++) {
              const key = `${r},${c}`;
              const val = allValues[key] ?? '';
              const hasFormula = sheet.formulas?.some(
                (f: FormulaDefinition) => f.cell[0] === r && f.cell[1] === c
              );

              if (hasFormula && typeof val === 'number') {
                // Show computed value with indication it's calculated
                cells.push(`${val} *(calc)*`);
              } else {
                cells.push(String(val));
              }
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
  const out: {
    meta?: Record<string, unknown>;
    docs: { content: string }[];
    slides: unknown[];
    sheets: unknown[];
  } = { docs: [], slides: [], sheets: [] };

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta': {
        const meta = block as MetaBlock;
        out.meta = meta.props as Record<string, unknown>;
        break;
      }
      case 'doc': {
        const doc = block as DocBlock;
        out.docs.push({ content: doc.content });
        break;
      }
      case 'slide': {
        const slide = block as SlideBlock;
        const { type, ...slideData } = slide;
        void type; // Acknowledge we're intentionally not using this
        out.slides.push(slideData);
        break;
      }
      case 'sheet': {
        const sheet = block as SheetBlock;
        const { type, ...sheetData } = sheet;
        void type; // Acknowledge we're intentionally not using this

        if (sheet.data) {
          // Evaluate formulas and include computed values
          const evaluator = new FormulaEvaluator(
            toSpreadsheetData(sheet.data),
            sheet.formulas || []
          );

          // Calculate dimensions including formula cells
          const dataCoords = Object.keys(sheet.data).map((k: string) => k.split(',').map(Number));
          const formulaCoords = (sheet.formulas || []).map((f: FormulaDefinition) => f.cell);
          const allCoords = [...dataCoords, ...formulaCoords];

          const maxRow = Math.max(...allCoords.map(c => c[0] || 0));
          const maxCol = Math.max(...allCoords.map(c => c[1] || 0));

          // Get all computed values including formulas
          const allValues = evaluator.getAllComputedValues(maxRow, maxCol);

          // Convert to array format with computed values
          const computedData = Object.entries(allValues).map(([cell, value]) => {
            const [r, c] = cell.split(',').map(Number);
            const hasFormula = sheet.formulas?.some(
              (f: FormulaDefinition) => f.cell[0] === r && f.cell[1] === c
            );
            return {
              row: r,
              col: c,
              value,
              computed: hasFormula,
            };
          });

          // Store computed data in sheetData for output (tests expect this as 'data')
          (sheetData as Record<string, unknown>).data = computedData;
        }

        const outputSheet: Record<string, unknown> = { ...sheetData };
        if (sheet.formulas) {
          outputSheet.formulas = sheet.formulas.map(f => ({
            row: f.cell[0],
            col: f.cell[1],
            expr: f.expr,
          }));
        }
        out.sheets.push(outputSheet);
        break;
      }
    }
  }

  return JSON.stringify(out, null, 2);
}

function diffDocs(a: OSFDocument, b: OSFDocument): string[] {
  const diffs: string[] = [];
  const maxLen = Math.max(a.blocks.length, b.blocks.length);

  for (let i = 0; i < maxLen; i++) {
    const blockA = a.blocks[i];
    const blockB = b.blocks[i];

    if (!blockA && blockB) {
      diffs.push(`Block ${i} added: ${blockB.type}`);
      continue;
    }
    if (blockA && !blockB) {
      diffs.push(`Block ${i} removed: ${blockA.type}`);
      continue;
    }
    if (!blockA || !blockB) continue; // should not happen

    if (blockA.type !== blockB.type) {
      diffs.push(`Block ${i} type changed from ${blockA.type} to ${blockB.type}`);
    }

    const keys = new Set([...Object.keys(blockA), ...Object.keys(blockB)]);
    keys.delete('type');

    for (const key of keys) {
      const valA = (blockA as Record<string, unknown>)[key];
      const valB = (blockB as Record<string, unknown>)[key];

      if (valA === undefined && valB !== undefined) {
        diffs.push(`Block ${i} field added '${key}': ${JSON.stringify(valB)}`);
      } else if (valA !== undefined && valB === undefined) {
        diffs.push(`Block ${i} field removed '${key}'`);
      } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        diffs.push(
          `Block ${i} field '${key}' changed from ${JSON.stringify(
            valA
          )} to ${JSON.stringify(valB)}`
        );
      }
    }
  }

  return diffs;
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
        const text = loadFile(fileName);
        const doc = parse(text);
        console.log(JSON.stringify(doc, null, 2));
        break;
      }

      case 'lint': {
        const fileName = commandArgs[0];
        if (!fileName) {
          handleError(new Error('No file specified for lint command'), 'lint');
        }
        // Basic syntax validation through parsing
        const doc = parse(loadFile(fileName));

        // If parsing succeeds, the document is syntactically valid
        if (doc.blocks.length === 0) {
          console.log('⚠️  Warning: Document contains no blocks');
        }

        // Schema validation
        const obj = exportJson(doc);
        const parsed = JSON.parse(obj);
        if (!validateOsf(parsed)) {
          console.error('❌ Lint failed: Schema validation errors');
          console.error(ajv.errorsText(validateOsf.errors || undefined));
          process.exit(1);
        }

        console.log('✅ Lint passed: Document syntax and schema are valid');
        break;
      }

      case 'diff': {
        const fileA = commandArgs[0];
        const fileB = commandArgs[1];
        if (!fileA || !fileB) {
          handleError(new Error('Two files required for diff command'), 'diff');
        }
        const docA = parse(loadFile(fileA));
        const docB = parse(loadFile(fileB));
        const diffs = diffDocs(docA, docB);

        if (diffs.length === 0) {
          console.log('✅ No differences found');
        } else {
          console.log('❌ Documents differ');
          for (const d of diffs) {
            console.log(`  - ${d}`);
          }
          process.exit(1);
        }
        break;
      }

      case 'render': {
        const file = commandArgs[0];
        if (!file) {
          handleError(new Error('No file specified for render command'), 'render');
        }
        const formatFlag = commandArgs.indexOf('--format');
        const outputFlag = commandArgs.indexOf('--output');
        const format = formatFlag >= 0 ? commandArgs[formatFlag + 1] || 'html' : 'html';
        const outputFile = outputFlag >= 0 ? commandArgs[outputFlag + 1] : undefined;

        const doc = parse(loadFile(file));

        switch (format) {
          case 'html': {
            const htmlOutput = renderHtml(doc);
            if (outputFile) {
              saveFile(outputFile, htmlOutput);
            } else {
              console.log(htmlOutput);
            }
            break;
          }
          case 'pdf': {
            await renderPdf();
            break;
          }
          case 'docx': {
            await renderDocx();
            break;
          }
          case 'pptx': {
            await renderPptx();
            break;
          }
          case 'xlsx': {
            await renderXlsx();
            break;
          }
          default:
            throw new Error(`Unknown format: ${format}. Supported: html, pdf, docx, pptx, xlsx`);
        }
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
        const file = commandArgs[0];
        if (!file) {
          handleError(new Error('No file specified for format command'), 'format');
        }
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
    handleError(error as Error, command || 'unknown');
  }
}

// Run the CLI
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
