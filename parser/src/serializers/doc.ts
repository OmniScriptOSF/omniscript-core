// File: omniscript-core/parser/src/serializers/doc.ts
// What: Serialization for @doc blocks
// Why: Convert DocBlock back to OSF syntax
// Related: block-parsers/doc.ts

import { DocBlock } from '../types';

export function serializeDocBlock(block: DocBlock): string {
  return `@doc {\n${block.content}\n}`;
}
