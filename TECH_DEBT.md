# Technical Debt

## File Organization (P1 - High Priority)

### Issue

Two core files exceed the 300-line guideline significantly:

- `cli/src/osf.ts`: 1,130 lines (377% over limit)
- `parser/src/parser.ts`: 904 lines (301% over limit)

### Impact

- Harder to review and maintain
- Violates AGENTS.md coding standards
- Increases cognitive load for contributors

### Proposed Refactoring

#### CLI Module Split (`cli/src/osf.ts`)

```
cli/src/
├── osf.ts (main, <200 lines)
├── types.ts (shared types)
├── utils/
│   ├── html-escape.ts (XSS prevention)
│   ├── text-renderer.ts (TextRun rendering)
│   └── formula-evaluator.ts (spreadsheet formulas)
├── render/
│   ├── html.ts (renderHtml)
│   ├── markdown.ts (exportMarkdown)
│   ├── json.ts (exportJson)
│   └── converters.ts (PDF/DOCX/PPTX/XLSX)
└── commands/
    ├── parse.ts
    ├── lint.ts
    ├── render.ts
    └── export.ts
```

#### Parser Module Split (`parser/src/parser.ts`)

```
parser/src/
├── parser.ts (main parse/serialize, <200 lines)
├── types.ts (already exists)
├── lexer.ts
│   ├── findBlocks()
│   ├── skipWS()
│   ├── removeComments()
├── string-parser.ts
│   ├── parseString()
│   ├── escapeString()
├── block-parsers/
│   ├── meta.ts (parseMetaBlock)
│   ├── doc.ts (parseDocBlock)
│   ├── slide.ts (parseSlideBlock)
│   ├── sheet.ts (parseSheetBlock)
│   ├── chart.ts (parseChartBlock)
│   ├── diagram.ts (parseDiagramBlock)
│   └── code.ts (parseCodeBlock)
└── serializers/
    ├── meta.ts (serializeMetaBlock)
    ├── doc.ts (serializeDocBlock)
    └── content.ts (serializeContentBlock)
```

### Recommended Approach

1. Create a dedicated refactoring PR
2. Extract modules one at a time
3. Run full test suite after each extraction
4. Maintain 100% test coverage throughout
5. No new features during refactoring

### Estimated Effort

- 6-8 hours of careful extraction
- 2-3 hours of testing and validation
- Total: 1-2 days for clean, tested refactor

### Acceptance Criteria

- All files <300 lines
- 88/88 tests still passing
- No breaking changes to public API
- Documentation updated
- Lint warnings eliminated

---

## Type Safety Improvements (P2 - Medium Priority)

### Remaining `any` Type Usages

#### 1. Parser Chart/Diagram Parsing (`parser/src/parser.ts`)

**Lines**: 618, 625  
**Context**: Parsing arbitrary JSON-like structures from OSF  
**Mitigation**: Using type assertions with `as unknown as Type`  
**Risk**: Low - validated by tests

#### 2. Test Escape Sequences (`parser/tests/v1-blocks.test.ts`)

**Lines**: 244  
**Issue**: Unnecessary escape characters in template strings  
**Fix**: Use single quotes or remove escapes

### Recommended Actions

1. Add runtime validation for chart/diagram data structures
2. Create branded types for better type safety
3. Add Zod schemas for OSF block validation

---

## Additional Improvements (P3 - Low Priority)

### Missing JSDoc

Add documentation to:

- All public API functions (`parse`, `serialize`)
- Complex internal functions
- Type definitions

### Test Coverage Gaps

Add tests for:

- Unicode edge cases (partial escapes, boundary conditions)
- XSS edge cases (formula results, nested content)
- Error position tracking at EOF
- Large file parsing performance

### Performance Optimizations

- Memoize `getLineColumn()` for large files
- Consider streaming parser for >1MB files
- Add benchmarks for regression testing

---

## Review Notes

This technical debt is **acceptable for v1.1.0 release** because:

- ✅ All 88/88 tests passing
- ✅ No security vulnerabilities
- ✅ No functional bugs
- ✅ API is stable and backward compatible
- ✅ Production deployments successful

The debt should be addressed in v1.2.0 or earlier to maintain code quality
standards.

**Created**: 2025-01-16  
**Last Updated**: 2025-01-16  
**Target Resolution**: v1.2.0 (Q1 2025)
