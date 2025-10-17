# Migration Guide: v1.1 to v1.2.0

**Last Updated**: October 16, 2025  
**Audience**: Developers using OmniScript Format

---

## 📋 Overview

OmniScript Format v1.2.0 is **100% backward compatible** with v1.0 and v1.1. No
breaking changes. All existing OSF files work without modification.

**TL;DR**: Update packages, enjoy new features. That's it!

---

## 🚀 Quick Migration

### Step 1: Update Packages

```bash
# Update CLI
npm install -g omniscript-cli@1.2.0

# Update libraries
npm install omniscript-parser@1.2.0
npm install omniscript-converters@1.2.0
```

### Step 2: Test Your Files

```bash
# Parse existing files (should work unchanged)
osf parse your-document.osf

# Render to verify
osf render your-document.osf --format html
```

### Step 3: Done!

That's it. Your existing files work as-is.

---

## ✨ What's New (Optional)

### New Feature: @table Blocks

**Before** (v1.1) - Using @sheet for tables:

```osf
@sheet {
  name: "Sales";
  cols: [Region, Revenue];

  A1 = "Region"; B1 = "Revenue";
  A2 = "North";  B2 = 120000;
  A3 = "South";  B3 = 95000;
}
```

**After** (v1.2) - Using @table for simple tables:

```osf
@table {
  caption: "Sales by Region";
  style: "bordered";
  alignment: ["left", "right"];

  | Region | Revenue |
  | --- | --- |
  | North | $120K |
  | South | $95K |
}
```

**When to Use Each**:

- **@sheet**: Formulas, calculations, complex spreadsheets
- **@table**: Simple data tables, reports, comparisons

**Both are supported** - choose what fits your use case!

### New Feature: @include Directive

**Before** (v1.1) - Monolithic documents:

```osf
@meta { title: "Full Report"; }

@doc {
  # Executive Summary
  Content here...
}

@doc {
  # Financials
  More content...
}

@doc {
  # Recommendations
  Even more content...
}
```

**After** (v1.2) - Modular documents:

```osf
@meta { title: "Full Report"; }

@include { path: "./sections/executive-summary.osf"; }
@include { path: "./sections/financials.osf"; }
@include { path: "./sections/recommendations.osf"; }
```

**Benefits**:

- Split large documents into manageable files
- Reuse common sections
- Better version control (diff only changed sections)
- Team collaboration (work on different files)

---

## 🔒 Security Improvements

### Path Resolution (for @include users)

**Important**: @include paths are now validated for security.

**Allowed** ✅:

```osf
@include { path: "./section.osf"; }           // Relative
@include { path: "./subfolder/section.osf"; } // Subdirectory
@include { path: "../sibling/section.osf"; }  // Sibling (if within base)
```

**Blocked** ❌:

```osf
@include { path: "../../../../etc/passwd"; }  // Directory escape
@include { path: "/etc/passwd"; }             // Absolute path
```

**Why**: Prevents path traversal attacks. Your documents are more secure!

**Action Required**: None, unless you were using absolute paths or trying to
escape the base directory.

### Stricter Validation

v1.2.0 validates inputs more strictly. This catches errors earlier.

**Table Column Validation**:

```osf
// This now throws an error (caught early!)
@table {
  | Name | Age |
  | --- | --- |
  | John | 30 |
  | Jane | 25 | Extra | // ERROR: 3 columns, expected 2
}
```

**Alignment Validation**:

```osf
// This now throws an error
@table {
  alignment: ["left", "invalid", "right"]; // ERROR: "invalid" not allowed

  | A | B | C |
  | --- | --- | --- |
  | 1 | 2 | 3 |
}
```

**Action Required**: Fix any malformed tables. The errors now tell you exactly
what's wrong!

---

## 🔄 API Changes

### Parser API (Backward Compatible)

**v1.1**:

```typescript
import { parse } from 'omniscript-parser';
const doc = parse(osfText);
```

**v1.2** (same, plus new options):

```typescript
import { parse } from 'omniscript-parser';

// Basic usage (same as v1.1)
const doc = parse(osfText);

// NEW: Resolve includes
const doc = parse(osfText, {
  resolveIncludes: true,
  basePath: '/path/to/documents',
  maxDepth: 10, // Default
});
```

**Breaking Changes**: None. The options parameter is optional.

### Return Type Addition

**v1.1**:

```typescript
interface OSFDocument {
  version?: string;
  blocks: OSFBlock[];
}
```

**v1.2** (adds optional field):

```typescript
interface OSFDocument {
  version?: string;
  blocks: OSFBlock[];
  includes?: IncludeDirective[]; // NEW (optional)
}
```

**Impact**: Minimal. Your existing code works. The `includes` field only appears
if your document has @include directives.

**Action Required**: None, unless you use `JSON.stringify()` and compare exact
output. In that case, you may see the new `includes` field.

---

## 📊 Error Message Changes

Error messages are now more helpful with better context.

**Example 1: Table Errors**

**Before** (v1.1):

```
Error: Invalid table
```

**After** (v1.2):

```
Error: Table row 3 has 4 columns, expected 3 to match header
```

