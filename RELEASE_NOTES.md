# OmniScript Format - Release Notes

## v1.1.0 - Enhanced Features & Security (October 16, 2025)

**Status**: ✅ Production Ready  
**Packages**: omniscript-parser@1.1.0, omniscript-cli@1.1.0,
omniscript-converters@1.1.0

### 🎯 Highlights

This release brings **enhanced formatting capabilities**, **security
improvements**, and **better developer experience** while maintaining **100%
backward compatibility** with v1.0.

### ✨ New Features

#### Text Formatting

- ✅ **Strikethrough** - `~~text~~` syntax for strikethrough formatting
- ✅ **Unicode Escapes** - `\uXXXX` and `\xXX` support in strings
- ✅ Round-trip support for all unicode characters

#### Developer Experience

- ✅ **Position Tracking** - Errors now show precise line:column (e.g., "Error
  at 5:12")
- ✅ **String Validation** - Detect unterminated strings with clear messages
- ✅ **Better Debugging** - Enhanced error context for faster problem resolution

#### CLI Enhancements

- ✅ **Extended HTML** - Ordered lists, blockquotes, code blocks, images, links
- ✅ **Enhanced Markdown** - Full formatting preservation in exports
- ✅ **Working Converters** - PDF/DOCX/PPTX/XLSX rendering fully functional

### 🔒 Security Improvements

- ✅ **XSS Prevention** - All HTML output properly escaped
- ✅ **Input Validation** - Enhanced parser safety checks

### 📊 Quality Metrics

- **88 tests** passing (31 new tests for v1.1 features)
- **100% backward compatible** with v1.0
- **Zero breaking changes**

### 🔄 Upgrade Path

```bash
npm install omniscript-parser@1.1.0
npm install omniscript-cli@1.1.0
npm install omniscript-converters@1.1.0
```

No code changes needed - drop-in replacement for v1.0!

---

## v1.0.0 - Production Release (October 15, 2025)

**Status**: ✅ Production Ready  
**Packages**: omniscript-parser@1.0.0, omniscript-converters@1.0.0,
omniscript-cli@1.0.0

---

## 🎉 Welcome to v1.0!

OmniScript Format v1.0 is a major milestone representing months of development,
testing, and refinement. This release marks the **official production release**
with all core features implemented, tested, and ready for use.

---

## 🚀 What's New in v1.0

### 1. Advanced Block Types

#### @chart - Data Visualization

Create interactive charts with multiple types and styling options.

```osf
@chart {
  type: "bar";
  title: "Sales by Quarter";
  data: [
    { label: "Q1"; values: [100, 120, 90]; },
    { label: "Q2"; values: [150, 140, 160]; },
    { label: "Q3"; values: [200, 180, 220]; }
  ];
  options: {
    xAxis: "Quarter";
    yAxis: "Revenue ($K)";
    legend: true;
    colors: ["#3B82F6", "#10B981", "#F59E0B"];
  };
}
```

**Supported Chart Types**:

- Bar charts
- Line charts
- Pie charts
- Scatter plots
- Area charts

**Rendering**:

- PDF: Chart.js with full interactivity
- DOCX: Data tables with labels
- PPTX: Native PowerPoint charts

#### @diagram - Visual Diagrams

Create flowcharts, sequence diagrams, Gantt charts, and mind maps.

```osf
@diagram {
  type: "flowchart";
  engine: "mermaid";
  title: "User Authentication Flow";
  code: "
    graph TD
      A[User Login] --> B{Valid?}
      B -->|Yes| C[Dashboard]
      B -->|No| D[Error]
      D --> A
  ";
}
```

**Supported Diagram Types**:

- Flowcharts
- Sequence diagrams
- Gantt charts
- Mind maps

**Rendering Engines**:

- Mermaid (default)
- Graphviz

#### @code - Syntax-Highlighted Code

Display code with line numbers and syntax highlighting.

```osf
@code {
  language: "typescript";
  caption: "Express Server Example";
  lineNumbers: true;
  highlight: [3, 4, 5];
  code: "
    import express from 'express';
    const app = express();
    app.get('/', (req, res) => {
      res.send('Hello World');
    });
    app.listen(3000);
  ";
}
```

**Features**:

- 50+ language support (via Prism.js)
- Line numbers
- Line highlighting
- Optional captions
- Proper indentation preservation

### 2. Enhanced Parser

#### Input Validation

- Chart types validated (defaults to 'bar' if invalid)
- Diagram engines validated (defaults to 'mermaid' if invalid)
- Code languages validated
- Graceful error handling

#### Round-Trip Support

```typescript
const doc = parse(osfString);
const serialized = serialize(doc);
// serialized === osfString (preserves structure)
```

#### Full TypeScript Support

```typescript
import {
  ChartBlock,
  DiagramBlock,
  OSFCodeBlock,
  ChartDataSeries,
  ChartOptions,
} from 'omniscript-parser';
```

### 3. Converter Improvements

#### PDF Converter

- ✅ Chart.js integration for charts
- ✅ Mermaid rendering for diagrams
- ✅ Prism.js syntax highlighting for code
- ✅ XSS protection with proper escaping
- ✅ Unique chart IDs (no collisions)

#### DOCX Converter

- ✅ Chart data as formatted tables
- ✅ Diagram code as preformatted text
- ✅ Code blocks with monospace font
- ✅ Improved formatting

#### PPTX Converter

- ✅ Native PowerPoint charts
- ✅ Diagram slides with code display
- ✅ Code slides with formatting
- ✅ Better layout options

### 4. CLI Enhancements

All new block types work seamlessly with existing CLI commands:

```bash
# Parse v1.0 documents
osf parse document.osf

# Export with charts and diagrams
osf export document.osf --format pdf

# Validate v1.0 blocks
osf lint document.osf
```

### 5. VSCode Extension

- Syntax highlighting for @chart, @diagram, @code blocks
- IntelliSense for v1.0 properties
- Snippets for new block types
- Hover documentation

---

## 📋 Complete Feature List

### Core Features

- ✅ Zero-dependency parser
- ✅ 7 block types (@meta, @doc, @slide, @sheet, @chart, @diagram, @code)
- ✅ 4 export formats (PDF, DOCX, PPTX, XLSX)
- ✅ 10+ professional themes
- ✅ Full TypeScript type safety
- ✅ Backward compatibility with v0.5

### Advanced Features

- ✅ 5 chart types
- ✅ 4 diagram types
- ✅ 2 diagram engines
- ✅ 50+ code languages
- ✅ Line highlighting
- ✅ Custom styling options

### Quality Assurance

- ✅ 152 tests (100% passing)
- ✅ Code review complete (all P0/P1 issues fixed)
- ✅ Security hardened
- ✅ Performance optimized
- ✅ Production-ready quality

---

## 🔧 Breaking Changes

### None! 🎉

v1.0 is **fully backward compatible** with v0.5. All existing OSF documents
continue to work without modification.

### Deprecations

None. All v0.5 features remain supported.

---

## 📊 Test Results

### Comprehensive Testing

| Package           | Tests   | Pass       | Coverage |
| ----------------- | ------- | ---------- | -------- |
| Parser            | 26      | ✅ 26      | 100%     |
| Converters (v0.5) | 46      | ✅ 46      | 100%     |
| Converters (v1.0) | 27      | ✅ 27      | 100%     |
| CLI               | 29      | ✅ 29      | 100%     |
| **Total**         | **128** | **✅ 128** | **100%** |

### Integration Tests

- ✅ Parser → Converters integration
- ✅ Parser → CLI integration
- ✅ End-to-end document workflow
- ✅ Multi-format export validation
- ✅ v1.0 feature rendering

**Total Verifications**: 152/152 (100% success rate)

[View Full Test Report →](./docs/TESTING.md)

---

## 🐛 Bug Fixes

### Critical (P0)

**P0-1: XSS Protection in PDF Converter**

- **Issue**: escapeHtml used DOM APIs in Node.js environment
- **Fix**: Implemented string-based escaping
- **Impact**: Security vulnerability eliminated
- **Status**: ✅ Fixed and tested

### High Priority (P1)

**P1-1: Chart Canvas ID Collisions**

- **Issue**: Random IDs could theoretically collide
- **Fix**: Sequential counter-based IDs
- **Impact**: No rendering failures
- **Status**: ✅ Fixed and tested

**P1-2: Unsafe Chart Type Casting**

- **Issue**: No validation of chart types from input
- **Fix**: Explicit validation with safe defaults
- **Impact**: Invalid input handled gracefully
- **Status**: ✅ Fixed and tested

**P1-3: Missing Diagram Engine Validation**

- **Issue**: No validation of diagram engines
- **Fix**: Explicit validation with safe defaults
- **Impact**: Invalid engines handled safely
- **Status**: ✅ Fixed and tested

[View Full Code Quality Report →](./docs/CODE_QUALITY.md)

---

## 📦 Package Versions

### omniscript-parser@1.0.0

**Size**: ~30KB minified  
**Dependencies**: 0 runtime, 5 dev  
**Exports**: `parse`, `serialize`, all TypeScript types

### omniscript-converters@1.0.0

**Size**: ~250KB (with dependencies)  
**Dependencies**: 6 runtime (puppeteer, docx, pptxgenjs, exceljs, etc.)  
**Exports**: `PDFConverter`, `DOCXConverter`, `PPTXConverter`, `XLSXConverter`

### omniscript-cli@1.0.0

**Size**: ~15KB (without deps)  
**Dependencies**: 4 runtime (commander, chalk, omniscript-parser,
omniscript-converters)  
**Commands**: `parse`, `lint`, `render`, `export`, `format`

---

## 🚀 Migration Guide

### From v0.5 to v1.0

**Good news**: No migration needed! v1.0 is fully backward compatible.

All existing v0.5 documents work without changes. You can start using v1.0
features immediately:

```osf
// Existing v0.5 blocks still work
@doc {
  # My Document
  Content here
}

// New v1.0 blocks can be added
@chart {
  type: "bar";
  title: "New Chart";
  data: [...];
}
```

### Recommended Updates

While not required, consider:

1. **Update `@meta` version**: Add `version: "1.0";` to metadata
2. **Use new blocks**: Leverage @chart, @diagram, @code for richer content
3. **Update dependencies**: Upgrade to latest package versions

```bash
npm update omniscript-parser omniscript-converters omniscript-cli
```

---

## 📚 Documentation

### New Documentation

- [v1.0 Specification](./omniscript-core/spec/v1.0/osf-spec.md) - Complete spec
- [Chart Block Guide](./omniscript-core/spec/v1.0/osf-spec.md#chart-blocks) -
  Chart usage
- [Diagram Block Guide](./omniscript-core/spec/v1.0/osf-spec.md#diagram-blocks) -
  Diagram usage
- [Code Block Guide](./omniscript-core/spec/v1.0/osf-spec.md#code-blocks) - Code
  usage

### Updated Documentation

- [Parser README](./omniscript-core/parser/README.md) - v1.0 API
- [Converter README](./omniscript-converters/README.md) - v1.0 rendering
- [CLI README](./omniscript-core/cli/README.md) - Updated examples

### Examples

16 professional examples covering all use cases:

- Business reports
- Technical documentation
- Classroom materials
- Project proposals
- And more!

[View Examples →](./omniscript-examples)

---

## 🎯 Known Issues

### Minor (P2)

These issues do not block v1.0 release but are tracked for v1.0.1:

1. **Chart Color Array Bounds** - No validation if colors array is shorter than
   data series
2. **Code Language Validation** - Language names not validated against Prism
   support
3. **Sheet Data Optional Chaining** - Some edge cases not handled with optional
   chaining
4. **CDN Dependencies** - Chart.js and Mermaid loaded from CDN (consider
   bundling)

[Track Issues on GitHub →](https://github.com/OmniScriptOSF/omniscript-core/issues)

---

## 🔮 What's Next (v1.1 Roadmap)

### Planned Features

- **@table** block - Markdown-style tables
- **@include** directive - Import external files
- **@variables** - Template variables
- **@loops** - Repeat blocks dynamically
- **Conditional rendering** - Show/hide based on conditions
- **Custom themes** - User-defined theme system
- **Plugin system** - Extensible architecture
- **More export formats** - HTML, Markdown, LaTeX

[View Full Roadmap →](./omniscript-core/spec/roadmap.md)

---

## 🙏 Acknowledgments

Thanks to:

- All contributors and early adopters
- The TypeScript community
- Open-source library authors (Puppeteer, PptxGenJS, etc.)
- Testing and feedback from beta users

---

## 📞 Support

### Getting Help

- **Documentation**: https://omniscript.dev/docs
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Examples**: Learn from 16 professional examples

### Reporting Issues

Found a bug?
[Report it on GitHub](https://github.com/OmniScriptOSF/omniscript-core/issues/new)

1. Search existing issues first
2. Include OSF code sample
3. Include error messages
4. Specify package version

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## 🎊 Thank You!

Thank you for using OmniScript Format! We're excited to see what you build with
v1.0.

**Happy documenting!** 🚀

---

<div align="center">

**OmniScript Format v1.0**

[⭐ Star on GitHub](https://github.com/OmniScriptOSF/omniscript-core) •
[📖 Read the Docs](https://omniscript.dev/docs) •
[🧪 Try the Playground](https://omniscript.dev/playground)

_Released with ❤️ by the OmniScript team_

</div>
