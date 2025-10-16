// File: omniscript-core/parser/src/block-parsers/content.ts
// What: Markdown-style content parsing (paragraphs, lists, blockquotes, code blocks)
// Why: Parse @doc and @slide content into structured blocks
// Related: doc.ts, slide.ts, types.ts

import { ContentBlock, TextRun, ListItem, Paragraph } from '../types';

export function parseStyledText(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*.*?\*\*|__.*?__|\*.*?\*|~~.*?~~|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex).filter(p => p);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push({ text: part.slice(2, -2), bold: true });
    } else if (part.startsWith('__') && part.endsWith('__')) {
      runs.push({ text: part.slice(2, -2), underline: true });
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push({ text: part.slice(1, -1), italic: true });
    } else if (part.startsWith('~~') && part.endsWith('~~')) {
      runs.push({ text: part.slice(2, -2), strike: true });
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

export function parseContent(content: string): ContentBlock[] {
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
