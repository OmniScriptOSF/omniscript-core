import {
  OSFDocument,
  OSFBlock,
  MetaBlock,
  DocBlock,
  SlideBlock,
  SheetBlock,
  ChartBlock,
  DiagramBlock,
  OSFCodeBlock,
  OSFValue,
  ContentBlock,
  TextRun,
  Paragraph,
  ListItem,
  StyledText,
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
  if (j >= str.length || str[j] !== '"') {
    throw new Error('Unterminated string literal');
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

function parseStyledText(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*.*?\*\*|__.*?__|\*.*?\*|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex).filter(p => p);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push({ text: part.slice(2, -2), bold: true });
    } else if (part.startsWith('__') && part.endsWith('__')) {
      runs.push({ text: part.slice(2, -2), underline: true });
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push({ text: part.slice(1, -1), italic: true });
    } else if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
      const alt = part.slice(2, part.indexOf(']('));
      const url = part.slice(part.indexOf('](') + 2, -1);
      runs.push({ type: 'image', alt, url });
    } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const linkText = part.slice(1, part.indexOf(']('));
      const url = part.slice(part.indexOf('](') + 2, -1);
      runs.push({ type: 'link', text: linkText, url });
    } else {
      runs.push(part);
    }
  }
  return runs;
}

function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmedLine = line.trim();
    if (trimmedLine === '') {
      i++;
      continue;
    }

    // Ordered List
    if (/^\d+\.\s/.test(trimmedLine)) {
      const items: ListItem[] = [];
      while (i < lines.length) {
        const currentLine = lines[i] ?? '';
        const currentTrimmedLine = currentLine.trim();
        if (/^\d+\.\s/.test(currentTrimmedLine)) {
          const itemContent = currentTrimmedLine.replace(/^\d+\.\s/, '');
          items.push({ type: 'list_item', content: parseStyledText(itemContent) });
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'ordered_list', items });
      continue;
    }

    // Unordered List
    if (/^-\s/.test(trimmedLine)) {
      const items: ListItem[] = [];
      while (i < lines.length) {
        const currentLine = lines[i] ?? '';
        const currentTrimmedLine = currentLine.trim();
        if (/^-\s/.test(currentTrimmedLine)) {
          const itemContent = currentTrimmedLine.replace(/^-\s/, '');
          items.push({ type: 'list_item', content: parseStyledText(itemContent) });
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'unordered_list', items });
      continue;
    }

    // Blockquote
    if (trimmedLine.startsWith('> ')) {
      const bqLines: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i] ?? '';
        const currentTrimmedLine = currentLine.trim();
        if (currentTrimmedLine.startsWith('> ')) {
          bqLines.push(currentTrimmedLine.substring(2));
          i++;
        } else {
          break;
        }
      }
      const paragraphs: Paragraph[] = bqLines.map(l => ({
        type: 'paragraph',
        content: parseStyledText(l),
      }));
      blocks.push({ type: 'blockquote', content: paragraphs });
      continue;
    }

    // Code Block
    if (trimmedLine.startsWith('```')) {
      const lang = trimmedLine.substring(3).trim();
      const codeLines: string[] = [];
      i++; // Consume the opening ``` line
      while (i < lines.length) {
        const currentLine = lines[i] ?? '';
        const currentTrimmedLine = currentLine.trim();
        if (currentTrimmedLine.startsWith('```')) {
          i++; // Consume the closing ``` line
          break;
        }
        codeLines.push(currentLine); // Keep original indentation for code content
        i++;
      }
      blocks.push({ type: 'code', language: lang, content: codeLines.join('\n') });
      continue;
    }

    const runs = parseStyledText(trimmedLine);
    const firstRun = runs[0];
    if (
      runs.length === 1 &&
      firstRun &&
      typeof firstRun !== 'string' &&
      'type' in firstRun &&
      firstRun.type === 'image'
    ) {
      blocks.push(firstRun);
      i++;
      continue;
    }

    blocks.push({ type: 'paragraph', content: runs });
    i++;
  }

  return blocks;
}

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
        let slideContent = b.content;

        // Extract bullets block if present using a more robust approach
        const bulletsStartMatch = slideContent.match(/bullets\s*\{/);

        if (bulletsStartMatch && bulletsStartMatch.index !== undefined) {
          const bulletsStart = bulletsStartMatch.index + bulletsStartMatch[0].length;
          let depth = 1;
          let bulletsEnd = bulletsStart;

          // Find the matching closing brace
          while (bulletsEnd < slideContent.length && depth > 0) {
            const ch = slideContent[bulletsEnd];
            if (ch === '{') depth++;
            else if (ch === '}') depth--;
            bulletsEnd++;
          }

          if (depth === 0) {
            const bulletsContent = slideContent.slice(bulletsStart, bulletsEnd - 1);

            // Parse bullets as array of strings
            const bullets: string[] = [];
            const bulletRegex = /"([^"]+)"\s*;/g;
            let bulletMatch;
            while ((bulletMatch = bulletRegex.exec(bulletsContent))) {
              if (bulletMatch[1]) {
                bullets.push(bulletMatch[1]);
              }
            }

            if (bullets.length > 0) {
              slide.bullets = bullets;
            }

            // Remove bullets block from content
            slideContent =
              slideContent.slice(0, bulletsStartMatch.index) + slideContent.slice(bulletsEnd);
            slideContent = slideContent.trim();
          }
        }

        const lines = slideContent.split('\n');
        const contentLines: string[] = [];
        const kvContent: string[] = [];

        for (const line of lines) {
          if (/^[a-zA-Z0-9_]+\s*:.+;/.test(line.trim())) {
            kvContent.push(line);
          } else {
            contentLines.push(line);
          }
        }

        const content = contentLines.join('\n');
        const kv = kvContent.join('\n');

        Object.assign(slide, parseKV(kv));
        slide.content = parseContent(content);

        return slide;
      }
      case 'sheet': {
        const sheet: SheetBlock = { type: 'sheet', data: {}, formulas: [] };
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
          } catch (e) {
            // Log the error for debugging, but continue processing
            console.error('Error parsing sheet properties:', e);
          }
        }
        return sheet;
      }
      case 'chart': {
        const props = parseKV(b.content);

        // Validate chart type
        const validChartTypes = ['bar', 'line', 'pie', 'scatter', 'area'];
        const chartTypeStr = props.type as string;
        const chartType =
          chartTypeStr && validChartTypes.includes(chartTypeStr)
            ? (chartTypeStr as 'bar' | 'line' | 'pie' | 'scatter' | 'area')
            : 'bar';

        // Validate data is array
        const data = Array.isArray(props.data) ? (props.data as any[]) : [];

        const chart: ChartBlock = {
          type: 'chart',
          chartType,
          title: (props.title as string) || 'Chart',
          data,
          options: props.options as any,
        };
        return chart;
      }
      case 'diagram': {
        const props = parseKV(b.content);

        // Validate diagram type
        const validDiagramTypes = ['flowchart', 'sequence', 'gantt', 'mindmap'];
        const diagramTypeStr = props.type as string;
        const diagramType =
          diagramTypeStr && validDiagramTypes.includes(diagramTypeStr)
            ? (diagramTypeStr as 'flowchart' | 'sequence' | 'gantt' | 'mindmap')
            : 'flowchart';

        // Validate engine
        const validEngines = ['mermaid', 'graphviz'];
        const engineStr = props.engine as string;
        const engine =
          engineStr && validEngines.includes(engineStr)
            ? (engineStr as 'mermaid' | 'graphviz')
            : 'mermaid';

        const diagram: DiagramBlock = {
          type: 'diagram',
          diagramType,
          engine,
          code: (props.code as string) || '',
          title: props.title as string,
        };
        return diagram;
      }
      case 'code': {
        const props = parseKV(b.content);
        const codeBlock: OSFCodeBlock = {
          type: 'osfcode',
          language: (props.language as string) || 'text',
          caption: props.caption as string,
          lineNumbers: props.lineNumbers as boolean,
          highlight: props.highlight as number[],
          code: (props.code as string) || '',
        };
        return codeBlock;
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
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r')
    .replace(String.fromCharCode(8), '\\b')
    .replace(/\f/g, '\\f')
    .replace(/\v/g, '\\v')
    .replace(/\0/g, '\\0');
}

