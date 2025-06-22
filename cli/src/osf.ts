import { readFileSync } from 'fs';
import { parse, serialize, OSFDocument, OSFBlock } from '../../parser/dist';

function renderHtml(doc: OSFDocument): string {
  const parts: string[] = ['<html><body>'];
  for (const block of doc.blocks) {
    switch (block.type) {
      case 'doc':
        parts.push(`<p>${(block as any).content}</p>`);
        break;
      case 'slide':
        parts.push('<section class="slide">');
        if ((block as any).title) {
          parts.push(`<h2>${(block as any).title}</h2>`);
        }
        if ((block as any).bullets) {
          parts.push('<ul>');
          for (const b of (block as any).bullets) {
            parts.push(`<li>${b}</li>`);
          }
          parts.push('</ul>');
        }
        parts.push('</section>');
        break;
      case 'sheet':
        const sheet = block as any;
        parts.push('<table>');
        if (sheet.cols) {
          const cols = Array.isArray(sheet.cols)
            ? sheet.cols
            : String(sheet.cols)
                .replace(/[\[\]]/g, '')
                .split(',')
                .map((s: string) => s.trim());
          parts.push('<tr>' + cols.map((c: string) => `<th>${c}</th>`).join('') + '</tr>');
        }
        if (sheet.data) {
          const rows: Record<string, any> = sheet.data;
          const coords = Object.keys(rows).map(k => k.split(',').map(Number));
          const maxRow = Math.max(...coords.map(c => c[0]));
          const maxCol = Math.max(...coords.map(c => c[1]));
          for (let r = 1; r <= maxRow; r++) {
            parts.push('<tr>');
            for (let c = 1; c <= maxCol; c++) {
              const key = `${r},${c}`;
              const val = rows[key] ?? '';
              parts.push(`<td>${val}</td>`);
            }
            parts.push('</tr>');
          }
        }
        parts.push('</table>');
        break;
    }
  }
  parts.push('</body></html>');
  return parts.join('');
}

function exportMarkdown(doc: OSFDocument): string {
  const out: string[] = [];
  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta':
        out.push('---');
        for (const [k, v] of Object.entries((block as any).props)) {
          if (typeof v === 'string') out.push(`${k}: ${v}`);
          else out.push(`${k}: ${JSON.stringify(v)}`);
        }
        out.push('---');
        out.push('');
        break;
      case 'doc':
        out.push((block as any).content);
        break;
      case 'slide':
        if ((block as any).title) out.push('## ' + (block as any).title);
        if ((block as any).bullets) {
          for (const b of (block as any).bullets) {
            out.push('- ' + b);
          }
        }
        out.push('');
        break;
      case 'sheet': {
        const sheet = block as any;
        if (sheet.cols) {
          const cols = Array.isArray(sheet.cols)
            ? sheet.cols
            : String(sheet.cols)
                .replace(/[\[\]]/g, '')
                .split(',')
                .map((s: string) => s.trim());
          out.push('| ' + cols.join(' | ') + ' |');
          out.push('|' + cols.map(() => '---').join('|') + '|');
        }
        if (sheet.data) {
          const rows: Record<string, any> = sheet.data;
          const coords = Object.keys(rows).map(k => k.split(',').map(Number));
          const maxRow = Math.max(...coords.map(c => c[0]));
          const maxCol = Math.max(...coords.map(c => c[1]));
          for (let r = 1; r <= maxRow; r++) {
            const cells: string[] = [];
            for (let c = 1; c <= maxCol; c++) {
              const key = `${r},${c}`;
              const val = rows[key] ?? '';
              cells.push(String(val));
            }
            out.push('| ' + cells.join(' | ') + ' |');
          }
        }
        out.push('');
        break;
      }
    }
  }
  return out.join('\n');
}

function load(file: string): string {
  return readFileSync(file, 'utf8');
}

const [, , command, ...rest] = process.argv;

switch (command) {
  case 'parse': {
    const text = load(rest[0]);
    const doc = parse(text);
    console.log(JSON.stringify(doc, null, 2));
    break;
  }
  case 'lint': {
    try {
      parse(load(rest[0]));
      console.log('OK');
    } catch (err: any) {
      console.error(`Lint error: ${err.message}`);
      process.exit(1);
    }
    break;
  }
  case 'diff': {
    const docA = parse(load(rest[0]));
    const docB = parse(load(rest[1]));
    const same = JSON.stringify(docA) === JSON.stringify(docB);
    console.log(same ? 'No differences' : 'Documents differ');
    if (!same) process.exit(1);
    break;
  }
  case 'render': {
    const file = rest[0];
    const formatFlag = rest.indexOf('--format');
    const fmt = formatFlag >= 0 ? rest[formatFlag + 1] : 'html';
    const doc = parse(load(file));
    if (fmt === 'html') {
      console.log(renderHtml(doc));
    } else {
      console.error(`Unknown format: ${fmt}`);
      process.exit(1);
    }
    break;
  }
  case 'export': {
    const file = rest[0];
    const targetFlag = rest.indexOf('--target');
    const target = targetFlag >= 0 ? rest[targetFlag + 1] : 'md';
    const doc = parse(load(file));
    if (target === 'md') {
      console.log(exportMarkdown(doc));
    } else {
      console.error(`Unknown target: ${target}`);
      process.exit(1);
    }
    break;
  }
  case 'format': {
    const text = load(rest[0]);
    const doc = parse(text);
    console.log(serialize(doc));
    break;
  }
  default:
    console.log('Usage: osf <parse|lint|diff|render|export|format> <file>');
}
