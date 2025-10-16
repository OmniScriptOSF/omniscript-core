# OmniScript Format v1.1 Changelog

**Release Date**: October 16, 2025  
**Status**: Production Release

---

## New Features

### Text Formatting Enhancements

#### Strikethrough Support

**Syntax**: `~~text~~`

```osf
@slide {
  title: "Product Updates";

  Pricing: ~~$99~~ **$79** this month only!
}
```

**Rendering**:

- HTML: `<s>text</s>`
- Markdown: `~~text~~`
- PDF/DOCX/PPTX: Proper strikethrough formatting

---

### Unicode Escape Sequences

**Syntax**: `\uXXXX` (4-digit hex) or `\xXX` (2-digit hex)

```osf
@meta {
  title: "Copyright \u00A9 2025";   // Renders as: Copyright © 2025
  status: "Complete \u2713";         // Renders as: Complete ✓
}
```

**Features**:

- Full Unicode range support (U+0000 to U+FFFF)
- ASCII range with hex escapes (0x00 to 0xFF)
- Round-trip preservation (parse → serialize → parse)
- Automatic escaping of non-ASCII characters on serialization

---

### Position Tracking in Errors

**Before (v1.0)**:

```
Error: Missing closing }
```

**After (v1.1)**:

```
Error: Missing closing } for block meta at 15:42
Error: Expected identifier starting with a letter at 8:5
Error: Invalid number format at 12:18
```

**Benefits**:

- Faster debugging for large documents
- Precise error location
- Better IDE integration support

---

### Extended HTML Rendering

Now supports full content block rendering in HTML output:

**Ordered Lists**:

```osf
@slide {
  title: "Steps";
  1. First step
  2. Second step
  3. Third step
}
```

Renders as `<ol><li>First step</li>...</ol>`

**Blockquotes**:

```osf
@slide {
  title: "Quote";
  > "This is a quote"
  > — Author Name
}
```

Renders as `<blockquote>...</blockquote>`

**Code Blocks**:

```osf
@slide {
  title: "Example";
  \`\`\`javascript
  console.log("hello");
  \`\`\`
}
```

Renders as `<pre><code class="language-javascript">...</code></pre>`

**Images and Links**:

- Images: `<img src="..." alt="...">`
- Links: `<a href="...">...</a>`

---

### Enhanced Markdown Export

Markdown export now preserves all formatting:

- Ordered lists → `1. 2. 3.`
- Blockquotes → `> text`
- Code blocks → ` ```language ... ``` `
- Strikethrough → `~~text~~`
- Images → `![alt](url)`
- Links → `[text](url)`

---

## Security Improvements

### HTML XSS Prevention

All HTML output is now properly escaped:

```osf
@meta {
  title: "<script>alert('xss')</script>";
}
```

**Before (v1.0)**: Would render as `<script>` tag (XSS vulnerability)  
**After (v1.1)**: Renders as `&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;`
(safe)

**Applies to**:

- Meta properties (title, author, date)
- Document content
- Slide content
- Sheet cell values
- All user-provided text

---

### Input Validation

Enhanced string parsing detects malformed input:

```osf
@meta { title: "unterminated
```

**v1.1**: Clear error message about unterminated string **v1.0**: Generic
parsing error

---

## API Changes

### Parser

**New error format**:

```typescript
// v1.0
throw new Error('Missing closing }');

// v1.1
throw new Error('Missing closing } for block meta at 15:42');
```

**No breaking changes** - error messages are enhanced but code that catches
errors still works.

### CLI

**Working converters** - PDF/DOCX/PPTX/XLSX rendering now functional:

```bash
# v1.0 - threw "not implemented" error
osf render doc.osf --format pdf

# v1.1 - actually generates PDF
osf render doc.osf --format pdf --output doc.pdf
```

---

## Backward Compatibility

**100% backward compatible** with v1.0:

- All v1.0 documents parse correctly
- No breaking changes to API
- No syntax changes to existing features
- New features are purely additive

---

## Migration Guide

**No migration needed!** Simply update packages:

```bash
npm install omniscript-parser@1.1.0
npm install omniscript-converters@1.1.0
npm install omniscript-cli@1.1.0
```

All v1.0 documents work immediately without modification.

**Optional enhancements**:

- Use `~~text~~` for strikethrough
- Use `\uXXXX` for unicode characters
- Benefit from better error messages automatically

---

## Testing

**31 new tests** added for v1.1 features:

- Strikethrough parsing and serialization (4 tests)
- Unicode escape sequences (6 tests)
- Position tracking in errors (4 tests)
- String validation (5 tests)
- Extended HTML rendering (4 tests)
- HTML XSS prevention (3 tests)
- Enhanced Markdown export (4 tests)
- Complete round-trip tests (1 test)

**Total: 88/88 tests passing (100%)**

---

## Known Issues

**None** - All features fully tested and production-ready.

---

## Technical Debt

See [TECH_DEBT.md](../../TECH_DEBT.md) for documented items:

- P1: File length (cli/src/osf.ts, parser/src/parser.ts)
- Target for v1.2.0 resolution

---

## Contributors

- OmniScript Core Team
- Community feedback and testing

---

**Full details**: [RELEASE_NOTES.md](../../RELEASE_NOTES.md)
