# OmniScript Parser

[![npm version](https://badge.fury.io/js/omniscript-parser.svg)](https://badge.fury.io/js/omniscript-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful TypeScript parser and serializer for the **OmniScript Format
(OSF)** - a universal document DSL designed for LLMs, agentic AI, and Git-native
workflows.

## 🚀 Features

- **📝 Complete OSF Parsing** - Parse `.osf` files with full syntax validation
- **🔄 Bidirectional Conversion** - Parse to AST and serialize back to OSF
- **📊 Multi-Format Support** - Documents, slides, spreadsheets, and metadata
- **🧮 Formula Engine** - Built-in spreadsheet formula evaluation
- **⚡ TypeScript First** - Full type safety with comprehensive type definitions
- **🎯 Zero Dependencies** - Lightweight with no external dependencies
- **🧪 Battle Tested** - Comprehensive test suite with 90%+ coverage

## 📦 Installation

```bash
npm install omniscript-parser
# or
yarn add omniscript-parser
# or
pnpm add omniscript-parser
```

## 🏃 Quick Start

```typescript
import { parse, serialize } from 'omniscript-parser';

// Parse OSF content
const osfContent = `
@meta {
  title: "My Document";
  author: "John Doe";
}

@doc {
  # Welcome to OSF
  This is a **powerful** document format.
}

@slide {
  title: "Key Features";
  bullets {
    "Universal document DSL";
    "Git-native workflows";
    "AI-friendly syntax";
  }
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

// Parse to structured data
const document = parse(osfContent);
console.log(document.blocks.length); // 4 blocks

// Access specific block types
const metaBlock = document.blocks.find(b => b.type === 'meta');
const docBlock = document.blocks.find(b => b.type === 'doc');
const slideBlock = document.blocks.find(b => b.type === 'slide');
const sheetBlock = document.blocks.find(b => b.type === 'sheet');

// Serialize back to OSF
const regeneratedOSF = serialize(document);
console.log(regeneratedOSF);
```

## 📚 API Reference

### `parse(content: string): OSFDocument`

Parses OSF content string into a structured document object.

**Parameters:**

- `content` - The OSF content as a string

**Returns:** `OSFDocument` object with parsed blocks

**Throws:** `Error` if parsing fails due to syntax errors

### `serialize(document: OSFDocument): string`

Converts a structured document object back to OSF format.

**Parameters:**

- `document` - The OSFDocument object to serialize

**Returns:** OSF content as a formatted string

## 🏗️ Document Structure

### OSFDocument

```typescript
interface OSFDocument {
  blocks: OSFBlock[];
}
```

### Block Types

#### MetaBlock

```typescript
interface MetaBlock {
  type: 'meta';
  props: Record<string, OSFValue>;
}
```

#### DocBlock

```typescript
interface DocBlock {
  type: 'doc';
  content: string;
}
```

#### SlideBlock

```typescript
interface SlideBlock {
  type: 'slide';
  title?: string;
  layout?: string;
  bullets?: string[];
}
```

#### SheetBlock

```typescript
interface SheetBlock {
  type: 'sheet';
  name?: string;
  cols?: OSFValue;
  data?: Record<string, OSFValue>;
  formulas?: Array<{
    cell: [number, number];
    expr: string;
  }>;
}
```

## 💡 Advanced Usage

### Error Handling

```typescript
import { parse } from 'omniscript-parser';

try {
  const doc = parse(osfContent);
  // Process document
} catch (error) {
  console.error('Parse error:', error.message);
  // Handle parsing errors
}
```

### Working with Spreadsheet Data

```typescript
import { parse } from 'omniscript-parser';

const doc = parse(osfContent);
const sheetBlock = doc.blocks.find(b => b.type === 'sheet') as SheetBlock;

if (sheetBlock?.data) {
  // Access cell data by coordinate
  const cellValue = sheetBlock.data['1,2']; // Row 1, Column 2

  // Process formulas
  if (sheetBlock.formulas) {
    sheetBlock.formulas.forEach(formula => {
      const [row, col] = formula.cell;
      console.log(`Cell ${row},${col}: ${formula.expr}`);
    });
  }
}
```

### Type Guards

```typescript
import {
  parse,
  MetaBlock,
  DocBlock,
  SlideBlock,
  SheetBlock,
} from 'omniscript-parser';

const doc = parse(osfContent);

doc.blocks.forEach(block => {
  switch (block.type) {
    case 'meta':
      const meta = block as MetaBlock;
      console.log('Title:', meta.props.title);
      break;
    case 'doc':
      const docContent = block as DocBlock;
      console.log('Content length:', docContent.content.length);
      break;
    case 'slide':
      const slide = block as SlideBlock;
      console.log('Bullets:', slide.bullets?.length || 0);
      break;
    case 'sheet':
      const sheet = block as SheetBlock;
      console.log('Sheet name:', sheet.name);
      break;
  }
});
```

## 🔧 Development

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
```

## 📖 OSF Format Specification

The OmniScript Format (OSF) is designed to be:

- **Human-readable** - Clean, intuitive syntax
- **Machine-parseable** - Unambiguous grammar for reliable parsing
- **Git-friendly** - Diff-friendly format for version control
- **AI-optimized** - Structured format perfect for LLM processing

### Basic Syntax

```osf
@blocktype {
  property: "value";
  nested {
    subproperty: 123;
  }
}
```

### Supported Block Types

- `@meta` - Document metadata (title, author, date, etc.)
- `@doc` - Markdown-style document content
- `@slide` - Presentation slides with layouts and bullets
- `@sheet` - Spreadsheet data with formulas

## 🤝 Contributing

Contributions are welcome! Please see our
[Contributing Guide](https://github.com/OmniScriptOSF/omniscript-core/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT License - see the
[LICENSE](https://github.com/OmniScriptOSF/omniscript-core/blob/main/LICENSE)
file for details.

## 🔗 Related Packages

- [`omniscript-cli`](https://www.npmjs.com/package/omniscript-cli) -
  Command-line tools for OSF
- [OSF Specification](https://github.com/OmniScriptOSF/omniscript-core/tree/main/spec) -
  Complete format specification

## 📞 Support

- 🐛 [Report Issues](https://github.com/OmniScriptOSF/omniscript-core/issues)
- 💬 [Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
- 🏢 [Organization](https://github.com/OmniScriptOSF)
- 👤 [Owner](https://github.com/alpha912/)

---

_Built with ❤️ for the future of document processing_
