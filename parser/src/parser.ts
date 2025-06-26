import { OSFDocument, OSFBlock, MetaBlock, DocBlock, SlideBlock, SheetBlock } from './types';

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
  if (i >= str.length || !/[A-Za-z]/.test(str[i]!)) {
    throw new Error('Expected identifier starting with a letter');
  }
  i++; // consume first letter
  while (i < str.length && /[A-Za-z0-9_%]/.test(str[i]!)) i++;
  return { id: str.slice(start, i), index: i };
}

function parseString(str: string, i: number): { value: string; index: number } {
  let j = i + 1;
  let out = '';
  while (j < str.length && str[j] !== '"') {
    out += str[j++];
  }
  return { value: out, index: j + 1 };
}

function parseNumber(str: string, i: number): { value: number; index: number } {
  let j = i;
  if (str[j] === '-') j++; // handle optional negative sign
  while (j < str.length && /[0-9.]/.test(str[j]!)) j++;
  return { value: Number(str.slice(i, j)), index: j };
}

function parseValue(str: string, i: number): { value: any; index: number } {
  i = skipWS(str, i);
  const ch = str[i];
  if (!ch) throw new Error('Unexpected end of input');

  if (ch === '"') return parseString(str, i);
  if (ch === '[') {
    i++;
    const arr: any[] = [];
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
  if (ch === '-' || /\d/.test(ch)) return parseNumber(str, i);
  if (str.startsWith('true', i)) return { value: true, index: i + 4 };
  if (str.startsWith('false', i)) return { value: false, index: i + 5 };
  const id = parseIdentifier(str, i);
  return { value: id.id, index: id.index };
}

function parseKVInternal(str: string, i: number): { obj: Record<string, any>; index: number } {
  const obj: Record<string, any> = {};
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

function parseKV(content: string): Record<string, any> {
  const cleaned = removeComments(content);
  return parseKVInternal(cleaned, 0).obj;
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
        const bulletMatch = /bullets\s*\{([\s\S]*?)\}/.exec(b.content);
        if (bulletMatch) {
          const bulletContent = bulletMatch[1];
          if (bulletContent) {
            const items = bulletContent
              .split(/;\s*/)
              .map(s => s.trim())
              .filter(Boolean);
            slide.bullets = items.map(it => it.replace(/^"|"$/g, ''));
          }
        }
        const rest = b.content.replace(/bullets\s*\{[\s\S]*?\}/, '');
        Object.assign(slide, parseKV(rest));
        return slide;
      }
      case 'sheet': {
        const sheet: SheetBlock = { type: 'sheet', data: {}, formulas: [] };
        const dataMatch = /data\s*\{([\s\S]*?)\}/.exec(b.content);
        if (dataMatch) {
          const dataContent = dataMatch[1];
          if (dataContent) {
            const assigns = dataContent
              .split(/;\s*/)
              .map(s => s.trim())
              .filter(Boolean);
            for (const a of assigns) {
              const m = /^\((\d+),(\d+)\)\s*=\s*(.+)$/.exec(a);
              if (m) {
                const row = m[1];
                const col = m[2];
                const value = m[3];
                if (row && col && value !== undefined) {
                  const key = `${row},${col}`;
                  let val: any = value;
                  if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                  } else if (!isNaN(Number(val))) {
                    val = Number(val);
                  }
                  sheet.data![key] = val;
                }
              }
            }
          }
        }
        const formulaRegex = /formula\s*\((\d+),(\d+)\)\s*:\s*"([^"]*)";/g;
        let fm: RegExpExecArray | null;
        while ((fm = formulaRegex.exec(b.content))) {
          const row = fm[1];
          const col = fm[2];
          const expr = fm[3];
          if (row && col && expr) {
            sheet.formulas!.push({
              cell: [Number(row), Number(col)],
              expr,
            });
          }
        }
        const restSheet = b.content.replace(/data\s*\{[\s\S]*?\}/, '').replace(formulaRegex, '');
        Object.assign(sheet, parseKV(restSheet));
        return sheet;
      }
      default: {
        return { type: 'doc', content: b.content } as DocBlock;
      }
    }
  });
  return { blocks };
}

function serializeValue(v: any): string {
  if (Array.isArray(v)) return `[${v.map(serializeValue).join(', ')}]`;
  if (v && typeof v === 'object') {
    const inner = Object.entries(v)
      .map(([k, val]) => `${k}: ${serializeValue(val)};`)
      .join(' ');
    return `{ ${inner} }`;
  }
  if (typeof v === 'string') return `"${v}"`;
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

          // Add bullets if they exist
          if (bullets && bullets.length > 0) {
            parts.push('  bullets {');
            bullets.forEach(bullet => {
              parts.push(`    "${bullet}";`);
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
          return `@doc {\n${(b as any).content || ''}\n}`;
        }
      }
    })
    .join('\n\n');
}
