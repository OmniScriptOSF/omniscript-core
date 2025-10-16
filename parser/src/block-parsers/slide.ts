// File: omniscript-core/parser/src/block-parsers/slide.ts
// What: Parser for @slide blocks for presentations
// Why: Extract slide properties, content, and bullet points
// Related: types.ts, content.ts, lexer/index.ts

import { SlideBlock } from '../types';
import { parseKV } from '../lexer';
import { parseContent } from './content';

export function parseSlideBlock(rawContent: string): SlideBlock {
  const slide: SlideBlock = { type: 'slide' };
  let slideContent = rawContent;

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
