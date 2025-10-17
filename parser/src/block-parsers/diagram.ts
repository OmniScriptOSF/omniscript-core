// File: omniscript-core/parser/src/block-parsers/diagram.ts
// What: Parser for @diagram blocks for flowcharts, sequences, etc.
// Why: Extract diagram type, engine, and code with type validation
// Related: types.ts, lexer/index.ts, utils/validation.ts

import { DiagramBlock } from '../types';
import { parseKV } from '../lexer';
import { validateEnum, validateString } from '../utils/validation';

const VALID_DIAGRAM_TYPES = ['flowchart', 'sequence', 'gantt', 'mindmap'] as const;
const VALID_ENGINES = ['mermaid', 'graphviz'] as const;

export function parseDiagramBlock(content: string): DiagramBlock {
  const props = parseKV(content);

  // Validate diagram type
  const diagramType = validateEnum(props.type, VALID_DIAGRAM_TYPES, 'flowchart');

  // Validate engine
  const engine = validateEnum(props.engine, VALID_ENGINES, 'mermaid');

  const diagram: DiagramBlock = {
    type: 'diagram',
    diagramType,
    engine,
    code: validateString(props.code, ''),
  };

  // Add title only if present
  if (props.title && typeof props.title === 'string') {
    diagram.title = props.title;
  }

  return diagram;
}
