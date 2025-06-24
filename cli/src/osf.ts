import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import { parse, serialize, OSFDocument, OSFBlock } from '../../parser/dist';

const schema = JSON.parse(
  readFileSync(join(__dirname, '../../spec/v0.5/osf.schema.json'), 'utf8')
);
const ajv = new Ajv();
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
const validateOsf = ajv.compile(schema);

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
    }
  }
  return out.join('\n');
}

function toSchema(doc: OSFDocument): any {
  const out: any = { docs: [], slides: [], sheets: [] };
  for (const block of doc.blocks) {
    switch (block.type) {
      case 'meta':
        out.meta = block.props;
        break;
      case 'doc':
        out.docs.push({ content: (block as any).content });
        break;
      case 'slide': {
        const s: any = { ...block };
        delete s.type;
        out.slides.push(s);
        break;
      }
      case 'sheet': {
        const s: any = { ...block };
        delete s.type;
        if (s.data) {
          s.data = Object.entries(s.data).map(([cell, value]) => {
            const [r, c] = cell.split(',').map(Number);
            return { row: r, col: c, value };
          });
        }
        if (s.formulas) {
          s.formulas = s.formulas.map((f: any) => ({
            row: f.cell[0],
            col: f.cell[1],
            expr: f.expr,
          }));
        }
        out.sheets.push(s);
        break;
      }
    }
  }
  return out;
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
      const doc = parse(load(rest[0]));
      const obj = toSchema(doc);
      if (!validateOsf(obj)) {
        console.error('Lint error: schema validation failed');
        console.error(ajv.errorsText(validateOsf.errors || undefined));
        process.exit(1);
      } else {
        console.log('OK');
      }
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
