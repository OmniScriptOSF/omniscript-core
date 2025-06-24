import { OSFDocument, OSFBlock, MetaBlock, DocBlock, SlideBlock, SheetBlock } from './types';

function findBlocks(input: string): { type: string; content: string }[] {
  const blocks: { type: string; content: string }[] = [];
  const regex = /@(\w+)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input))) {
    const type = match[1];
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
  let start = i;
  while (i < str.length && /[A-Za-z0-9_%]/.test(str[i])) i++;
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
  while (j < str.length && /[0-9.]/.test(str[j])) j++;
  return { value: Number(str.slice(i, j)), index: j };
}

function parseValue(str: string, i: number): { value: any; index: number } {
  i = skipWS(str, i);
  const ch = str[i];
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
  if (/\d/.test(ch)) return parseNumber(str, i);
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
      case 'meta':
        const props = parseKV(b.content);
        return { type: 'meta', props } as MetaBlock;
      case 'doc':
        return { type: 'doc', content: b.content } as DocBlock;
      case 'slide':
        const slide: SlideBlock = { type: 'slide' };
        const bulletMatch = /bullets\s*\{([\s\S]*?)\}/.exec(b.content);
        if (bulletMatch) {
          const items = bulletMatch[1].split(/;\s*/).map(s => s.trim()).filter(Boolean);
          slide.bullets = items.map(it => it.replace(/^"|"$/g, ''));
        }
        const rest = b.content.replace(/bullets\s*\{[\s\S]*?\}/, '');
        Object.assign(slide, parseKV(rest));
        return slide;
      case 'sheet':
        const sheet: SheetBlock = { type: 'sheet', data: {}, formulas: [] };
        const dataMatch = /data\s*\{([\s\S]*?)\}/.exec(b.content);
        if (dataMatch) {
          const assigns = dataMatch[1].split(/;\s*/).map(s => s.trim()).filter(Boolean);
          for (const a of assigns) {
            const m = /^\((\d+),(\d+)\)\s*=\s*(.+)$/.exec(a);
            if (m) {
              const key = `${m[1]},${m[2]}`;
              let val: any = m[3];
              if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
              else if (!isNaN(Number(val))) val = Number(val);
              sheet.data![key] = val;
            }
          }
        }
        const formulaRegex = /formula\s*\((\d+),(\d+)\)\s*:\s*"([^"]*)";/g;
        let fm: RegExpExecArray | null;
        while ((fm = formulaRegex.exec(b.content))) {
          sheet.formulas!.push({ cell: [Number(fm[1]), Number(fm[2])], expr: fm[3] });
        }
        const restSheet = b.content
          .replace(/data\s*\{[\s\S]*?\}/, '')
          .replace(formulaRegex, '');
        Object.assign(sheet, parseKV(restSheet));
        return sheet;
      default:
        return { type: 'doc', content: b.content } as DocBlock;
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
        case 'meta':
          const entries = Object.entries(b.props)
            .map(([k, v]) => `${k}: ${serializeValue(v)};`)
            .join(' ');
          return `@meta {\n  ${entries}\n}`;
        case 'doc':
          return `@doc {\n${b.content}\n}`;
        case 'slide':
          const bulletStr = b.bullets && b.bullets.length
            ? `bullets {\n    ${b.bullets.map(i => '"' + i + '";').join(' ')}\n  }\n`
            : '';
          const other = { ...b } as any;
          delete other.type;
          delete other.bullets;
          const kv = Object.entries(other)
            .map(([k, v]) => `${k}: ${serializeValue(v)};`)
            .join(' ');
          return `@slide {\n  ${kv}\n  ${bulletStr}}`;
        case 'sheet':
          const parts: string[] = [];
          const otherSheet = { ...b } as any;
          delete otherSheet.type;
          const dataObj = otherSheet.data; delete otherSheet.data;
          const formulas = otherSheet.formulas; delete otherSheet.formulas;
          const kvs = Object.entries(otherSheet)
            .map(([k, v]) => `${k}: ${serializeValue(v)};`)
            .join(' ');
          if (kvs) parts.push(kvs);
          if (dataObj && Object.keys(dataObj).length) {
            const rows = Object.entries(dataObj)
              .map(([cell, val]) => `(${cell})=${serializeValue(val)};`)
              .join(' ');
            parts.push(`data {\n    ${rows}\n  }`);
          }
          if (formulas && formulas.length) {
            for (const f of formulas) {
              parts.push(`formula (${f.cell[0]},${f.cell[1]}): "${f.expr}";`);
            }
          }
          return `@sheet {\n  ${parts.join('\n  ')}\n}`;
        default:
          return '';
      }
    })
    .join('\n\n');
}
