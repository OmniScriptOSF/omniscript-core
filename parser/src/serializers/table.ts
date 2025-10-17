// File: omniscript-core/parser/src/serializers/table.ts
// What: Serializer for @table blocks
// Why: Round-trip support for tables
// Related: block-parsers/table.ts

import { TableBlock } from '../types';
import { escapeString } from '../lexer/strings';

export function serializeTableBlock(block: TableBlock): string {
  const parts: string[] = ['@table {'];

  // Add properties
  if (block.caption) {
    parts.push(`  caption: "${escapeString(block.caption)}";`);
  }
  if (block.style) {
    parts.push(`  style: "${block.style}";`);
  }
  if (block.alignment) {
    const alignmentStr = block.alignment.map(a => `"${a}"`).join(', ');
    parts.push(`  alignment: [${alignmentStr}];`);
  }

  // Add blank line before table
  if (block.caption || block.style || block.alignment) {
    parts.push('');
  }

  // Add header row
  parts.push('  ' + formatTableRow(block.headers));

  // Add separator row
  parts.push('  ' + formatSeparatorRow(block.headers.length));

  // Add data rows
  for (const row of block.rows) {
    parts.push('  ' + formatTableRow(row.cells.map(c => c.text)));
  }

  parts.push('}');
  return parts.join('\n');
}

function formatTableRow(cells: string[]): string {
  return '| ' + cells.join(' | ') + ' |';
}

function formatSeparatorRow(columnCount: number): string {
  const separators = Array(columnCount).fill('---');
  return '| ' + separators.join(' | ') + ' |';
}
