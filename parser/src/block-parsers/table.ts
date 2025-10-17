// File: omniscript-core/parser/src/block-parsers/table.ts
// What: Parser for @table blocks with markdown-style syntax
// Why: Enable tabular data in OSF documents
// Related: types.ts, serializers/table.ts

import { TableBlock, TableRow } from '../types';
import { parseKV } from '../lexer';

export function parseTableBlock(content: string): TableBlock {
  // Parse properties (caption, style, alignment)
  const lines = content.trim().split('\n');
  const kvLines: string[] = [];
  const tableLines: string[] = [];

  // Separate property lines from table lines
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      tableLines.push(trimmed);
    } else if (trimmed.includes(':') && trimmed.endsWith(';')) {
      kvLines.push(trimmed);
    }
  }

  // Parse properties
  const properties = kvLines.length > 0 ? parseKV(kvLines.join('\n')) : {};

  // Validate table has at least header and separator
  if (tableLines.length < 2) {
    throw new Error(
      `Table must have at least header and separator rows (found ${tableLines.length} line${tableLines.length === 1 ? '' : 's'})`
    );
  }

  // Parse header row
  const headerLine = tableLines[0];
  if (!headerLine) {
    throw new Error('Table header row is missing');
  }
  const headers = parseTableRow(headerLine);
  const expectedColumnCount = headers.length;

  if (expectedColumnCount === 0) {
    throw new Error('Table must have at least one column');
  }

  // Skip separator row (second line with dashes)
  // Parse data rows (everything after separator) with validation
  const rows: TableRow[] = [];
  for (let i = 2; i < tableLines.length; i++) {
    const line = tableLines[i];
    if (line) {
      const cells = parseTableRow(line);

      // Validate column count matches header
      if (cells.length !== expectedColumnCount) {
        throw new Error(
          `Table row ${i - 1} has ${cells.length} column${cells.length === 1 ? '' : 's'}, ` +
            `expected ${expectedColumnCount} to match header`
        );
      }

      rows.push({ cells: cells.map(text => ({ text })) });
    }
  }

  const table: TableBlock = {
    type: 'table',
    headers,
    rows,
  };

  // Add optional properties only if present and valid
  if (properties.caption && typeof properties.caption === 'string') {
    table.caption = properties.caption;
  }
  if (properties.style && typeof properties.style === 'string') {
    const style = properties.style as string;
    if (style === 'bordered' || style === 'striped' || style === 'minimal') {
      table.style = style;
    }
  }
  if (properties.alignment && Array.isArray(properties.alignment)) {
    // Validate all alignment values
    const validAlignments: ('left' | 'center' | 'right')[] = [];

    for (let i = 0; i < properties.alignment.length; i++) {
      const val = properties.alignment[i];
      if (val === 'left' || val === 'center' || val === 'right') {
        validAlignments.push(val);
      } else {
        throw new Error(
          `Invalid alignment value at index ${i}: "${val}". Must be "left", "center", or "right"`
        );
      }
    }

    // Validate length matches headers
    if (validAlignments.length !== expectedColumnCount) {
      throw new Error(
        `Alignment array length (${validAlignments.length}) must match number of columns (${expectedColumnCount})`
      );
    }

    table.alignment = validAlignments;
  }

  return table;
}

function parseTableRow(line: string): string[] {
  // Split by | and remove first/last empty elements
  const parts = line.split('|');
  const cells = parts.slice(1, -1).map(cell => cell.trim());
  return cells;
}
