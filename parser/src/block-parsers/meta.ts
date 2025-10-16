// File: omniscript-core/parser/src/block-parsers/meta.ts
// What: Parser for @meta blocks containing document metadata
// Why: Extract title, author, date, theme, and other properties
// Related: types.ts, lexer/index.ts

import { MetaBlock } from '../types';
import { parseKV } from '../lexer';

export function parseMetaBlock(content: string): MetaBlock {
  const props = parseKV(content);
  return { type: 'meta', props };
}
