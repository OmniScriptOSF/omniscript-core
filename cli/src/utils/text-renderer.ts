// File: cli/src/utils/text-renderer.ts
// What: Text run rendering utilities for HTML and Markdown
// Why: Extract complex text rendering logic from main files
// Related: render/html.ts, render/markdown.ts

import { TextRun, StyledText } from 'omniscript-parser';
import { escapeHtml } from './html-escape';

/**
 * Apply text styles (bold, italic, underline, strikethrough) to HTML text
 */
function applyHtmlStyles(text: string, run: StyledText): string {
  let result = text;
  if ('bold' in run && run.bold) result = `<strong>${result}</strong>`;
  if ('italic' in run && run.italic) result = `<em>${result}</em>`;
  if ('underline' in run && run.underline) result = `<u>${result}</u>`;
  if ('strike' in run && run.strike) result = `<s>${result}</s>`;
  return result;
}

/**
 * Render a text run (string or styled text) to HTML
 */
export function renderTextRunHtml(run: TextRun | string): string {
  if (typeof run === 'string') {
    return escapeHtml(run);
  }

  // Handle links
  if ('url' in run && 'text' in run) {
    return `<a href="${escapeHtml(run.url)}">${escapeHtml(run.text)}</a>`;
  }

  // Handle images
  if ('url' in run && 'alt' in run) {
    return `<img src="${escapeHtml(run.url)}" alt="${escapeHtml(run.alt)}" />`;
  }

  // Handle styled text
  if ('text' in run) {
    const escapedText = escapeHtml(run.text);
    return applyHtmlStyles(escapedText, run);
  }

  return '';
}

/**
 * Apply text styles to Markdown text
 */
function applyMarkdownStyles(text: string, run: StyledText): string {
  let result = text;
  if ('bold' in run && run.bold) result = `**${result}**`;
  if ('italic' in run && run.italic) result = `*${result}*`;
  if ('underline' in run && run.underline) result = `__${result}__`;
  if ('strike' in run && run.strike) result = `~~${result}~~`;
  return result;
}

/**
 * Render a text run to Markdown
 */
export function renderTextRunMarkdown(run: TextRun | string): string {
  if (typeof run === 'string') {
    return run;
  }

  // Handle links
  if ('url' in run && 'text' in run) {
    return `[${run.text}](${run.url})`;
  }

  // Handle images
  if ('url' in run && 'alt' in run) {
    return `![${run.alt}](${run.url})`;
  }

  // Handle styled text
  if ('text' in run) {
    return applyMarkdownStyles(run.text, run);
  }

  return '';
}
