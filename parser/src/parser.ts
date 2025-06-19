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
    const content = input.slice(match.index + match[0].length, end - 1);
    blocks.push({ type, content: content.trim() });
  }
  return blocks;
}

function parseKV(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  const kvRegex = /(\w+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = kvRegex.exec(content))) {
    let value: any = m[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (!isNaN(Number(value))) {
      value = Number(value);
    }
    result[m[1]] = value;
  }
  return result;
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

export function serialize(doc: OSFDocument): string {
  return doc.blocks
    .map(b => {
      switch (b.type) {
        case 'meta':
          const entries = Object.entries(b.props)
            .map(([k, v]) => `${k}: ${typeof v === 'string' ? '"' + v + '"' : v};`)
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
            .map(([k, v]) => `${k}: ${typeof v === 'string' ? '"' + v + '"' : v};`)
            .join(' ');
          return `@slide {\n  ${kv}\n  ${bulletStr}}`;
        case 'sheet':
          const parts: string[] = [];
          const otherSheet = { ...b } as any;
          delete otherSheet.type;
          const dataObj = otherSheet.data; delete otherSheet.data;
          const formulas = otherSheet.formulas; delete otherSheet.formulas;
          const kvs = Object.entries(otherSheet)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${(v as any[]).join(', ')}]` : (typeof v === 'string' ? '"' + v + '"' : v)};`)
            .join(' ');
          if (kvs) parts.push(kvs);
          if (dataObj && Object.keys(dataObj).length) {
            const rows = Object.entries(dataObj)
              .map(([cell, val]) => `(${cell})=${typeof val === 'string' ? '"' + val + '"' : val};`)
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
