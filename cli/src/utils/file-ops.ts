// File: omniscript-core/cli/src/utils/file-ops.ts
// What: File loading and saving utilities
// Why: Centralize file I/O operations with error handling
// Related: commands/*.ts

import { readFileSync, writeFileSync } from 'fs';

export function loadFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file '${filePath}': ${(error as Error).message}`);
  }
}

export function saveFile(filePath: string, content: string): void {
  try {
    writeFileSync(filePath, content, 'utf8');
    console.log(`Output written to ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to write file '${filePath}': ${(error as Error).message}`);
  }
}
