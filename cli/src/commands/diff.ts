// File: omniscript-core/cli/src/commands/diff.ts
// What: Diff command implementation - compare two OSF documents
// Why: Handle the 'diff' CLI command with semantic comparison
// Related: osf.ts

import { parse, OSFDocument, ParseOptions } from 'omniscript-parser';
import { loadFile } from '../utils/file-ops';

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

export function diffCommand(
  fileA: string,
  fileB: string,
  optionsA: ParseOptions = {},
  optionsB: ParseOptions = {}
): void {
  const docA = parse(loadFile(fileA), optionsA);
  const docB = parse(loadFile(fileB), optionsB);
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
}
