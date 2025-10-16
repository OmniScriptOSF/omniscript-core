// File: omniscript-core/parser/src/utils/position.ts
// What: Position tracking and error formatting utilities
// Why: Provide accurate line/column information for parser errors
// Related: lexer/index.ts, parser.ts

export function getLineColumn(str: string, index: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < index && i < str.length; i++) {
    const ch = str[i];
    if (ch === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}