**Example 2: Number Errors**

**Before** (v1.1):

```
Error: Invalid number at 1:10
```

**After** (v1.2):

```
Error: Invalid number "999999999999999999999999999999" at 1:10
```

**Action Required**: If you parse error messages programmatically, they may have
changed. Recommended: Use `try/catch` and check error types, not message
strings.

---

## 🎯 TypeScript Users

### Stricter Types

v1.2.0 uses TypeScript's `exactOptionalPropertyTypes` for better type safety.

**Before** (v1.1) - This was allowed:

```typescript
const table: TableBlock = {
  type: 'table',
  headers: ['Name', 'Age'],
  rows: [],
  caption: undefined, // Allowed in v1.1
};
```

**After** (v1.2) - This is rejected:

```typescript
const table: TableBlock = {
  type: 'table',
  headers: ['Name', 'Age'],
  rows: [],
  caption: undefined, // ERROR: Don't set undefined
};
```

**Fix**: Only set optional properties if they have a value:

```typescript
const table: TableBlock = {
  type: 'table',
  headers: ['Name', 'Age'],
  rows: [],
  // caption: omitted (correct)
};

// Or conditionally add:
const table: TableBlock = {
  type: 'table',
  headers: ['Name', 'Age'],
  rows: [],
};
if (caption) {
  table.caption = caption;
}
```

**Why**: Catches bugs earlier, better type safety.

---

## 🧪 Testing Changes

### Test Count

If you check test counts in CI:

**Before**: 56 tests  
**After**: 130 tests

**Action Required**: Update any CI checks that verify test counts.

---

## 🛠️ CLI Changes

### New Commands

All existing commands work unchanged. New functionality added:

**v1.2 additions**:

- `osf parse` now understands @table and @include
- `osf render` supports table rendering
- `osf format` formats @table blocks
- `osf lint` validates @table and @include

**No breaking changes** to command-line interface.

---

## 📦 Package Dependencies

### If You Use Parser as Dependency

**Before** (package.json):

```json
{
  "dependencies": {
    "omniscript-parser": "^1.1.0"
  }
}
```

**After** (automatic with `^`):

```json
{
  "dependencies": {
    "omniscript-parser": "^1.2.0" // Auto-updated by npm
  }
}
```

**Action Required**: Run `npm update` or `pnpm update`.

---

## 🔧 Troubleshooting

### Issue: "Include depth exceeded"

**Cause**: Circular includes or deeply nested files.

**Solution**:

```typescript
// Increase max depth if needed
parse(osf, {
  resolveIncludes: true,
  maxDepth: 20, // Default is 10
});
```

### Issue: "Include path escapes base directory"

**Cause**: Path traversal protection blocking your path.

**Solution**: Use relative paths within your base directory, or adjust basePath:

```typescript
parse(osf, {
  resolveIncludes: true,
  basePath: '/correct/base/path',
});
```

### Issue: "Table row has N columns, expected M"

**Cause**: Inconsistent column count in your table.

**Solution**: Check your table has same column count in all rows:

```osf
@table {
  | A | B | C |      // 3 columns
  | --- | --- | --- |
  | 1 | 2 | 3 |      // 3 columns ✓
  | 4 | 5 |          // 2 columns ✗ ERROR
}
```

Fix: Add missing column or remove extra ones.

---

## ✅ Migration Checklist

### For All Users

- [ ] Update packages to v1.2.0
- [ ] Run tests on existing OSF files
- [ ] Verify all files parse correctly
- [ ] Check rendered output looks correct

### For @include Users

- [ ] Verify basePath is correct
- [ ] Check include paths are relative
- [ ] Test nested includes work
- [ ] Verify no circular references

### For @table Users

- [ ] Verify all rows have same column count
- [ ] Check alignment arrays match column count
- [ ] Test table rendering in HTML/PDF

### For TypeScript Users

- [ ] Check for optional property issues
- [ ] Update types if using OSFDocument
- [ ] Run `tsc --noEmit` to verify

### For CI/CD

- [ ] Update test count expectations (130 tests)
- [ ] Verify security checks pass
- [ ] Check build times still acceptable

---

## 📚 Resources

- **Release Notes**: [RELEASE_NOTES_v1.2.0.md](./RELEASE_NOTES_v1.2.0.md)
- **Security Review**:
  [P#\_REVIEW_CLEAN_SUMMARY.md](./P%23_REVIEW_CLEAN_SUMMARY.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)
- **Documentation**: https://omniscript.dev/docs
- **GitHub Issues**: https://github.com/OmniScriptOSF/omniscript-core/issues

---

## 💬 Need Help?

- **Questions**:
  [GitHub Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
- **Bugs**:
  [GitHub Issues](https://github.com/OmniScriptOSF/omniscript-core/issues)
- **Email**: alpha912@github.com

---

## 🎉 Summary

**Migration complexity**: ⭐☆☆☆☆ (Very Easy)

1. Update packages
2. Test your files
3. Enjoy new features!

**Estimated time**: 5-10 minutes

**Breaking changes**: None

**New capabilities**: Tables, includes, better security

**Happy upgrading!** 🚀