function serializeValue(v: OSFValue): string {
  if (Array.isArray(v)) return `[${v.map(serializeValue).join(', ')}]`;
  if (v && typeof v === 'object') {
    const inner = Object.entries(v)
      .map(([k, val]) => `  ${k}: ${serializeValue(val)};`)
      .join(' ');
    return `{ ${inner} }`;
  }
  if (typeof v === 'string') return `"${escapeString(v)}"`;
  return String(v);
}

function serializeTextRun(run: TextRun): string {
  if (typeof run === 'string') {
    return run;
  }
  if ('type' in run) {
    if (run.type === 'link') {
      return `[${run.text}](${run.url})`;
    } else if (run.type === 'image') {
      return `![${run.alt}](${run.url})`;
    }
  } else {
    const styledText = run as StyledText;
    let text = styledText.text;
    if (styledText.bold) text = `**${text}**`;
    if (styledText.italic) text = `*${text}*`;
    if (styledText.underline) text = `__${text}__`;
    return text;
  }
  return '';
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
          const { content, ...otherProps } = slideBlock;

          Object.entries(otherProps).forEach(([k, v]) => {
            if (k !== 'type' && v !== undefined) {
              parts.push(`  ${k}: ${serializeValue(v)};`);
            }
          });

          if (content) {
            if (parts.length > 0) parts.push('');
            content.forEach(block => {
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
            });
          }

          return `@slide {\n${parts.join('\n')}\n}`;
        }
        case 'sheet': {
          const sheetBlock = b as SheetBlock;
          const parts: string[] = [];
          const { data, formulas, ...otherProps } = sheetBlock;

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
        case 'chart': {
          const chartBlock = b as ChartBlock;
          const parts: string[] = [];
          parts.push(`  type: "${chartBlock.chartType}";`);
          parts.push(`  title: "${escapeString(chartBlock.title)}";`);

          // Serialize data array in OSF format
          const dataStr =
            '[' +
            chartBlock.data
              .map(
                series =>
                  `{ label: "${escapeString(series.label)}"; values: [${series.values.join(', ')}]; }`
              )
              .join(', ') +
            ']';
          parts.push(`  data: ${dataStr};`);

          if (chartBlock.options) {
            const optsStr =
              '{ ' +
              Object.entries(chartBlock.options)
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
        case 'diagram': {
          const diagramBlock = b as DiagramBlock;
          const parts: string[] = [];
          parts.push(`  type: "${diagramBlock.diagramType}";`);
          parts.push(`  engine: "${diagramBlock.engine}";`);
          if (diagramBlock.title) {
            parts.push(`  title: "${diagramBlock.title}";`);
          }
          parts.push(`  code: "${escapeString(diagramBlock.code)}";`);
          return `@diagram {\n${parts.join('\n')}\n}`;
        }
        case 'osfcode': {
          const codeBlock = b as OSFCodeBlock;
          const parts: string[] = [];
          parts.push(`  language: "${codeBlock.language}";`);
          if (codeBlock.caption) {
            parts.push(`  caption: "${codeBlock.caption}";`);
          }
          if (codeBlock.lineNumbers !== undefined) {
            parts.push(`  lineNumbers: ${codeBlock.lineNumbers};`);
          }
          if (codeBlock.highlight) {
            parts.push(`  highlight: ${serializeValue(codeBlock.highlight)};`);
          }
          parts.push(`  code: "${escapeString(codeBlock.code)}";`);
          return `@code {\n${parts.join('\n')}\n}`;
        }
        default: {
          const docBlock = b as DocBlock;
          return `@doc {\n${docBlock.content || ''}\n}`;
        }
      }
    })
    .join('\n\n');
}
