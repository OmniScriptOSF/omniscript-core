# OmniScript Format (OSF)

<div align="center">

<img src="https://raw.githubusercontent.com/OmniScriptOSF/omniscript-core/main/assets/osf-icon-512px.png" alt="OmniScript Logo" width="150" height="150" />

# 🌟 The Universal Document DSL

**One format to generate documents, slides, sheets, charts, diagrams, and more**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![v1.0](https://img.shields.io/badge/version-1.0-blue.svg)](./RELEASE_NOTES.md)
[![Tests](https://img.shields.io/badge/tests-152%2F152%20passing-brightgreen.svg)](./docs/TESTING.md)
[![Production Ready](https://img.shields.io/badge/status-production%20ready-success.svg)](./RELEASE_NOTES.md)

[🚀 Quick Start](#-quick-start) • [📦 Packages](#-packages) •
[🎯 Features](#-features) • [📖 Documentation](#-documentation) •
[🧪 Playground](https://omniscript.dev/playground)

</div>

---

## 🎉 v1.0 Released - Production Ready!

OmniScript Format v1.0 is **complete, tested, and production-ready**:

- ✅ **152/152 tests passing** (100% success rate)
- ✅ **3 npm packages published** (parser, converters, CLI)
- ✅ **v1.0 specification finalized** (charts, diagrams, code blocks)
- ✅ **VSCode extension available**
- ✅ **Interactive playground live**
- ✅ **Zero critical issues**

[View Release Notes →](./RELEASE_NOTES.md)

---

## 💡 What is OmniScript?

OmniScript Format (OSF) is a **universal document description language** that
lets you write structured content once and export it to multiple formats:

```osf
@meta {
  title: "My Document";
  author: "John Doe";
}

@doc {
  # Hello World

  This is **OmniScript** - write once, export everywhere!
}

@chart {
  type: "bar";
  title: "Sales Data";
  data: [
    { label: "Q1"; values: [100]; },
    { label: "Q2"; values: [150]; }
  ];
}

@slide {
  title: "Presentation Slide";
  layout: TitleAndContent;

  - Point 1
  - Point 2
}

@sheet {
  name: "Data";
  cols: [Name, Value];

  A1 = "Product"; B1 = "Price";
  A2 = "Widget";  B2 = 99;
}
```

**Export to**: PDF 📄 • DOCX 📝 • PPTX 🎞️ • XLSX 📊

---

## 🚀 Quick Start

### Install CLI

```bash
npm install -g omniscript-cli
```

### Create Your First Document

```bash
# Create a new OSF file
cat > hello.osf << 'EOF'
@meta {
  title: "My First Document";
}

@doc {
  # Hello, OmniScript!

  Welcome to the **universal document format**.
}
EOF

# Parse and validate
osf parse hello.osf

# Export to PDF
osf export hello.osf --format pdf --output hello.pdf
```

### Install as Library

```bash
npm install omniscript-parser omniscript-converters
```

```typescript
import { parse } from 'omniscript-parser';
import { PDFConverter } from 'omniscript-converters';

const osf = `
@doc {
  # My Document
  Content here...
}
`;

const doc = parse(osf);
const converter = new PDFConverter();
const result = await converter.convert(doc);

// result.buffer contains the PDF
```

---

## 📦 Packages

| Package                                              | Version | Description                      | Status      |
| ---------------------------------------------------- | ------- | -------------------------------- | ----------- |
| [**omniscript-parser**](./omniscript-core/parser)    | 1.0.0   | TypeScript parser engine         | ✅ Stable   |
| [**omniscript-converters**](./omniscript-converters) | 1.0.0   | PDF, DOCX, PPTX, XLSX converters | ✅ Stable   |
| [**omniscript-cli**](./omniscript-core/cli)          | 1.0.0   | Command-line tools               | ✅ Stable   |
| [**omniscript-vscode**](./omniscript-vscode)         | 0.1.0   | VSCode extension                 | ✅ Stable   |
| [**omniscript-examples**](./omniscript-examples)     | 1.0.0   | Professional examples            | ✅ Complete |

### Package Details

#### 🔍 omniscript-parser

Zero-dependency TypeScript parser for OSF.

```bash
npm install omniscript-parser
```

**Features**: Parse OSF → AST • Serialize AST → OSF • Full type safety • v1.0
blocks

[View README →](./omniscript-core/parser/README.md)

#### 🔄 omniscript-converters

Enterprise-grade document converters.

```bash
npm install omniscript-converters
```

**Features**: PDF with charts • DOCX with tables • PPTX with native charts •
XLSX with formulas

[View README →](./omniscript-converters/README.md)

#### ⚡ omniscript-cli

Professional command-line interface.

```bash
npm install -g omniscript-cli
```

**Commands**: `parse` • `lint` • `render` • `export` • `format`

[View README →](./omniscript-core/cli/README.md)

---

## 🎯 Features

### Core Block Types

| Block    | Purpose             | Export Support |
| -------- | ------------------- | -------------- |
| `@meta`  | Document metadata   | All formats    |
| `@doc`   | Markdown content    | PDF, DOCX      |
| `@slide` | Presentation slides | PPTX, PDF      |
| `@sheet` | Spreadsheet data    | XLSX, PDF      |

### v1.0 Advanced Blocks

| Block      | Purpose                 | Render                        |
| ---------- | ----------------------- | ----------------------------- |
| `@chart`   | Bar, line, pie charts   | Chart.js (PDF), Native (PPTX) |
| `@diagram` | Flowcharts, sequences   | Mermaid, Graphviz             |
| `@code`    | Syntax-highlighted code | Prism.js, Line numbers        |

### Export Formats

- **PDF** - High-quality documents with charts and diagrams
- **DOCX** - Microsoft Word with tables and formatting
- **PPTX** - PowerPoint with native charts
- **XLSX** - Excel with formulas and data

### Themes

10+ professional themes: `corporate` • `modern` • `academic` • `minimal` •
`colorful` • `dark` • `blueprint` • `ocean` • `forest` • `sunset`

---

## 📖 Documentation

### Getting Started

- [Installation](./omniscript-site/app/docs/getting-started/installation/page.tsx) -
  Install OSF tools
- [First Document](./omniscript-site/app/docs/getting-started/first-document/page.tsx) -
  Create your first OSF file
- [Examples](./omniscript-examples) - 16+ professional examples

### Specification

- [v1.0 Specification](./omniscript-core/spec/v1.0/osf-spec.md) - Complete OSF
  v1.0 spec
- [v0.5 Specification](./omniscript-core/spec/v0.5/osf-spec.md) - Legacy spec
- [Roadmap](./omniscript-core/spec/roadmap.md) - Future features

### Development

- [Architecture](./omniscript-core/docs/architecture.md) - System architecture
- [Contributing](./omniscript-core/CONTRIBUTING.md) - Contribution guidelines
- [Development Guide](./docs/DEVELOPMENT.md) - Development process
- [Testing](./docs/TESTING.md) - Test results and coverage

### Quality

- [Release Notes](./RELEASE_NOTES.md) - v1.0 release details
- [Code Quality](./docs/CODE_QUALITY.md) - Code review and fixes
- [Security](./docs/CODE_QUALITY.md#security) - Security measures

---

## 🧪 Try It Online

**Interactive Playground**:
[https://omniscript.dev/playground](https://omniscript.dev/playground)

- ✍️ Write OSF in Monaco editor
- 👁️ Live preview
- 📥 Export to PDF, DOCX, PPTX, XLSX
- 🎨 Test different themes

---

## 🌟 Use Cases

### 📚 Documentation

Write technical documentation once, export to PDF for distribution and DOCX for
editing.

### 🎓 Education

Create classroom materials with sheets for exercises and slides for
presentations.

### 💼 Business Reports

Generate reports with charts and data tables, export to PDF for sharing.

### 📊 Data Visualization

Create dashboards with charts and diagrams, export to multiple formats.

### 🎨 Presentations

Build professional presentations with charts, code samples, and diagrams.

---

## 🛠️ Development

### Setup

```bash
git clone https://github.com/OmniScriptOSF/omniscript-core.git
cd omniscript-core
pnpm install
pnpm build
```

### Test

```bash
# Run all tests
pnpm test --recursive

# Test individual packages
cd omniscript-core/parser && pnpm test
cd omniscript-converters && pnpm test
cd omniscript-core/cli && pnpm test
```

### Build

```bash
# Build all packages
pnpm build --recursive

# Build individual packages
cd omniscript-core/parser && pnpm build
```

---

## 📊 Project Stats

| Metric             | Value                            |
| ------------------ | -------------------------------- |
| **Total Tests**    | 152 (128 unit + 24 integration)  |
| **Test Pass Rate** | 100%                             |
| **Lines of Code**  | 8,500+ (TypeScript)              |
| **Dependencies**   | 0 (parser), minimal (converters) |
| **Packages**       | 5                                |
| **Examples**       | 16                               |
| **Themes**         | 10+                              |
| **Export Formats** | 4                                |

---

## 🤝 Contributing

We welcome contributions! See
[CONTRIBUTING.md](./omniscript-core/CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- 🐛 Report bugs via GitHub Issues
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit pull requests
- 🎨 Create themes
- 📚 Add examples

---

## 📄 License

MIT License - see [LICENSE](./omniscript-core/LICENSE) for details.

---

## 🔗 Links

- **Website**: https://omniscript.dev
- **GitHub**: https://github.com/OmniScriptOSF
- **npm**: https://www.npmjs.com/search?q=omniscript
- **VSCode Extension**:
  [Marketplace](https://marketplace.visualstudio.com/items?itemName=omniscript.omniscript-vscode)

---

## 📞 Support

- **Documentation**: https://omniscript.dev/docs
- **GitHub Issues**: https://github.com/OmniScriptOSF/omniscript-core/issues
- **GitHub Discussions**:
  https://github.com/OmniScriptOSF/omniscript-core/discussions

---

## 🎊 Acknowledgments

Built with ❤️ using:

- TypeScript - Type-safe language
- Puppeteer - PDF generation
- PptxGenJS - PowerPoint generation
- docx - Word generation
- ExcelJS - Excel generation
- Mermaid - Diagram rendering
- Chart.js - Chart rendering

---

<div align="center">

**Made with ❤️ by the OmniScript team**

[⭐ Star on GitHub](https://github.com/OmniScriptOSF/omniscript-core) •
[📖 Read the Docs](https://omniscript.dev/docs) •
[🧪 Try the Playground](https://omniscript.dev/playground)

</div>
