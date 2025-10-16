// File: omniscript-core/cli/src/utils/spreadsheet-utils.ts
// What: Spreadsheet data conversion utilities
// Why: Convert between OSFValue and CellValue types
// Related: utils/formula-evaluator.ts, renderers/html.ts

import { OSFValue } from 'omniscript-parser';
import { SpreadsheetData } from '../types';

// Helper function to convert OSFValue to CellValue
export function toSpreadsheetData(data: Record<string, OSFValue> | undefined): SpreadsheetData {
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
