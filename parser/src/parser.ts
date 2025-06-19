import { tokenize, Token } from './lexer';

export interface OSFDocument {
  lines: string[];
}

export function parse(input: string): OSFDocument {
  const tokens: Token[] = tokenize(input);
  return { lines: tokens.map(t => t.value) };
}
