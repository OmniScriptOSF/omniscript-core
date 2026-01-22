// File: omniscript-core/cli/src/commands/export.ts
// What: Export command implementation - convert OSF to markdown or JSON
// Why: Handle the 'export' CLI command
// Related: osf.ts, renderers/markdown.ts, renderers/json.ts

import { parse, ParseOptions } from 'omniscript-parser';
import { loadFile, saveFile } from '../utils/file-ops';
import { exportMarkdown, exportJson } from '../renderers';

export function exportCommand(
  file: string,
  target: string = 'md',
  outputFile?: string,
  options: ParseOptions = {}
): void {
  const doc = parse(loadFile(file), options);
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
}
