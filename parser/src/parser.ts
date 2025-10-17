// File: omniscript-core/parser/src/parser.ts
// What: Main OSF parser and serializer - orchestrates parsing and serialization
// Why: Entry point for parsing OSF documents and converting them back to text
// Related: types.ts, lexer/index.ts, block-parsers/index.ts, serializers/index.ts

// Conditional fs import - only available in Node.js/Bun environments
// eslint-disable-next-line no-unused-vars
let readFileSync: ((path: string, encoding: string) => string) | undefined;
try {
  // This will work in Node.js and Bun, but throw in browsers
  readFileSync = require('fs').readFileSync;
} catch {
  // Browser environment - fs not available
  // @include directive will throw helpful error if attempted
}

import { resolve, dirname, relative, normalize } from 'path';
import { OSFDocument, OSFBlock, DocBlock, IncludeDirective, ParseOptions } from './types';
import { findBlocks } from './lexer';
import {
  parseMetaBlock,
  parseDocBlock,
  parseSlideBlock,
  parseSheetBlock,
  parseChartBlock,
  parseDiagramBlock,
  parseCodeBlock,
  parseTableBlock,
} from './block-parsers';
import {
  serializeMetaBlock,
  serializeDocBlock,
  serializeSlideBlock,
  serializeSheetBlock,
  serializeChartBlock,
  serializeDiagramBlock,
  serializeCodeBlock,
  serializeTableBlock,
} from './serializers';

export function parse(input: string, options: ParseOptions = {}): OSFDocument {
  const { resolveIncludes = false, maxDepth = 10 } = options;
  let { basePath } = options;

  // Validate basePath when includes need to be resolved
  if (resolveIncludes) {
    if (!basePath) {
      // Only use process.cwd() when explicitly resolving includes
      if (typeof process !== 'undefined' && process.cwd) {
        basePath = process.cwd();
      } else {
        throw new Error(
          'basePath is required when resolveIncludes is true (process.cwd not available)'
        );
      }
    }
  }

  const blocksRaw = findBlocks(input);
  const blocks: OSFBlock[] = blocksRaw
    .filter(b => b.type !== 'include')
    .map(b => {
      switch (b.type) {
        case 'meta':
          return parseMetaBlock(b.content);
        case 'doc':
          return parseDocBlock(b.content);
        case 'slide':
          return parseSlideBlock(b.content);
        case 'sheet':
          return parseSheetBlock(b.content);
        case 'chart':
          return parseChartBlock(b.content);
        case 'diagram':
          return parseDiagramBlock(b.content);
        case 'code':
          return parseCodeBlock(b.content);
        case 'table':
          return parseTableBlock(b.content);
        default:
          return parseDocBlock(b.content);
      }
    });

  // Find @include directives
  const includes = findIncludes(input);
  const doc: OSFDocument = { blocks };

  if (includes.length > 0) {
    doc.includes = includes;
    if (resolveIncludes && basePath) {
      resolveDocumentIncludes(doc, basePath, maxDepth);
    }
  }

  return doc;
}

function findIncludes(input: string): IncludeDirective[] {
  // Use bounded quantifiers to prevent ReDoS
  const includeRegex = /@include\s{0,20}\{\s{0,20}path:\s{0,20}"([^"]+)"\s{0,20};\s{0,20}\}/g;
  const includes: IncludeDirective[] = [];

  let match;
  while ((match = includeRegex.exec(input)) !== null) {
    const path = match[1];
    if (path) {
      includes.push({
        type: 'include',
        path,
      });
    }
  }

  return includes;
}

/**
 * Validate that an include path doesn't escape the base directory
 * Prevents path traversal attacks like ../../../../etc/passwd
 */
function validateIncludePath(basePath: string, includePath: string): string {
  // Resolve the full path
  const fullPath = resolve(basePath, includePath);

  // Normalize both paths to handle .. and . segments
  const normalizedBase = normalize(basePath);
  const normalizedFull = normalize(fullPath);

  // Get relative path from base to full
  const rel = relative(normalizedBase, normalizedFull);

  // Check if path escapes basePath (starts with .. or is absolute)
  if (rel.startsWith('..') || resolve(rel) === rel) {
    throw new Error(
      `Security: Include path "${includePath}" attempts to access files outside base directory`
    );
  }

  return fullPath;
}

function resolveDocumentIncludes(
  doc: OSFDocument,
  basePath: string,
  maxDepth: number,
  currentDepth: number = 0,
  resolvedPaths: Set<string> = new Set()
): void {
  if (currentDepth >= maxDepth) {
    throw new Error(`Include depth exceeded ${maxDepth} (circular reference detected)`);
  }

  if (!doc.includes) return;

  for (const include of doc.includes) {
    try {
      // Validate and resolve path (prevents path traversal)
      const fullPath = validateIncludePath(basePath, include.path);

      // Check for circular reference by path
      if (resolvedPaths.has(fullPath)) {
        throw new Error(`Circular reference detected: ${fullPath} is already being resolved`);
      }

      resolvedPaths.add(fullPath);

      // Check if fs is available (Node.js/Bun environment)
      if (!readFileSync) {
        throw new Error(
          `@include directive requires a Node.js or Bun environment. ` +
            `The parser is running in a browser where file system access is not available. ` +
            `Path attempted: ${fullPath}`
        );
      }

      const content = readFileSync(fullPath, 'utf-8');
      const included = parse(content, {
        resolveIncludes: false, // Don't auto-resolve, we'll do it manually
        basePath: dirname(fullPath),
        maxDepth,
      });

      include.resolved = included;

      // Recursively resolve nested includes
      if (included.includes && included.includes.length > 0) {
        resolveDocumentIncludes(
          included,
          dirname(fullPath),
          maxDepth,
          currentDepth + 1,
          new Set(resolvedPaths)
        );
      }

      resolvedPaths.delete(fullPath);
    } catch (error) {
      const errorMsg = (error as Error).message;
      // Don't wrap if already a circular reference error
      if (errorMsg.includes('circular') || errorMsg.includes('depth exceeded')) {
        throw error;
      }
      throw new Error(`Failed to resolve include "${include.path}": ${errorMsg}`);
    }
  }
}

export function serialize(doc: OSFDocument): string {
  return doc.blocks
    .map(b => {
      switch (b.type) {
        case 'meta':
          return serializeMetaBlock(b);
        case 'doc':
          return serializeDocBlock(b);
        case 'slide':
          return serializeSlideBlock(b);
        case 'sheet':
          return serializeSheetBlock(b);
        case 'chart':
          return serializeChartBlock(b);
        case 'diagram':
          return serializeDiagramBlock(b);
        case 'osfcode':
          return serializeCodeBlock(b);
        case 'table':
          return serializeTableBlock(b);
        default:
          return serializeDocBlock(b as DocBlock);
      }
    })
    .join('\n\n');
}
