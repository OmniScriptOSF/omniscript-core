// File: omniscript-core/parser/src/lexer/tokenizer.ts
// What: Core tokenization functions for OSF syntax
// Why: Break down OSF text into parseable tokens
// Related: lexer/index.ts, parser.ts

import { getLineColumn } from '../utils/position';
import { parseString } from './strings';
import { OSFValue } from '../types';

export interface RawBlock {
  type: string;
  content: string;
}

export function findBlocks(input: string): RawBlock[] {
  const blocks: RawBlock[] = [];
  const regex = /@(\w+)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input))) {
    const type = match[1];
    if (!type) continue;

    let depth = 1;
    let end = match.index + match[0].length;

    while (end < input.length && depth > 0) {
      const ch = input[end];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      end++;
    }

    if (depth > 0) {
      const { line, column } = getLineColumn(input, end);
      throw new Error(`Missing closing } for block ${type} at ${line}:${column}`);
    }

    const content = input.slice(match.index + match[0].length, end - 1);
    blocks.push({ type, content: content.trim() });
  }

  return blocks;
}

export function skipWS(str: string, i: number): number {
  while (i < str.length) {
    const ch = str[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }
    if (str.slice(i).startsWith('//')) {
      i = str.indexOf('\n', i);
      if (i === -1) return str.length;
      i++;
      continue;
    }
    break;
  }
  return i;
}

export function parseIdentifier(str: string, i: number): { id: string; index: number } {
  const start = i;
  if (i >= str.length || !/[A-Za-z]/.test(str[i] || '')) {
    const { line, column } = getLineColumn(str, i);
    throw new Error(`Expected identifier starting with a letter at ${line}:${column}`);
  }
  i++; // consume first letter
  while (i < str.length && /[A-Za-z0-9_%]/.test(str[i] || '')) i++;
  return { id: str.slice(start, i), index: i };
}

export function parseNumber(str: string, i: number): { value: number; index: number } {
  let j = i;

  // Handle optional negative sign
  if (j < str.length && str[j] === '-') {
    j++;
  }

  const digitStart = j;
  
  // Parse digits and decimal point
  while (j < str.length && /[0-9.]/.test(str[j] || '')) j++;

  // Ensure we actually parsed some digits after the optional minus sign
  if (j === i || j === digitStart) {
    const { line, column } = getLineColumn(str, i);
    throw new Error(`Invalid number format at ${line}:${column}`);
  }

  const numStr = str.slice(i, j);
  const value = Number(numStr);
  
  // Validate the parsed number is valid
  if (isNaN(value) || !isFinite(value)) {
    const { line, column } = getLineColumn(str, i);
    throw new Error(`Invalid number "${numStr}" at ${line}:${column}`);
  }

  return { value, index: j };
}

export function parseValue(str: string, i: number): { value: OSFValue; index: number } {
  i = skipWS(str, i);
  const ch = str[i];
  if (!ch) throw new Error('Unexpected end of input');

  if (ch === '"') return parseString(str, i);
  if (ch === '[') {
    i++;
    const arr: OSFValue[] = [];
    i = skipWS(str, i);
    while (i < str.length && str[i] !== ']') {
      const v = parseValue(str, i);
      arr.push(v.value);
      i = skipWS(str, v.index);
      if (str[i] === ',') {
        i++;
        i = skipWS(str, i);
      }
    }
    return { value: arr, index: i + 1 };
  }
  if (ch === '{') {
    const res = parseKVInternal(str, i + 1);
    return { value: res.obj, index: res.index + 1 };
  }
  if (/\d/.test(ch)) return parseNumber(str, i);
  if (ch === '-' && i + 1 < str.length && /\d/.test(str[i + 1] || '')) return parseNumber(str, i);
  if (str.startsWith('true', i)) return { value: true, index: i + 4 };
  if (str.startsWith('false', i)) return { value: false, index: i + 5 };
  const id = parseIdentifier(str, i);
  return { value: id.id, index: id.index };
}

export function parseKVInternal(str: string, i: number): { obj: Record<string, OSFValue>; index: number } {
  const obj: Record<string, OSFValue> = {};
  while (i < str.length) {
    i = skipWS(str, i);
    if (i >= str.length || str[i] === '}') break;
    const keyRes = parseIdentifier(str, i);
    const key = keyRes.id;
    i = skipWS(str, keyRes.index);
    if (str[i] !== ':') throw new Error('Expected :');
    i++;
    const valRes = parseValue(str, i);
    i = skipWS(str, valRes.index);
    if (str[i] !== ';') throw new Error('Expected ;');
    i++;
    obj[key] = valRes.value;
  }
  return { obj, index: i };
}
