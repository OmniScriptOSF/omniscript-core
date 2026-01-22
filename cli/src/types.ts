// File: omniscript-core/cli/src/types.ts
// What: Shared type definitions for CLI
// Why: Centralize types used across CLI modules
// Related: osf.ts, commands/*.ts, utils/*.ts

// Type definitions for formula handling
export interface FormulaDefinition {
  cell: [number, number];
  expr: string;
}

// Type for spreadsheet cell values (compatible with OSFValue)
export type CellValue = string | number | boolean;

// Type for spreadsheet data
export type SpreadsheetData = Record<string, CellValue>;

// Type for styled text with optional formatting
export interface StyledText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

// CLI command definition
export interface CliCommand {
  name: string;
  description: string;
  usage: string;
  args: string[];
}

// Command list
export const commands: CliCommand[] = [
  {
    name: 'parse',
    description: 'Parse and validate OSF file syntax',
    usage: 'osf parse <file> [--resolve-includes] [--max-depth <n>]',
    args: ['file'],
  },
  {
    name: 'lint',
    description: 'Style and structure checks',
    usage: 'osf lint <file> [--resolve-includes] [--max-depth <n>]',
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
      'osf render <file> [--format <html|pdf|docx|pptx|xlsx>] [--output <file>] [--theme <default|corporate|academic|modern>] [--resolve-includes] [--max-depth <n>]',
    args: ['file'],
  },
  {
    name: 'export',
    description: 'Export OSF to other formats',
    usage:
      'osf export <file> [--target <md|json>] [--output <file>] [--resolve-includes] [--max-depth <n>]',
    args: ['file'],
  },
  {
    name: 'format',
    description: 'Auto-format OSF for style consistency',
    usage: 'osf format <file> [--output <file>] [--resolve-includes] [--max-depth <n>]',
    args: ['file'],
  },
];
