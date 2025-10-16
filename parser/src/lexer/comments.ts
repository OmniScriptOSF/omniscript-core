// File: omniscript-core/parser/src/lexer/comments.ts
// What: Comment removal utilities
// Why: Strip comments before parsing block content
// Related: lexer/index.ts

export function removeComments(str: string): string {
  return str.replace(/\/\/.*$/gm, '');
}
