// File: omniscript-core/cli/src/renderers/json.ts
// What: JSON export engine for OSF documents
// Why: Convert OSF documents to structured JSON with computed values
// Related: commands/export.ts

import { OSFDocument, MetaBlock, DocBlock, SlideBlock, SheetBlock } from 'omniscript-parser';
import { FormulaEvaluator } from '../utils/formula-evaluator';
import { toSpreadsheetData } from '../utils/spreadsheet-utils';
import { FormulaDefinition } from '../types';

export function exportJson(doc: OSFDocument): string {
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
