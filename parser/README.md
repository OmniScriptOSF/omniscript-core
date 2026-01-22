# OmniScript Parser

<div align="center">

<img src="https://raw.githubusercontent.com/OmniScriptOSF/omniscript-core/main/assets/osf-icon-512px.png" alt="OmniScript Logo" width="120" height="120" />

# 🔍 TypeScript Parser Engine for OSF

**Powerful, zero-dependency parser for the OmniScript Format (OSF) with full
TypeScript support and bidirectional conversion**

[![npm version](https://badge.fury.io/js/omniscript-parser.svg)](https://badge.fury.io/js/omniscript-parser)
[![npm downloads](https://img.shields.io/npm/dm/omniscript-parser.svg)](https://www.npmjs.com/package/omniscript-parser)
[![v1.3.0](https://img.shields.io/badge/version-1.3.0-blue.svg)](../../RELEASE_NOTES.md)
[![Tests](https://img.shields.io/badge/tests-83%2F83%20passing-brightgreen.svg)](./tests)
[![Security](https://img.shields.io/badge/security-A+-brightgreen.svg)](../../P%23_REVIEW_CLEAN_SUMMARY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[🚀 Quick Start](#-quick-start) • [📖 API Reference](#-api-reference) •
[🏗️ Architecture](#-architecture) • [💡 Examples](#-examples) •
[🧪 Testing](#-testing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="25%">

### 📝 **Complete OSF Parsing**

- Full OSF v1.2 specification support (tables, includes)
- @table blocks with markdown syntax
- @include directive for file composition
- Strikethrough (`~~text~~`)
- Unicode escapes (`\uXXXX`)
- Comprehensive error handling
- Detailed parse diagnostics
- Schema validation

</td>
<td width="25%">

### 🔄 **Bidirectional Conversion**

- Parse OSF to AST
- Serialize AST to OSF
- Lossless round-trip
- Format preservation
- Table serialization
- Include resolution
- Position tracking

</td>
<td width="25%">

### ⚡ **Zero Dependencies**

- Lightweight footprint
- Fast parsing performance
- No external dependencies
- Browser & Node.js compatible

</td>
<td width="25%">

### 🎯 **TypeScript First**

- Full type definitions
- Comprehensive interfaces
- Type-safe operations (0 'any' types)
- IntelliSense support
- Strict validation
- Security-hardened parsing
- Enhanced error messages

</td>
</tr>
</table>

---

## 🚀 Quick Start

### 📦 Installation

```bash
npm install omniscript-parser
# or
pnpm add omniscript-parser
# or
yarn add omniscript-parser
```

### ⚡ Basic Usage

```typescript
import { parse, serialize } from 'omniscript-parser';

// Parse OSF content to structured AST
const osfContent = `
@meta {
  title: "My Document";
  author: "John Doe";
  date: "2025-06-28";
}

@doc {
  # Welcome to OmniScript
  
  This is a **powerful** document format that supports:
  - Rich text formatting (bold, italic, ~~strikethrough~~)
  - Structured data
  - Formula calculations
  - Unicode characters: \u2713 (checkmark)
}

@sheet {
  name: "Sales Data";
  cols: [Month, Revenue, Growth];
  data {
    (1,1) = "Q1";
    (1,2) = 100000;
    (2,1) = "Q2";
    (2,2) = 125000;
  }
  formula (1,3): "=0";
  formula (2,3): "=(B2-B1)/B1*100";
}
`;

// Parse to AST
const document = parse(osfContent);
console.log(`Parsed ${document.blocks.length} blocks`);

// Access specific block types
const metaBlock = document.blocks.find(b => b.type === 'meta');
const docBlock = document.blocks.find(b => b.type === 'doc');
const sheetBlock = document.blocks.find(b => b.type === 'sheet');

// Serialize back to OSF
const regenerated = serialize(document);
console.log(regenerated);
```

---

## 📖 API Reference

### Core Functions

#### `parse(content: string, options?: ParseOptions): OSFDocument`

Parses OSF content string into a structured document object.

```typescript
import { parse } from 'omniscript-parser';

try {
  const document = parse(osfContent);
  console.log(`Successfully parsed ${document.blocks.length} blocks`);
} catch (error) {
  console.error('Parse error:', error.message);
  // Handle parsing errors with detailed diagnostics
}
```

**Parameters:**

- `content: string` - The OSF content to parse
- `options?: ParseOptions` - Include resolution settings

**ParseOptions:**

```typescript
interface ParseOptions {
  resolveIncludes?: boolean;
  basePath?: string;
  maxDepth?: number;
}
```

When `resolveIncludes` is true, `basePath` is required.

**Returns:** `OSFDocument` object with parsed blocks

**Throws:** `ParseError` with detailed error information including:

- Line and column numbers (e.g., "Error at 5:12")
- Error descriptions
- Context-aware messages
- Unterminated string detection

#### `serialize(document: OSFDocument): string`

Converts a structured document object back to OSF format.

```typescript
import { serialize } from 'omniscript-parser';

const osfString = serialize(document);
console.log(osfString);
```

**Parameters:**

- `document: OSFDocument` - The document object to serialize

**Returns:** Formatted OSF content string

**Features:**

- Preserves formatting where possible
- Consistent indentation
- Proper spacing and alignment

---

## 🏗️ Document Architecture

### Core Types

#### OSFDocument

```typescript
interface OSFDocument {
  version?: string;
  blocks: OSFBlock[];
  includes?: IncludeDirective[];
}
```

#### OSFBlock Union Type

```typescript
type OSFBlock =
  | MetaBlock
  | DocBlock
  | SlideBlock
  | SheetBlock
  | ChartBlock
  | DiagramBlock
  | OSFCodeBlock
  | TableBlock;
```

### Block Types

#### MetaBlock - Document Metadata

```typescript
interface MetaBlock {
  type: 'meta';
  props: Record<string, OSFValue>;
  location?: SourceLocation;
}

// Example usage
const metaBlock = document.blocks.find(b => b.type === 'meta') as MetaBlock;
console.log(metaBlock.props.title); // Document title
console.log(metaBlock.props.author); // Document author
```

#### DocBlock - Rich Document Content

```typescript
interface DocBlock {
  type: 'doc';
  content: string;
  location?: SourceLocation;
}

// Example usage
const docBlock = document.blocks.find(b => b.type === 'doc') as DocBlock;
console.log(docBlock.content); // Markdown content
```

#### SlideBlock - Presentation Slides

```typescript
interface SlideBlock {
  type: 'slide';
  title?: string;
  layout?: string;
  content?: ContentBlock[];
  bullets?: string[];
  location?: SourceLocation;
}

// Example usage
const slideBlock = document.blocks.find(b => b.type === 'slide') as SlideBlock;
console.log(slideBlock.title); // Slide title
console.log(slideBlock.bullets); // Bullet points array
```

#### Slide Content Blocks

```typescript
type ContentBlock = Paragraph | OrderedList | UnorderedList | CodeBlock | Blockquote | Image;

interface Paragraph {
  type: 'paragraph';
  content: TextRun[];
}

type TextRun = string | StyledText | Link | Image;
```

#### SheetBlock - Spreadsheet Data

```typescript
interface SheetBlock {
  type: 'sheet';
  name?: string;
  cols?: string[];
  data?: Record<string, OSFValue>;
  formulas?: Array<{
    cell: [number, number];
    expr: string;
  }>;
  location?: SourceLocation;
}

// Example usage
const sheetBlock = document.blocks.find(b => b.type === 'sheet') as SheetBlock;
console.log(sheetBlock.name); // Sheet name
console.log(sheetBlock.data); // Cell data
console.log(sheetBlock.formulas); // Formula definitions
```

### Value Types

```typescript
type OSFValue = string | number | boolean | OSFValue[] | { [key: string]: OSFValue };
```

### Source Location Tracking

```typescript
interface SourceLocation {
  start: Position;
  end: Position;
}

interface Position {
  line: number; // 1-based line number
  column: number; // 1-based column number
  offset: number; // 0-based character offset
}
```

---

## 💡 Examples

### 📊 Working with Spreadsheet Data

```typescript
import { parse, SheetBlock } from 'omniscript-parser';

const spreadsheetOSF = `
@meta {
  title: "Sales Analysis";
  author: "Data Team";
}

@sheet {
  name: "Regional Sales";
  cols: [Region, Q1_Sales, Q2_Sales, Growth_Rate];
  data {
    (1,1) = "North America";
    (1,2) = 850000;
    (1,3) = 975000;
    (2,1) = "Europe";
    (2,2) = 650000;
    (2,3) = 748000;
    (3,1) = "Asia Pacific";
    (3,2) = 400000;
    (3,3) = 477000;
  }
  formula (1,4): "=(C1-B1)/B1*100";
  formula (2,4): "=(C2-B2)/B2*100";
  formula (3,4): "=(C3-B3)/B3*100";
}
`;

const document = parse(spreadsheetOSF);
const sheetBlock = document.blocks.find(b => b.type === 'sheet') as SheetBlock;

if (sheetBlock?.data) {
  // Access cell data by coordinate string
  console.log('North America Q1:', sheetBlock.data['1,2']); // 850000
  console.log('Europe Q2:', sheetBlock.data['2,3']); // 748000

  // Process all data cells
  Object.entries(sheetBlock.data).forEach(([coord, value]) => {
    const [row, col] = coord.split(',').map(Number);
    console.log(`Cell (${row},${col}): ${value}`);
  });

  // Work with formulas
  if (sheetBlock.formulas) {
    sheetBlock.formulas.forEach(formula => {
      const [row, col] = formula.cell;
      console.log(`Formula at (${row},${col}): ${formula.expr}`);
    });
  }
}
```

### 🎯 Working with Presentations

```typescript
import { parse, SlideBlock } from 'omniscript-parser';

const presentationOSF = `
@meta {
  title: "Product Roadmap 2025";
  author: "Product Team";
  theme: "Modern";
}

@slide {
  title: "Vision Statement";
  layout: "TitleAndContent";
  content: "Revolutionizing document processing with AI-native tools.";
}

@slide {
  title: "Key Milestones";
  layout: "TitleAndBullets";
  bullets {
    "Q1: Core parser and CLI release";
    "Q2: Professional converters launch";
    "Q3: VS Code extension and themes";
    "Q4: Real-time collaboration features";
  }
}

@slide {
  title: "Technical Architecture";
  layout: "TitleAndBullets";
  bullets {
    "Zero-dependency parser engine";
    "TypeScript-first development";
    "Bidirectional AST conversion";
    "Comprehensive error handling";
  }
}
`;

const document = parse(presentationOSF);
const slides = document.blocks.filter(b => b.type === 'slide') as SlideBlock[];

console.log(`Presentation has ${slides.length} slides`);

slides.forEach((slide, index) => {
  console.log(`\nSlide ${index + 1}: ${slide.title}`);
  console.log(`Layout: ${slide.layout}`);

  if (slide.content) {
    console.log(`Content: ${slide.content}`);
  }

  if (slide.bullets) {
    console.log('Bullets:');
    slide.bullets.forEach((bullet, i) => {
      console.log(`  ${i + 1}. ${bullet}`);
    });
  }
});
```

### 🔄 Document Transformation

```typescript
import { parse, serialize, MetaBlock, DocBlock } from 'omniscript-parser';

// Load and modify a document
const originalOSF = `
@meta {
  title: "Draft Document";
  status: "draft";
  version: 1;
}

@doc {
  # Introduction
  This document is currently in draft status.
}
`;

const document = parse(originalOSF);

// Update metadata
const metaBlock = document.blocks.find(b => b.type === 'meta') as MetaBlock;
if (metaBlock) {
  metaBlock.props.status = 'published';
  metaBlock.props.version = 2;
  metaBlock.props.publishDate = '2025-06-28';
}

// Update document content
const docBlock = document.blocks.find(b => b.type === 'doc') as DocBlock;
if (docBlock) {
  docBlock.content = docBlock.content.replace(
    'This document is currently in draft status.',
    'This document has been **published** and is ready for distribution.'
  );
}

// Serialize the updated document
const updatedOSF = serialize(document);
console.log(updatedOSF);
```

### 🛡️ Error Handling and Validation

```typescript
import { parse, ParseError } from 'omniscript-parser';

const invalidOSF = `
@meta {
  title: "Broken Document";
  // Missing closing brace
  
@doc {
  # This will fail to parse
  Unclosed **bold text
}
`;

try {
  const document = parse(invalidOSF);
  console.log('Parse successful');
} catch (error) {
  if (error instanceof ParseError) {
    console.error('Parse failed:');
    console.error(`  Line ${error.line}, Column ${error.column}`);
    console.error(`  ${error.message}`);

    if (error.suggestions) {
      console.error('Suggestions:');
      error.suggestions.forEach(suggestion => {
        console.error(`  - ${suggestion}`);
      });
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## 🔧 Advanced Usage

### Type Guards and Utilities

```typescript
import {
  parse,
  OSFBlock,
  MetaBlock,
  DocBlock,
  SlideBlock,
  SheetBlock,
} from 'omniscript-parser';

// Type guard functions
function isMetaBlock(block: OSFBlock): block is MetaBlock {
  return block.type === 'meta';
}

function isDocBlock(block: OSFBlock): block is DocBlock {
  return block.type === 'doc';
}

function isSlideBlock(block: OSFBlock): block is SlideBlock {
  return block.type === 'slide';
}

function isSheetBlock(block: OSFBlock): block is SheetBlock {
  return block.type === 'sheet';
}

// Usage with type safety
const document = parse(osfContent);

document.blocks.forEach(block => {
  if (isMetaBlock(block)) {
    // TypeScript knows this is a MetaBlock
    console.log('Title:', block.props.title);
  } else if (isDocBlock(block)) {
    // TypeScript knows this is a DocBlock
    console.log('Content length:', block.content.length);
  } else if (isSlideBlock(block)) {
    // TypeScript knows this is a SlideBlock
    console.log('Slide title:', block.title);
    console.log('Bullet count:', block.bullets?.length || 0);
  } else if (isSheetBlock(block)) {
    // TypeScript knows this is a SheetBlock
    console.log('Sheet name:', block.name);
    console.log('Data cells:', Object.keys(block.data || {}).length);
  }
});
```

### Custom AST Processing

```typescript
import { parse, OSFDocument, OSFBlock } from 'omniscript-parser';

// Document analyzer
class OSFAnalyzer {
  private document: OSFDocument;

  constructor(osfContent: string) {
    this.document = parse(osfContent);
  }

  getStatistics() {
    const stats = {
      totalBlocks: this.document.blocks.length,
      metaBlocks: 0,
      docBlocks: 0,
      slideBlocks: 0,
      sheetBlocks: 0,
      totalWords: 0,
      totalSlides: 0,
      totalFormulas: 0,
    };

    this.document.blocks.forEach(block => {
      switch (block.type) {
        case 'meta':
          stats.metaBlocks++;
          break;
        case 'doc':
          stats.docBlocks++;
          stats.totalWords += this.countWords(block.content);
          break;
        case 'slide':
          stats.slideBlocks++;
          stats.totalSlides++;
          if (block.bullets) {
            stats.totalWords += block.bullets.reduce(
              (acc, bullet) => acc + this.countWords(bullet),
              0
            );
          }
          break;
        case 'sheet':
          stats.sheetBlocks++;
          stats.totalFormulas += block.formulas?.length || 0;
          break;
      }
    });

    return stats;
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  getMetadata() {
    const metaBlock = this.document.blocks.find(b => b.type === 'meta');
    return metaBlock ? metaBlock.props : {};
  }

  extractAllText(): string {
    const textBlocks: string[] = [];

    this.document.blocks.forEach(block => {
      if (block.type === 'doc') {
        textBlocks.push(block.content);
      } else if (block.type === 'slide') {
        if (block.title) textBlocks.push(block.title);
        if (block.content) textBlocks.push(block.content);
        if (block.bullets) textBlocks.push(...block.bullets);
      }
    });

    return textBlocks.join('\n\n');
  }
}

// Usage
const analyzer = new OSFAnalyzer(osfContent);
const stats = analyzer.getStatistics();
const metadata = analyzer.getMetadata();
const allText = analyzer.extractAllText();

console.log('Document Statistics:', stats);
console.log('Metadata:', metadata);
console.log('Extracted Text:', allText);
```

---

## 🧪 Testing

### Unit Testing Examples

```typescript
import { describe, it, expect } from 'vitest';
import { parse, serialize } from 'omniscript-parser';

describe('OSF Parser', () => {
  it('should parse basic meta blocks', () => {
    const osf = `
      @meta {
        title: "Test Document";
        author: "Test Author";
      }
    `;

    const document = parse(osf);
    expect(document.blocks).toHaveLength(1);
    expect(document.blocks[0].type).toBe('meta');

    const metaBlock = document.blocks[0] as any;
    expect(metaBlock.props.title).toBe('Test Document');
    expect(metaBlock.props.author).toBe('Test Author');
  });

  it('should handle round-trip serialization', () => {
    const originalOSF = `
      @meta {
        title: "Round Trip Test";
      }
      
      @doc {
        # Test Document
        This is a test.
      }
    `;

    const document = parse(originalOSF);
    const serialized = serialize(document);
    const reparsed = parse(serialized);

    expect(reparsed.blocks).toHaveLength(document.blocks.length);
    expect(reparsed.blocks[0].type).toBe('meta');
    expect(reparsed.blocks[1].type).toBe('doc');
  });

  it('should provide detailed error information', () => {
    const invalidOSF = `
      @meta {
        title: "Broken
      }
    `;

    expect(() => parse(invalidOSF)).toThrow();

    try {
      parse(invalidOSF);
    } catch (error: any) {
      expect(error.line).toBeGreaterThan(0);
      expect(error.column).toBeGreaterThan(0);
      expect(error.message).toContain('Unexpected');
    }
  });
});
```

### Performance Testing

```typescript
import { parse } from 'omniscript-parser';

// Benchmark parser performance
function benchmarkParser() {
  const largeOSF = generateLargeOSF(1000); // Generate 1000 blocks

  const startTime = performance.now();
  const document = parse(largeOSF);
  const endTime = performance.now();

  console.log(
    `Parsed ${document.blocks.length} blocks in ${endTime - startTime}ms`
  );
  console.log(
    `Average: ${(endTime - startTime) / document.blocks.length}ms per block`
  );
}

function generateLargeOSF(blockCount: number): string {
  const blocks: string[] = [];

  for (let i = 0; i < blockCount; i++) {
    if (i % 4 === 0) {
      blocks.push(`@meta { title: "Document ${i}"; }`);
    } else if (i % 4 === 1) {
      blocks.push(`@doc { # Section ${i}\nContent for section ${i}. }`);
    } else if (i % 4 === 2) {
      blocks.push(
        `@slide { title: "Slide ${i}"; bullets { "Point 1"; "Point 2"; } }`
      );
    } else {
      blocks.push(
        `@sheet { name: "Sheet ${i}"; data { (1,1)="Data"; (1,2)=${i}; } }`
      );
    }
  }

  return blocks.join('\n\n');
}

benchmarkParser();
```

---

## 🔧 Development

### Build from Source

```bash
# Clone the repository
git clone https://github.com/OmniScriptOSF/omniscript-core.git
cd omniscript-core/parser

# Install dependencies
pnpm install

# Build the package
pnpm run build

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Type checking
pnpm run typecheck
```

### Project Structure

```
parser/
├── src/
│   ├── index.ts        # Main exports
│   ├── parser.ts       # Core parser implementation
│   ├── types.ts        # TypeScript type definitions
│   ├── serializer.ts   # AST to OSF serialization
│   ├── validator.ts    # Schema validation
│   └── utils.ts        # Utility functions
├── tests/
│   ├── parser.test.ts  # Parser tests
│   ├── types.test.ts   # Type tests
│   └── fixtures/       # Test fixtures
├── dist/               # Built output
├── package.json
└── tsconfig.json
```

---

## 🤝 Contributing

We welcome contributions to improve the parser!

### 🌟 Areas for Contribution

- 🚀 **Performance** - Optimize parsing speed and memory usage
- 🛡️ **Error Handling** - Improve error messages and recovery
- 🧪 **Testing** - Expand test coverage and edge cases
- 📖 **Documentation** - Enhance API docs and examples
- 🔧 **Features** - Add new OSF syntax support

### 🚀 Development Guidelines

1. **Type Safety** - Maintain full TypeScript coverage
2. **Zero Dependencies** - Keep the parser dependency-free
3. **Performance** - Ensure efficient parsing algorithms
4. **Error Handling** - Provide helpful error messages
5. **Testing** - Write comprehensive tests for new features

---

## 📄 License

MIT License © 2025 [Alphin Tom](https://github.com/alpha912)

---

## 🔗 Related Packages

- **[omniscript-cli](https://www.npmjs.com/package/omniscript-cli)** -
  Command-line tools
- **[omniscript-converters](https://www.npmjs.com/package/omniscript-converters)** -
  Format converters
- **[OmniScript Core](https://github.com/OmniScriptOSF/omniscript-core)** -
  Complete ecosystem

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/OmniScriptOSF/omniscript-core/issues)
- 💬 [Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
- 🏢 [Organization](https://github.com/OmniScriptOSF)
- 👤 [Maintainer](https://github.com/alpha912)

---

<div align="center">

### 🔍 Ready to parse the future of documents?

**[📦 Install Now](https://www.npmjs.com/package/omniscript-parser)** •
**[📖 View Examples](https://github.com/OmniScriptOSF/omniscript-examples)** •
**[🤝 Get Support](https://github.com/OmniScriptOSF/omniscript-core/discussions)**

---

_Built with ❤️ for TypeScript developers and document processing enthusiasts_

</div>
