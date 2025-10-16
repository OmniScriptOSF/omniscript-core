// File: omniscript-core/parser/src/serializers/meta.ts
// What: Serialization for @meta blocks
// Why: Convert MetaBlock back to OSF syntax
// Related: block-parsers/meta.ts

import { MetaBlock } from '../types';
import { serializeValue } from './text';

export function serializeMetaBlock(block: MetaBlock): string {
  const entries = Object.entries(block.props)
    .map(([k, v]) => `  ${k}: ${serializeValue(v)};`)
    .join('\n');
  return `@meta {\n${entries}\n}`;
}
