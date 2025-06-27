import {
  OSFDocument,
  OSFBlock,
  MetaBlock,
  DocBlock,
  SlideBlock,
  SheetBlock,
  OSFValue,
} from './types';

interface RawBlock {
  type: string;
  content: string;
}

function findBlocks(input: string): RawBlock[] {
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
      throw new Error(`Missing closing } for block ${type}`);
    }

    const content = input.slice(match.index + match[0].length, end - 1);
    blocks.push({ type, content: content.trim() });
  }

  return blocks;
}

function removeComments(str: string): string {
  return str.replace(/\/\/.*$/gm, '');
}

function skipWS(str: string, i: number): number {
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

function parseIdentifier(str: string, i: number): { id: string; index: number } {
  const start = i;
  if (i >= str.length || !/[A-Za-z]/.test(str[i] || '')) {
    throw new Error('Expected identifier starting with a letter');
  }
  i++; // consume first letter
  while (i < str.length && /[A-Za-z0-9_%]/.test(str[i] || '')) i++;
  return { id: str.slice(start, i), index: i };
}

function parseString(str: string, i: number): { value: string; index: number } {
  let j = i + 1;
  let out = '';
  while (j < str.length && str[j] !== '"') {
    if (str[j] === '\\' && j + 1 < str.length) {
      // Handle escape sequences
      const nextChar = str[j + 1];
      switch (nextChar) {
        case '"':
          out += '"';
          break;
        case '\\':
          out += '\\';
          break;
        case 'n':
          out += '\n';
          break;
        case 't':
          out += '\t';
          break;
        case 'r':
          out += '\r';
          break;
        case 'b':
          out += '\b';
          break;
        case 'f':
          out += '\f';
          break;
        case 'v':
          out += '\v';
          break;
        case '0':
          out += '\0';
          break;
        case '/':
          out += '/';
          break;
        default:
          // For unknown escape sequences, preserve the backslash and character
          out += str[j] + (nextChar || '');
          break;
      }
      j += 2;
    } else {
      out += str[j];
      j++;
    }
  }
  return { value: out, index: j + 1 };
}

function parseNumber(str: string, i: number): { value: number; index: number } {
  let j = i;

  // Handle optional negative sign
  if (j < str.length && str[j] === '-') {
    j++;
  }

  // Parse digits and decimal point
  while (j < str.length && /[0-9.]/.test(str[j] || '')) j++;

  // Ensure we actually parsed some digits after the optional minus sign
  if (j === i || (j === i + 1 && str[i] === '-')) {
    throw new Error('Invalid number format');
  }

  return { value: Number(str.slice(i, j)), index: j };
}

function parseValue(str: string, i: number): { value: OSFValue; index: number } {
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

function parseKVInternal(str: string, i: number): { obj: Record<string, OSFValue>; index: number } {
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

function parseKV(content: string): Record<string, OSFValue> {
  const cleaned = removeComments(content);
  return parseKVInternal(cleaned, 0).obj;
}

function parseBullets(content: string): string[] {
  // Find the bullets block with proper brace matching
  const bulletMatch = /bullets\s*\{/.exec(content);
  if (!bulletMatch) return [];

  let i = bulletMatch.index + bulletMatch[0].length;
  let depth = 1;
  let bulletContent = '';

  // Find the matching closing brace, respecting quoted strings
  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === '"') {
      // Add the opening quote
      bulletContent += ch;
      i++;
      // Process the string content, preserving escape sequences
      while (i < content.length && content[i] !== '"') {
        if (content[i] === '\\' && i + 1 < content.length) {
          // Keep escape sequences as-is for now
          const currentChar = content[i];
          const nextChar = content[i + 1];
          if (currentChar && nextChar) {
            bulletContent += currentChar + nextChar;
          }
          i += 2;
        } else {
          bulletContent += content[i];
          i++;
        }
      }
      if (i < content.length) {
        bulletContent += content[i]; // closing quote
        i++;
      }
    } else if (ch === '{') {
      depth++;
      bulletContent += ch;
      i++;
    } else if (ch === '}') {
      depth--;
      if (depth > 0) {
        bulletContent += ch;
      }
      i++;
    } else {
      bulletContent += ch;
      i++;
    }
  }

  if (depth > 0) {
    throw new Error('Unclosed bullets block');
  }

  // Parse individual bullet items more carefully
  const bullets: string[] = [];
  let j = 0;

  while (j < bulletContent.length) {
    j = skipWS(bulletContent, j);
    if (j >= bulletContent.length) break;

    if (bulletContent[j] === '"') {
      // Parse quoted string using the existing parseString function
      const result = parseString(bulletContent, j);
      bullets.push(result.value);
      j = result.index;

      // Skip whitespace and optional semicolon
      j = skipWS(bulletContent, j);
      if (j < bulletContent.length && bulletContent[j] === ';') {
        j++;
      }
    } else {
      // Handle unquoted content (skip to next semicolon or end)
      const start = j;
      while (j < bulletContent.length && bulletContent[j] !== ';') {
        j++;
      }
      const item = bulletContent.slice(start, j).trim();
      if (item) {
        bullets.push(item);
      }
      if (j < bulletContent.length && bulletContent[j] === ';') {
        j++;
      }
    }
  }

  return bullets;
}

function removeBulletsBlock(content: string): string {
  const bulletMatch = /bullets\s*\{/.exec(content);
  if (!bulletMatch) return content;

  let i = bulletMatch.index + bulletMatch[0].length;
  let depth = 1;

  // Find the matching closing brace, respecting quoted strings
  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === '"') {
      // Skip over quoted string
      i++;
      while (i < content.length && content[i] !== '"') {
        if (content[i] === '\\' && i + 1 < content.length) {
          i += 2;
        } else {
          i++;
        }
      }
      if (i < content.length) {
        i++; // closing quote
      }
    } else if (ch === '{') {
      depth++;
      i++;
    } else if (ch === '}') {
      depth--;
      i++;
    } else {
      i++;
    }
  }

  // Remove the entire bullets block
  return content.slice(0, bulletMatch.index) + content.slice(i);
}

function parseSheetData(content: string): Record<string, OSFValue> {
  const dataMatch = /data\s*\{/.exec(content);
  if (!dataMatch) return {};

  // Find the matching closing brace, respecting nested braces and quoted strings
  let i = dataMatch.index + dataMatch[0].length;
  let depth = 1;
  let dataContent = '';

  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === '"') {
      // Add the opening quote
      dataContent += ch;
      i++;
      // Process the string content, preserving escape sequences
      while (i < content.length && content[i] !== '"') {
        if (content[i] === '\\' && i + 1 < content.length) {
          // Keep escape sequences as-is
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
        dataContent += content[i]; // closing quote
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

    // Look for pattern: (row,col) = value;
    const cellMatch = /^\((\d+),(\d+)\)\s*=\s*/.exec(dataContent.slice(j));
    if (!cellMatch) {
      // Skip to next semicolon or end
      while (j < dataContent.length && dataContent[j] !== ';') j++;
      if (j < dataContent.length) j++; // skip semicolon
      continue;
    }

    const row = cellMatch[1];
    const col = cellMatch[2];
    j += cellMatch[0].length;

    // Parse the value
    try {
      const valueResult = parseValue(dataContent, j);
      if (row && col) {
        const key = `${row},${col}`;
        data[key] = valueResult.value;
      }
      j = valueResult.index;
    } catch {
      // If parsing fails, skip to next semicolon
      while (j < dataContent.length && dataContent[j] !== ';') j++;
    }

    // Skip optional semicolon
    j = skipWS(dataContent, j);
    if (j < dataContent.length && dataContent[j] === ';') {
      j++;
    }
  }

  return data;
}

export function parse(input: string): OSFDocument {
  const blocksRaw = findBlocks(input);
  const blocks: OSFBlock[] = blocksRaw.map(b => {
    switch (b.type) {
      case 'meta': {
        const props = parseKV(b.content);
        return { type: 'meta', props } as MetaBlock;
      }
      case 'doc': {
        return { type: 'doc', content: b.content } as DocBlock;
      }
      case 'slide': {
        const slide: SlideBlock = { type: 'slide' };

        // Use the new bullet parser
        const bullets = parseBullets(b.content);
        slide.bullets = bullets;

        // Remove bullets block from content before parsing other properties
        const rest = removeBulletsBlock(b.content);
        Object.assign(slide, parseKV(rest));
        return slide;
      }
      case 'sheet': {
        const sheet: SheetBlock = { type: 'sheet', data: {}, formulas: [] };

        // Use the new sheet data parser
        sheet.data = parseSheetData(b.content);

        const formulaRegex = /formula\s*\((\d+),(\d+)\)\s*:\s*"([^"]*)";/g;
        let fm: RegExpExecArray | null;
        while ((fm = formulaRegex.exec(b.content))) {
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
        const restSheet = b.content
          .replace(/data\s*\{[\s\S]*?\}/, '')
          .replace(formulaRegex, '')
          .trim();
        if (restSheet) {
          try {
            Object.assign(sheet, parseKV(restSheet));
          } catch {
            // If parsing the remaining content fails, skip it
            // This can happen if there's only whitespace or invalid content
          }
        }
        return sheet;
      }
      default: {
        return { type: 'doc', content: b.content } as DocBlock;
      }
    }
  });
  return { blocks };
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\t/g, '\\t') // Escape tabs
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(String.fromCharCode(8), '\\b') // Escape backspaces
    .replace(/\f/g, '\\f') // Escape form feeds
    .replace(/\v/g, '\\v') // Escape vertical tabs
    .replace(/\0/g, '\\0'); // Escape null characters
}

function serializeValue(v: OSFValue): string {
  if (Array.isArray(v)) return `[${v.map(serializeValue).join(', ')}]`;
  if (v && typeof v === 'object') {
    const inner = Object.entries(v)
      .map(([k, val]) => `${k}: ${serializeValue(val)};`)
      .join(' ');
    return `{ ${inner} }`;
  }
  if (typeof v === 'string') return `"${escapeString(v)}"`;
  return String(v);
}

export function serialize(doc: OSFDocument): string {
  return doc.blocks
    .map(b => {
      switch (b.type) {
        case 'meta': {
          const metaBlock = b as MetaBlock;
          const entries = Object.entries(metaBlock.props)
            .map(([k, v]) => `  ${k}: ${serializeValue(v)};`)
            .join('\n');
          return `@meta {\n${entries}\n}`;
        }
        case 'doc': {
          const docBlock = b as DocBlock;
          return `@doc {\n${docBlock.content}\n}`;
        }
        case 'slide': {
          const slideBlock = b as SlideBlock;
          const parts: string[] = [];

          // Add other properties first
          const { bullets, ...otherProps } = slideBlock;
          Object.entries(otherProps).forEach(([k, v]) => {
            if (k !== 'type' && v !== undefined) {
              parts.push(`  ${k}: ${serializeValue(v)};`);
            }
          });

          // Add bullets if they exist (including empty arrays for consistency)
          if (bullets !== undefined) {
            parts.push('  bullets {');
            bullets.forEach(bullet => {
              parts.push(`    "${escapeString(bullet)}";`);
            });
            parts.push('  }');
          }

          return `@slide {\n${parts.join('\n')}\n}`;
        }
        case 'sheet': {
          const sheetBlock = b as SheetBlock;
          const parts: string[] = [];

          // Add other properties first
          const { data, formulas, ...otherProps } = sheetBlock;
          Object.entries(otherProps).forEach(([k, v]) => {
            if (k !== 'type' && v !== undefined) {
              parts.push(`  ${k}: ${serializeValue(v)};`);
            }
          });

          // Add data if it exists
          if (data && Object.keys(data).length > 0) {
            parts.push('  data {');
            Object.entries(data).forEach(([key, value]) => {
              parts.push(`    (${key}) = ${serializeValue(value)};`);
            });
            parts.push('  }');
          }

          // Add formulas if they exist
          if (formulas && formulas.length > 0) {
            formulas.forEach(formula => {
              const [row, col] = formula.cell;
              parts.push(`  formula (${row},${col}): "${formula.expr}";`);
            });
          }

          return `@sheet {\n${parts.join('\n')}\n}`;
        }
        default: {
          const docBlock = b as DocBlock;
          return `@doc {\n${docBlock.content || ''}\n}`;
        }
      }
    })
    .join('\n\n');
}
