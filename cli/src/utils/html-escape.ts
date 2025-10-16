// File: cli/src/utils/html-escape.ts
// What: HTML escaping utilities for XSS prevention
// Why: Centralize security-critical escaping logic
// Related: render/html.ts

/**
 * Escape HTML special characters to prevent XSS injection
 * @param str - The string to escape
 * @returns HTML-safe string with special characters escaped
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, ch => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return ch;
    }
  });
}
