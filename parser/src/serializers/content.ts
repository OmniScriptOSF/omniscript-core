// File: omniscript-core/parser/src/serializers/content.ts
// What: Serialization for content blocks (slides, code, diagrams, etc.)
// Why: Convert complex block types back to OSF syntax
// Related: block-parsers/slide.ts, block-parsers/sheet.ts, block-parsers/chart.ts

import {
  SlideBlock,
  SheetBlock,
  ChartBlock,
  DiagramBlock,
  OSFCodeBlock,
  ContentBlock,
} from '../types';
import { serializeValue, serializeTextRun } from './text';
import { escapeString } from '../lexer/strings';

export function serializeSlideBlock(block: SlideBlock): string {
  const parts: string[] = [];
  const { content, ...otherProps } = block;

  Object.entries(otherProps).forEach(([k, v]) => {
    if (k !== 'type' && v !== undefined) {
      parts.push(`  ${k}: ${serializeValue(v)};`);
    }
  });

  if (content) {
    if (parts.length > 0) parts.push('');
    content.forEach(contentBlock => {
      serializeContentBlock(contentBlock, parts);
    });
  }

  return `@slide {\n${parts.join('\n')}\n}`;
}

function serializeContentBlock(block: ContentBlock, parts: string[]): void {
  switch (block.type) {
    case 'paragraph':
      parts.push(`  ${block.content.map(serializeTextRun).join('')}`);
      break;
    case 'image':
      parts.push(`  ![${block.alt}](${block.url})`);
      break;
    case 'ordered_list':
      block.items.forEach((item, index) => {
        parts.push(`  ${index + 1}. ${item.content.map(serializeTextRun).join('')}`);
      });
      break;
    case 'unordered_list':
      block.items.forEach(item => {
        parts.push(`  - ${item.content.map(serializeTextRun).join('')}`);
      });
      break;
    case 'code':
      parts.push(`  \`\`\`${block.language || ''}`.trim());
      block.content.split('\n').forEach(l => parts.push(`  ${l.trim()}`));
      parts.push('  ```');
      break;
    case 'blockquote':
      block.content.forEach(p => {
        parts.push(`  > ${p.content.map(serializeTextRun).join('')}`);
      });
      break;
  }
}

export function serializeSheetBlock(block: SheetBlock): string {
  const parts: string[] = [];
  const { data, formulas, ...otherProps } = block;

  Object.entries(otherProps).forEach(([k, v]) => {
    if (k !== 'type' && v !== undefined) {
      parts.push(`  ${k}: ${serializeValue(v)};`);
    }
  });

  if (data && Object.keys(data).length > 0) {
    parts.push('  data {');
    Object.entries(data).forEach(([key, value]) => {
      parts.push(`    (${key}) = ${serializeValue(value)};`);
    });
    parts.push('  }');
  }

  if (formulas && formulas.length > 0) {
    formulas.forEach(formula => {
      const [row, col] = formula.cell;
      parts.push(`  formula (${row},${col}): "${formula.expr}";`);
    });
  }

  return `@sheet {\n${parts.join('\n')}\n}`;
}

export function serializeChartBlock(block: ChartBlock): string {
  const parts: string[] = [];
  parts.push(`  type: "${block.chartType}";`);
  parts.push(`  title: "${escapeString(block.title)}";`);

  // Serialize data array in OSF format
  const dataStr =
    '[' +
    block.data
      .map(
        series =>
          `{ label: "${escapeString(series.label)}"; values: [${series.values.join(', ')}]; }`
      )
      .join(', ') +
    ']';
  parts.push(`  data: ${dataStr};`);

  if (block.options) {
    const optsStr =
      '{ ' +
      Object.entries(block.options)
        .map(([k, v]) => {
          if (typeof v === 'boolean') return `${k}: ${v}`;
          if (Array.isArray(v)) return `${k}: [${v.map(x => `"${x}"`).join(', ')}]`;
          return `${k}: "${v}"`;
        })
        .join('; ') +
      '; }';
    parts.push(`  options: ${optsStr};`);
  }
  return `@chart {\n${parts.join('\n')}\n}`;
}

export function serializeDiagramBlock(block: DiagramBlock): string {
  const parts: string[] = [];
  parts.push(`  type: "${block.diagramType}";`);
  parts.push(`  engine: "${block.engine}";`);
  if (block.title) {
    parts.push(`  title: "${block.title}";`);
  }
  parts.push(`  code: "${escapeString(block.code)}";`);
  return `@diagram {\n${parts.join('\n')}\n}`;
}

export function serializeCodeBlock(block: OSFCodeBlock): string {
  const parts: string[] = [];
  parts.push(`  language: "${block.language}";`);
  if (block.caption) {
    parts.push(`  caption: "${block.caption}";`);
  }
  if (block.lineNumbers !== undefined) {
    parts.push(`  lineNumbers: ${block.lineNumbers};`);
  }
  if (block.highlight) {
    parts.push(`  highlight: ${serializeValue(block.highlight)};`);
  }
  parts.push(`  code: "${escapeString(block.code)}";`);
  return `@code {\n${parts.join('\n')}\n}`;
}
