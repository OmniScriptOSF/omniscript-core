// File: omniscript-core/cli/src/renderers/html.ts
// What: HTML rendering engine for OSF documents
// Why: Convert OSF documents to standalone HTML with CSS
// Related: osf.ts, utils/text-renderer.ts

import {
  OSFDocument,
  MetaBlock,
  DocBlock,
  SlideBlock,
  SheetBlock,
  TableBlock,
} from 'omniscript-parser';
import { escapeHtml } from '../utils/html-escape';
import { renderTextRun } from '../utils/text-renderer';
import { FormulaEvaluator } from '../utils/formula-evaluator';
import { toSpreadsheetData } from '../utils/spreadsheet-utils';
import { sanitizeAlignment, sanitizeCssClass } from '../utils/sanitize';
import { FormulaDefinition } from '../types';

export function renderHtml(doc: OSFDocument): string {
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
      case 'meta':
        parts.push(...renderMetaBlock(block as MetaBlock));
        break;
      case 'doc':
        parts.push(...renderDocBlock(block as DocBlock));
        break;
      case 'slide':
        parts.push(...renderSlideBlock(block as SlideBlock));
        break;
      case 'sheet':
        parts.push(...renderSheetBlock(block as SheetBlock));
        break;
      case 'table':
        parts.push(...renderTableBlock(block as TableBlock));
        break;
    }
  }

  parts.push('</body>', '</html>');
  return parts.join('\n');
}

function renderMetaBlock(meta: MetaBlock): string[] {
  const parts: string[] = [];
  if (typeof meta.props.title === 'string') {
    parts.push(`  <h1>${escapeHtml(meta.props.title)}</h1>`);
  }
  if (typeof meta.props.author === 'string') {
    parts.push(`  <p><strong>Author:</strong> ${escapeHtml(meta.props.author)}</p>`);
  }
  if (typeof meta.props.date === 'string') {
    parts.push(`  <p><strong>Date:</strong> ${escapeHtml(meta.props.date)}</p>`);
  }
  return parts;
}

function renderDocBlock(docBlock: DocBlock): string[] {
  const content = docBlock.content || '';
  // Simple Markdown-like processing with HTML escaping
  const processed = escapeHtml(content)
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  return [`  <div class="doc">${processed}</div>`];
}

function renderSlideBlock(slide: SlideBlock): string[] {
  const parts: string[] = [];
  parts.push('  <section class="slide">');

  if (slide.title) {
    parts.push(`    <h2>${escapeHtml(slide.title)}</h2>`);
  }

  if (slide.content && Array.isArray(slide.content)) {
    parts.push('    <div class="slide-content">');
    for (const block of slide.content) {
      if (block.type === 'unordered_list') {
        parts.push('      <ul>');
        for (const item of block.items) {
          const itemText = item.content.map(renderTextRun).join('');
          parts.push(`        <li>${itemText}</li>`);
        }
        parts.push('      </ul>');
      } else if (block.type === 'ordered_list') {
        parts.push('      <ol>');
        for (const item of block.items) {
          const itemText = item.content.map(renderTextRun).join('');
          parts.push(`        <li>${itemText}</li>`);
        }
        parts.push('      </ol>');
      } else if (block.type === 'paragraph') {
        const paragraphText = block.content.map(renderTextRun).join('');
        parts.push(`      <p>${paragraphText}</p>`);
      } else if (block.type === 'blockquote') {
        parts.push('      <blockquote>');
        for (const para of block.content) {
          const quoteText = para.content.map(renderTextRun).join('');
          parts.push(`        <p>${quoteText}</p>`);
        }
        parts.push('      </blockquote>');
      } else if (block.type === 'code') {
        const langClass = block.language ? ` class="language-${escapeHtml(block.language)}"` : '';
        const codeContent = escapeHtml(block.content);
        parts.push(`      <pre><code${langClass}>${codeContent}</code></pre>`);
      } else if (block.type === 'image') {
        parts.push(`      <img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt)}" />`);
      }
    }
    parts.push('    </div>');
  }

  parts.push('  </section>');
  return parts;
}

function renderSheetBlock(sheet: SheetBlock): string[] {
  const parts: string[] = [];

  if (sheet.name) {
    parts.push(`  <h3>${escapeHtml(sheet.name)}</h3>`);
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
      '    <thead><tr>' +
        cols.map((c: string) => `<th>${escapeHtml(c)}</th>`).join('') +
        '</tr></thead>'
    );
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

        parts.push(`        <td class="${cssClass}">${escapeHtml(String(cellContent))}</td>`);
      }
      parts.push('      </tr>');
    }
    parts.push('    </tbody>');
  }

  parts.push('  </table>');
  return parts;
}

function renderTableBlock(table: TableBlock): string[] {
  const parts: string[] = [];

  if (table.caption) {
    parts.push(`  <p><strong>${escapeHtml(table.caption)}</strong></p>`);
  }

  // Sanitize style class name (defense in depth)
  const styleClass = table.style ? ` class="table-${sanitizeCssClass(table.style)}"` : '';
  parts.push(`  <table${styleClass}>`);

  // Render header row
  parts.push('    <thead><tr>');
  table.headers.forEach((header, idx) => {
    // Sanitize alignment value (defense in depth)
    const align = sanitizeAlignment(table.alignment?.[idx]);
    parts.push(`      <th style="text-align: ${align}">${escapeHtml(header)}</th>`);
  });
  parts.push('    </tr></thead>');

  // Render data rows
  parts.push('    <tbody>');
  for (const row of table.rows) {
    parts.push('      <tr>');
    row.cells.forEach((cell, idx) => {
      // Sanitize alignment value (defense in depth)
      const align = sanitizeAlignment(table.alignment?.[idx]);
      parts.push(`        <td style="text-align: ${align}">${escapeHtml(cell.text)}</td>`);
    });
    parts.push('      </tr>');
  }
  parts.push('    </tbody>');

  parts.push('  </table>');
  return parts;
}
