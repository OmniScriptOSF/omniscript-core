// File: omniscript-core/cli/src/utils/sanitize.ts
// What: Input sanitization utilities for rendering
// Why: Defense-in-depth for XSS prevention
// Related: renderers/html.ts

/**
 * Sanitize alignment value for inline CSS
 * Defense-in-depth: validates even though parser should ensure correctness
 */
export function sanitizeAlignment(align: string | undefined): 'left' | 'center' | 'right' {
  if (align === 'center' || align === 'right') {
    return align;
  }
  return 'left'; // safe default
}

/**
 * Sanitize CSS class name to prevent injection
 */
export function sanitizeCssClass(className: string | undefined): string {
  if (!className) return '';
  // Only allow alphanumeric, dash, underscore
  return className.replace(/[^a-zA-Z0-9_-]/g, '');
}
