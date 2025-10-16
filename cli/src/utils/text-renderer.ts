// File: omniscript-core/cli/src/utils/text-renderer.ts
// What: Utilities for rendering text runs to HTML
// Why: Shared text rendering logic for HTML format
// Related: renderers/html.ts, html-escape.ts

import { TextRun } from 'omniscript-parser';
import { escapeHtml } from './html-escape';
import { StyledText } from '../types';

export function renderTextRun(run: TextRun): string {
  if (typeof run === 'string') {
    return escapeHtml(run);
  }
  if ('type' in run) {
    if (run.type === 'link') {
      return `<a href="${escapeHtml(run.url)}">${escapeHtml(run.text)}</a>`;
    }
    if (run.type === 'image') {
      return `<img src="${escapeHtml(run.url)}" alt="${escapeHtml(run.alt)}" />`;
    }
  }
  if ('text' in run) {
    let text = escapeHtml(run.text);
    const styledRun = run as StyledText;
    if (styledRun.bold) text = `<strong>${text}</strong>`;
    if (styledRun.italic) text = `<em>${text}</em>`;
    if (styledRun.underline) text = `<u>${text}</u>`;
    if (styledRun.strike) text = `<s>${text}</s>`;
    return text;
  }
  return '';
}
