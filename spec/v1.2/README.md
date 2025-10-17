# OmniScript Format Specification v1.2

**Version**: 1.2.0  
**Release Date**: October 16, 2025  
**Status**: Stable

---

## Overview

OmniScript Format v1.2 adds two major features to the v1.1 specification:

1. **@table blocks** - Markdown-style tables with styling and alignment
2. **@include directive** - Modular document composition

This specification maintains 100% backward compatibility with v1.0 and v1.1.

---

## New Features

### @table Blocks

Tables allow structured tabular data using Markdown pipe syntax.

#### Syntax

```osf
@table {
  caption?: string;
  style?: "bordered" | "striped" | "minimal";
  alignment?: ("left" | "center" | "right")[];

  | Header 1 | Header 2 | Header 3 |
  | --- | --- | --- |
  | Cell 1 | Cell 2 | Cell 3 |
  | Cell 4 | Cell 5 | Cell 6 |
}
```

#### Properties

| Property    | Type   | Required | Default         | Description            |
| ----------- | ------ | -------- | --------------- | ---------------------- |
| `caption`   | string | No       | -               | Optional table caption |
| `style`     | enum   | No       | `"bordered"`    | Visual style variant   |
| `alignment` | array  | No       | `["left", ...]` | Column alignments      |

#### Rules

1. **Header row required**: First row defines column count
2. **Separator row required**: Second row must be `| --- | --- | ... |`
3. **Consistent columns**: All rows must have same column count as header
4. **Alignment values**: Only `"left"`, `"center"`, or `"right"`
5. **XSS protection**: All cell content is escaped in HTML output

#### Examples

**Basic table**:

```osf
@table {
  | Product | Price |
  | --- | --- |
  | Widget | $10 |
  | Gadget | $20 |
}
```

**Styled table with caption**:

```osf
@table {
  caption: "Q4 2025 Sales Report";
  style: "bordered";
  alignment: ["left", "right", "center"];

  | Region | Revenue | Status |
  | --- | --- | --- |
  | North | $120,000 | ✓ Growth |
  | South | $95,000 | → Stable |
  | West | $145,000 | ✓ Growth |
}
```

---

### @include Directive

The `@include` directive enables composing documents from multiple files.

#### Syntax

```osf
@include {
  path: string;
}
```

#### Properties

| Property | Type   | Required | Description                |
| -------- | ------ | -------- | -------------------------- |
| `path`   | string | Yes      | Relative path to .osf file |

#### Security Rules

1. **Relative paths only**: Absolute paths are rejected
2. **No directory traversal**: `../` patterns are rejected
3. **Base path required**: Must provide `basePath` in parse options
4. **Depth limit**: Maximum 10 levels of nested includes
5. **Circular detection**: Prevents infinite include loops

#### Parser Options

```typescript
parse(input: string, {
  resolveIncludes: boolean,  // Must be true to process includes
  basePath: string,           // Required when resolveIncludes=true
  maxDepth: number            // Default: 10
})
```

#### Examples

**Simple include**:

```osf
@meta { title: "Full Report"; }

@include { path: "./intro.osf"; }
@include { path: "./body.osf"; }
@include { path: "./conclusion.osf"; }
```

**Nested includes**:

```osf
// main.osf
@include { path: "./sections/all.osf"; }

// sections/all.osf
@include { path: "./intro.osf"; }
@include { path: "./details.osf"; }
```

**Security violations** (will fail):

```osf
@include { path: "/etc/passwd"; }          // Absolute path
@include { path: "../../../secrets.osf"; } // Directory traversal
```

---

## Type Definitions

### TableBlock

```typescript
interface TableBlock {
  type: 'table';
  properties: {
    caption?: string;
    style?: 'bordered' | 'striped' | 'minimal';
    alignment?: ('left' | 'center' | 'right')[];
    rows: TableRow[];
  };
}

interface TableRow {
  cells: string[];
}
```

### IncludeDirective

```typescript
interface IncludeDirective {
  type: 'include';
  properties: {
    path: string;
  };
}
```

### ParseOptions

```typescript
interface ParseOptions {
  resolveIncludes?: boolean;
  basePath?: string;
  maxDepth?: number;
}
```

---

## Security Considerations

### Path Traversal Protection

All file paths are validated to prevent directory escape attacks:

```typescript
function isValidPath(path: string): boolean {
  // Reject absolute paths
  if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) {
    return false;
  }

  // Reject parent directory references
  if (path.includes('../') || path.includes('..\\')) {
    return false;
  }

  return true;
}
```

### XSS Prevention

Table cells are sanitized before HTML rendering:

```typescript
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### Input Validation

All inputs validated at parse time:

- Table column counts must match header
- Alignment values restricted to enum
- Paths validated before file system access
- Number values checked for NaN/Infinity

---

## Validation Rules

### @table Validation

1. Properties must be valid key-value pairs
2. Style must be one of: `"bordered"`, `"striped"`, `"minimal"`
3. Alignment array length must match column count
4. Each alignment must be: `"left"`, `"center"`, or `"right"`
5. All rows must have same column count as header

### @include Validation

1. Path property is required
2. Path must be relative (no `/` or `C:` prefix)
3. Path must not contain `../` or `..\`
4. File must exist and be readable
5. Circular references detected and rejected

---

## Error Messages

### Table Errors

```
Error: Table row 3 has 4 columns, expected 3 to match header
Error: Invalid alignment value "middle", must be "left", "center", or "right"
Error: Invalid table style "fancy", must be "bordered", "striped", or "minimal"
```

### Include Errors

```
Error: Include path cannot be absolute: /etc/passwd
Error: Include path contains directory traversal: ../secrets.osf
Error: Circular include detected: main.osf -> section.osf -> main.osf
Error: Include depth limit exceeded (max 10)
Error: Failed to read file 'missing.osf': ENOENT
```

---

## Backward Compatibility

v1.2 is 100% backward compatible with v1.0 and v1.1:

- All existing blocks parse unchanged
- No breaking changes to API
- Existing documents work without modification
- New features are opt-in

---

## Migration Guide

No migration needed! Existing v1.0 and v1.1 documents work as-is.

To use new features:

1. **Tables**: Replace `@sheet` with `@table` for simple tables
2. **Includes**: Split large docs into modular files

---

## Implementation Notes

### Parser Changes

- Added `parseTableBlock()` in `block-parsers/table.ts`
- Added `resolveIncludes()` in `parser.ts`
- Added security validation in `utils/validation.ts`

### Renderer Changes

- Added HTML table rendering with CSS styles
- Added sanitization layer for defense-in-depth
- Enhanced error messages with context

---

## References

- [CHANGELOG.md](../../CHANGELOG.md) - Full change history
- [MIGRATION_v1.2.md](../../MIGRATION_v1.2.md) - Migration guide
- [Table Parser](../../parser/src/block-parsers/table.ts) - Implementation
- [Security Tests](../../parser/tests/security.test.ts) - Test suite

---

## License

This specification is licensed under CC-BY-4.0.

See [LICENSE](../LICENSE) for details.
