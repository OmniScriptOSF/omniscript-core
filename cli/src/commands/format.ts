// File: omniscript-core/cli/src/commands/format.ts
// What: Format command implementation - auto-format OSF files
// Why: Handle the 'format' CLI command for consistent style
// Related: osf.ts

import { parse, ParseOptions, serialize } from 'omniscript-parser';
import { loadFile, saveFile } from '../utils/file-ops';

export function formatCommand(file: string, outputFile?: string, options: ParseOptions = {}): void {
  const text = loadFile(file);
  const doc = parse(text, options);
  const formatted = serialize(doc);

  if (outputFile) {
    saveFile(outputFile, formatted);
  } else {
    console.log(formatted);
  }
}
