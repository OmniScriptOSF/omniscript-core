// File: omniscript-core/parser/src/block-parsers/code.ts
// What: Parser for @code blocks for syntax-highlighted code
// Why: Extract language, code content, caption, line numbers, and highlighting
// Related: types.ts, lexer/index.ts

import { OSFCodeBlock } from '../types';
import { parseKV } from '../lexer';
import { validateString } from '../utils/validation';

export function parseCodeBlock(content: string): OSFCodeBlock {
  const props = parseKV(content);
  const codeBlock: OSFCodeBlock = {
    type: 'osfcode',
    language: validateString(props.language, 'text'),
    code: validateString(props.code, ''),
  };

  // Add optional properties only if present
  if (props.caption && typeof props.caption === 'string') {
    codeBlock.caption = props.caption;
  }
  if (typeof props.lineNumbers === 'boolean') {
    codeBlock.lineNumbers = props.lineNumbers;
  }
  if (Array.isArray(props.highlight)) {
    codeBlock.highlight = props.highlight as number[];
  }

  return codeBlock;
}
