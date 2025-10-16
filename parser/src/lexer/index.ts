// File: omniscript-core/parser/src/lexer/index.ts
// What: Main lexer module - exports all lexing functions
// Why: Central entry point for tokenization and lexical analysis
// Related: parser.ts, tokenizer.ts, strings.ts, comments.ts

import { removeComments } from './comments';
import { parseKVInternal } from './tokenizer';
import { OSFValue } from '../types';

export * from './tokenizer';
export * from './strings';
export * from './comments';

export function parseKV(content: string): Record<string, OSFValue> {
  const cleaned = removeComments(content);
  return parseKVInternal(cleaned, 0).obj;
}
