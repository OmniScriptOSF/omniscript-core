// File: omniscript-core/cli/src/commands/parse.ts
// What: Parse command implementation - validate and output AST
// Why: Handle the 'parse' CLI command
// Related: osf.ts, lint.ts

import { parse, ParseOptions } from 'omniscript-parser';
import { loadFile } from '../utils/file-ops';

export function parseCommand(fileName: string, options: ParseOptions = {}): void {
  const text = loadFile(fileName);
  const doc = parse(text, options);
  console.log(JSON.stringify(doc, null, 2));
}
