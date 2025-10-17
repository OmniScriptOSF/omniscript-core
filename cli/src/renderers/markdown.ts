// File: omniscript-core/cli/src/renderers/markdown.ts
// What: Markdown export engine for OSF documents
// Why: Convert OSF documents to standard Markdown format
// Related: commands/export.ts, utils/markdown-utils.ts

import { OSFDocument, MetaBlock, DocBlock, SlideBlock, SheetBlock } from 'omniscript-parser';
import { textRunToMarkdown } from '../utils/markdown-utils';
import { FormulaEvaluator } from '../utils/formula-evaluator';
import { toSpreadsheetData } from '../utils/spreadsheet-utils';
import { FormulaDefinition } from '../types';

export function exportMarkdown(doc: OSFDocument): string {
  const out: string[] = [];

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta':
        out.push(...exportMetaBlock(block as MetaBlock));
        break;
      case 'doc':
        out.push(...exportDocBlock(block as DocBlock));
        break;
      case 'slide':
        out.push(...exportSlideBlock(block as SlideBlock));
        break;
      case 'sheet':
        out.push(...exportSheetBlock(block as SheetBlock));
        break;
    }
  }

  return out.join('\n').trim();
}

function exportMetaBlock(meta: MetaBlock): string[] {
  const out: string[] = ['---'];
  for (const [k, v] of Object.entries(meta.props)) {
    if (typeof v === 'string') {
      out.push(`${k}: ${v}`);
    } else {
      out.push(`${k}: ${JSON.stringify(v)}`);
    }
  }
  out.push('---', '');
  return out;
}

function exportDocBlock(doc: DocBlock): string[] {
  return [doc.content, ''];
}

function exportSlideBlock(slide: SlideBlock): string[] {
  const out: string[] = [];

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
          const itemText = item.content.map(textRunToMarkdown).join('');
          out.push(`- ${itemText}`);
        }
      } else if (block.type === 'ordered_list') {
        block.items.forEach((item, idx) => {
          const itemText = item.content.map(textRunToMarkdown).join('');
          out.push(`${idx + 1}. ${itemText}`);
        });
      } else if (block.type === 'paragraph') {
        const paragraphText = block.content.map(textRunToMarkdown).join('');
        out.push(paragraphText);
      } else if (block.type === 'blockquote') {
        for (const para of block.content) {
          const quoteText = para.content.map(textRunToMarkdown).join('');
          out.push(`> ${quoteText}`);
        }
      } else if (block.type === 'code') {
        out.push(`\`\`\`${block.language || ''}`);
        out.push(block.content);
        out.push('```');
      } else if (block.type === 'image') {
        out.push(`![${block.alt}](${block.url})`);
      }
    }
  }

  out.push('');
  return out;
}

function exportSheetBlock(sheet: SheetBlock): string[] {
  const out: string[] = [];

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
    const evaluator = new FormulaEvaluator(toSpreadsheetData(sheet.data), sheet.formulas || []);

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
  return out;
}
