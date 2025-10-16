// File: omniscript-core/parser/src/serializers/text.ts
// What: Serialization functions for styled text and text runs
// Why: Convert parsed text runs back to OSF markdown syntax
// Related: block-parsers/content.ts

import { TextRun, StyledText, OSFValue } from '../types';
import { escapeString } from '../lexer/strings';

export function serializeTextRun(run: TextRun): string {
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
    if (styledText.strike) text = `~~${text}~~`;
    return text;
  }
  return '';
}

export function serializeValue(v: OSFValue): string {
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
