// File: omniscript-core/cli/src/utils/markdown-utils.ts
// What: Utilities for converting OSF to Markdown format
// Why: Support Markdown export functionality
// Related: renderers/markdown.ts, text-renderer.ts

import { TextRun } from 'omniscript-parser';
import { StyledText } from '../types';

// Helper to convert TextRun to Markdown
export function textRunToMarkdown(run: TextRun): string {
  if (typeof run === 'string') {
    return run;
  }
  if ('type' in run) {
    if (run.type === 'link') {
      return `[${run.text}](${run.url})`;
    }
    if (run.type === 'image') {
      return `![${run.alt}](${run.url})`;
    }
  }
  if ('text' in run) {
    let text = run.text;
    const styledRun = run as StyledText;
    if (styledRun.bold) text = `**${text}**`;
    if (styledRun.italic) text = `*${text}*`;
    if (styledRun.underline) text = `__${text}__`;
    if (styledRun.strike) text = `~~${text}~~`;
    return text;
  }
  return '';
}
