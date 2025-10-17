// File: omniscript-core/parser/src/block-parsers/sheet.ts
// What: Parser for @sheet blocks for spreadsheets
// Why: Extract cell data, formulas, and sheet properties
// Related: types.ts, lexer/index.ts

import { SheetBlock, OSFValue } from '../types';
import { parseKV, parseValue, skipWS } from '../lexer';

function parseSheetData(content: string): Record<string, OSFValue> {
  const dataMatch = /data\s*\{/.exec(content);
  if (!dataMatch) return {};

  let i = dataMatch.index + dataMatch[0].length;
  let depth = 1;
  let dataContent = '';

  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === '"') {
      dataContent += ch;
      i++;
      while (i < content.length && content[i] !== '"') {
        if (content[i] === '\\' && i + 1 < content.length) {
          const currentChar = content[i];
          const nextChar = content[i + 1];
          if (currentChar && nextChar) {
            dataContent += currentChar + nextChar;
          }
          i += 2;
        } else {
          dataContent += content[i];
          i++;
        }
      }
      if (i < content.length) {
        dataContent += content[i];
        i++;
      }
    } else if (ch === '{') {
      depth++;
      dataContent += ch;
      i++;
    } else if (ch === '}') {
      depth--;
      if (depth > 0) {
        dataContent += ch;
      }
      i++;
    } else {
      dataContent += ch;
      i++;
    }
  }

  if (depth > 0) {
    throw new Error('Unclosed data block');
  }

  const data: Record<string, OSFValue> = {};
  let j = 0;

  while (j < dataContent.length) {
    j = skipWS(dataContent, j);
    if (j >= dataContent.length) break;

    const cellMatch = /^\((\d+),(\d+)\)\s*=\s*/.exec(dataContent.slice(j));
    if (!cellMatch) {
      while (j < dataContent.length && dataContent[j] !== ';') j++;
      if (j < dataContent.length) j++;
      continue;
    }

    const row = cellMatch[1];
    const col = cellMatch[2];
    j += cellMatch[0].length;

    try {
      const valueResult = parseValue(dataContent, j);
      if (row && col) {
        const key = `${row},${col}`;
        data[key] = valueResult.value;
      }
      j = valueResult.index;
    } catch {
      while (j < dataContent.length && dataContent[j] !== ';') j++;
    }

    j = skipWS(dataContent, j);
    if (j < dataContent.length && dataContent[j] === ';') {
      j++;
    }
  }

  return data;
}

export function parseSheetBlock(content: string): SheetBlock {
  const sheet: SheetBlock = { type: 'sheet', data: {}, formulas: [] };
  sheet.data = parseSheetData(content);

  const formulaRegex = /formula\s*\((\d+),(\d+)\)\s*:\s*"([^"]*)";/g;
  let fm: RegExpExecArray | null;
  while ((fm = formulaRegex.exec(content))) {
    const row = fm[1];
    const col = fm[2];
    const expr = fm[3];
    if (row && col && expr && sheet.formulas) {
      sheet.formulas.push({
        cell: [Number(row), Number(col)],
        expr,
      });
    }
  }
  const restSheet = content
    .replace(/data\s*\{[\s\S]*?\}/, '')
    .replace(formulaRegex, '')
    .trim();
  if (restSheet) {
    try {
      Object.assign(sheet, parseKV(restSheet));
    } catch {
      // Silently ignore parsing errors for optional sheet properties
      // Properties are validated at the type level
    }
  }
  return sheet;
}
