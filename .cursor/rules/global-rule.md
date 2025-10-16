# OmniScript OSF - Cursor Global Rules

## 🎯 MANDATORY FIRST ACTION

**ALWAYS READ `/AGENTS.md` BEFORE EVERY SESSION**

Before executing any task, read the `/AGENTS.md` file to understand:
- Project structure and organization
- All repositories and their purposes
- Development standards and conventions
- Critical restrictions and rules

## 🚫 CRITICAL RESTRICTIONS

### Never Create Meta-Documentation

**FORBIDDEN FILES** (examples of what NOT to create):
- `DOCUMENTATION_CONSOLIDATION.md`
- `FIXES_APPLIED_FINAL.md`
- `TEST_RESULTS_COMPLETE.md`
- `LOCAL_INTEGRATION_TEST_REPORT.md`
- `PUBLISHING_v1.0.md`
- `V1.0_LAUNCH_READY.md`
- `FINAL_VERIFICATION_COMPLETE.md`
- Any file describing "what I just did"
- Any "summary of work" files

**Rationale**: These are wasteful clutter. Results should be communicated directly or placed in proper permanent documentation.

**ALLOWED DOCUMENTATION** (where info belongs):
- `/omniscript-core/README.md` - Main project README
- `/omniscript-core/RELEASE_NOTES.md` - Release notes
- `/omniscript-core/docs/TESTING.md` - Test documentation
- `/omniscript-core/docs/CODE_QUALITY.md` - Code quality reports
- `/omniscript-core/docs/DEVELOPMENT.md` - Developer guide
- Package-specific READMEs in each package directory

### Git and Publishing

- ❌ Do NOT `npm publish` unless explicitly told
- ❌ Do NOT `git push` unless explicitly told
- ❌ Do NOT modify published packages
- ✅ Always test locally first
- ✅ Follow exact user instructions

## 📁 Project Structure

```
/var/www/OmniScriptOSF/
├── AGENTS.md              # AI agent context (read first!)
├── CLAUDE.md              # Zero-planning coding prompt
├── omniscript-core/       # Main git repository
│   ├── README.md          # Main project README
│   ├── RELEASE_NOTES.md   # Release notes
│   ├── docs/              # Consolidated documentation
│   │   ├── TESTING.md
│   │   ├── CODE_QUALITY.md
│   │   └── DEVELOPMENT.md
│   ├── parser/            # npm: omniscript-parser
│   ├── cli/               # npm: omniscript-cli
│   └── spec/              # OSF specifications
├── omniscript-converters/ # npm: omniscript-converters
├── omniscript-examples/   # Example OSF documents
└── omniscript-site/       # Documentation website (Next.js)
```

## 🔧 Development Standards

### Code Quality
- TypeScript strict mode enabled
- 100% type coverage required
- Vitest for all tests
- Zero `any` types (use proper typing)

### Testing
- Unit tests for all features
- Integration tests for converters
- All tests must pass before commits
- Run: `pnpm test` in each package

### File Organization
- Parser code: `omniscript-core/parser/src/`
- Converter code: `omniscript-converters/src/`
- CLI code: `omniscript-core/cli/src/`
- Tests: `*/tests/` or `*/src/**/*.test.ts`

### Naming Conventions
- Files: `kebab-case.ts`
- Types: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## 🎨 OmniScript Format (OSF)

### Block Types (v1.0)
- `@meta` - Document metadata
- `@doc` - Document content (Markdown)
- `@slide` - Presentation slides
- `@sheet` - Spreadsheet data
- `@chart` - Charts (bar, line, pie, scatter, area)
- `@diagram` - Diagrams (flowchart, sequence, gantt, mindmap)
- `@code` - Code blocks with syntax highlighting

### Supported Output Formats
- PDF (Puppeteer + Chart.js + Mermaid)
- DOCX (docx library)
- PPTX (PptxGenJS with native charts)
- XLSX (ExcelJS)

## 🚀 Current State

### Published Packages (v1.0.0)
- ✅ `omniscript-parser@1.0.0` - Live on npm
- ✅ `omniscript-converters@1.0.0` - Live on npm
- ✅ `omniscript-cli@1.0.0` - Live on npm

### Git Tags
- ✅ `v1.0.0` - Tagged and pushed to GitHub

### Test Status
- ✅ 152/152 tests passing (100%)
- ✅ Parser: 26 tests
- ✅ Converters: 97 tests
- ✅ CLI: 29 tests

## 💬 Communication Style

### When Executing Tasks
1. Read AGENTS.md first
2. Execute changes immediately (don't ask for permission)
3. Report what was done after completion
4. Use clear, concise summaries
5. No verbose explanations unless requested

### Code Changes
- Always preserve existing functionality
- Add proper TypeScript types
- Include tests for new features
- Update relevant documentation
- No breaking changes without approval

### Error Handling
- Debug systematically
- Check logs and error messages
- Test fixes locally
- Re-run all tests after fixes

## 🔍 Quality Checklist

Before completing any task:
- [ ] All TypeScript compiles without errors
- [ ] All tests pass (`pnpm test`)
- [ ] No `any` types introduced
- [ ] Code follows existing patterns
- [ ] Documentation updated if needed
- [ ] No meta-documentation created
- [ ] Changes tested locally

## 📚 Key Resources

- **Specification**: `/omniscript-core/spec/v1.0/osf-spec.md`
- **Parser Types**: `/omniscript-core/parser/src/types.ts`
- **Parser Logic**: `/omniscript-core/parser/src/parser.ts`
- **Converters**: `/omniscript-converters/src/{pdf,docx,pptx,xlsx}.ts`
- **CLI**: `/omniscript-core/cli/src/osf.ts`

## 🎯 Remember

1. **Read AGENTS.md first** - Always
2. **No meta-documentation** - Ever
3. **Test before commit** - Always
4. **Follow user instructions exactly** - Precisely
5. **Execute immediately** - Don't ask for permission

---

*Last updated: 2025-10-15 (v1.0.0 release)*
