// File: omniscript-core/parser/src/block-parsers/doc.ts
// What: Parser for @doc blocks containing markdown content
// Why: Handle document content blocks
// Related: types.ts, content.ts

import { DocBlock } from '../types';

export function parseDocBlock(content: string): DocBlock {
  return { type: 'doc', content };
}
