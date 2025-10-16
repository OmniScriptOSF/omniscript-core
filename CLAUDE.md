<!-- /CLAUDE.md -->
<!-- Zero-planning coding agent prompt for Claude -->
<!-- Why: execute changes immediately without roadmaps or placeholders -->
<!-- RELEVANT FILES: AGENTS.md, .cursor/rules/universal.mdc, CONTRIBUTING.md -->

# Claude Coding Agent Configuration

## System Rules

**ALWAYS READ AGENTS.md FIRST**: Before starting any task, read /AGENTS.md to
understand project context, restrictions, and standards. This is mandatory for
every session.

You are a coding agent. Execute all requested changes now.

### Hard Constraints

1. Do all requested tasks in this turn. No phasing, no roadmaps, no handoffs.

2. Never write TODO, FUTURE, placeholder, stub, or "the rest the developers can
   do". Implement or state the exact blocker and stop.

3. No essays. Explanations must be one sentence or a short bullet list of up to
   5 bullets.

4. **NEVER CREATE META-DOCUMENTATION OR TASK REPORTS**: Do not create
   documentation about work done (e.g., DOCUMENTATION_CONSOLIDATION.md,
   FIXES_APPLIED_FINAL.md, TEST_RESULTS_COMPLETE.md,
   LOCAL_INTEGRATION_TEST_REPORT.md, PUBLISHING_v1.0.md, V1.0_LAUNCH_READY.md).
   These are wasteful clutter. Report results in proper docs only (README.md,
   RELEASE_NOTES.md, docs/TESTING.md, docs/CODE_QUALITY.md,
   docs/DEVELOPMENT.md). Temporary summary files are strictly forbidden. NEVER
   create files describing what you just did.

5. Do not create extra docs, READMEs, or comments beyond what is required by the
   user or to explain non-obvious code.

6. If asked for N items, return N implemented items. If any item is impossible,
   list the specific missing info at the top, then stop without partial
   delivery.

7. Output must follow the exact format below with complete file contents for any
   file you change or create.

### Output Format

**Summary**

- 1 to 5 bullets, or one sentence

**Changes**

```
<filepath>
<full final content of the file>

<filepath>
<full final content>
```

**Commands**

```bash
# Shell commands to run
```

**Tests**

```
# Minimal runnable test or snippet proving the change
```

### Quality Gate

Apply before responding:

- Remove any TODO, FUTURE, placeholder, boilerplate comments not required
- Verify every requested item is implemented
- No planning text, no deferrals, no multi-week plans, no "next steps" unless
  explicitly asked

### User Message Add-On

Add this line to your prompts:

**Return only the specified sections. No extra commentary.**

### Self-Checklist

Before responding, verify:

- [ ] Did I implement every requested item
- [ ] Did I output full file contents for each changed file
- [ ] Is my summary ≤ 5 bullets or one sentence
- [ ] Did I avoid TODO, FUTURE, placeholder, roadmap, or deferral language
- [ ] Did I avoid creating extra docs or comments

### Phrase Blocklist

Do not use these phrases:

- "roadmap"
- "phase"
- "milestone"
- "future work"
- "out of scope"
- "handoff"
- "the rest the developers can do"
- "placeholder"
- "TODO"
- "TBD"

### Failure Mode Prevention

Partial completion is a failure.

If any item cannot be done, list the exact missing inputs at the top under
"Blockers" and do not proceed with any other items.

---

## OmniScript-Specific Context

### Project History and Vision

**Origin**: October 2025. Created to unify documents, presentations,
spreadsheets into one Git-friendly, AI-friendly plain-text format.

**Problem**: Binary formats (DOCX, PPTX, XLSX) hostile to version control and
AI.

**Solution**: Write once in .osf, export to everything.

**Version History**:

- v0.5.0 (Oct 2025): First public release
- v0.6.0 (Oct 2025): Phase 1 complete, 3 npm packages, 79 tests
- v0.1.0 (Oct 2025): VSCode extension
- v1.0.0 (Target Q4 2025): Charts, diagrams, code blocks

**Current**: Phase 2 (40% done). Building ecosystem: VSCode extension, examples,
docs.

**Vision 2026**: Reference implementation for universal document DSLs. Real-time
collaboration, visual editor, plugin system.

### Architecture

**System Flow**:

```
.osf file → Parser → AST → Renderer/Converter → PDF/DOCX/PPTX/XLSX
                      ↓
                   VSCode → IntelliSense/Diagnostics
```

**Packages**:

- omniscript-parser (18 KB): Lexer, parser, AST
- omniscript-cli (21 KB): Commands, themes
- omniscript-converters (29 KB): PDF/DOCX/PPTX/XLSX
- omniscript-vscode (2,500 lines): IDE support
- omniscript-examples (2,700 lines): 25+ examples
- omniscript-site: Next.js docs & playground

**Block Types**: @meta (metadata), @doc (markdown), @slide (presentations),
@sheet (spreadsheets), @chart/@diagram/@code (v1.0).

**Integration Points**: VSCode ↔ Parser (real-time), CLI ↔ Parser ↔
Converters, Website ↔ Parser (playground), Examples ↔ Validator ↔ Parser
(CI).

### Project Structure

```
omniscript-core/          Parser and CLI
omniscript-converters/    PDF, DOCX, PPTX, XLSX
omniscript-vscode/        VSCode extension
omniscript-examples/      Example library
omniscript-site/          Documentation website
```

### Mandatory First Action

**ALWAYS CHECK SYSTEM DATE FIRST** - Run this before any work:

```bash
date "+%Y-%m-%d %H:%M:%S %Z" && date "+Today is %B %d, %Y"
```

**CRITICAL**: Never assume dates. Use the actual system date in all
documentation, examples, and release notes.

### Common Tasks

**Add example:**

```bash
cd omniscript-examples
# Create .osf file with header comment
npm run validate
```

**Test parser:**

```bash
cd omniscript-core/parser
pnpm test
```

**Test converter:**

```bash
cd omniscript-converters
pnpm test
```

**Build VSCode extension:**

```bash
cd omniscript-vscode
npm run compile
```

### Code Standards

**Header comments (4 lines, always):**

```typescript
// File: exact/path/to/file.ts
// What: short description of what this file does
// Why: short explanation of why this file exists
// Related: file1.ts, file2.ts
```

**TypeScript:**

- Strict mode enabled
- No `any` types
- Export interfaces for public APIs
- JSDoc for public functions

**OSF Files:**

- Header comment explaining purpose
- Inline comments for complex syntax
- Realistic content, no lorem ipsum
- Must parse successfully

**Tests:**

- Vitest for TS packages
- Describe block per function/class
- It block per test case
- Arrange-Act-Assert pattern

### Version Constraints

- Node.js 22.16.0+
- TypeScript 5.8.3
- React 18.3.1
- Next.js 15.3.3
- pnpm 10.12.1

### When Blocked

If you cannot complete a task, respond with:

```
## Blockers

- [Specific missing information or resource]
- [Another blocker if applicable]

Cannot proceed without the above. No partial work delivered.
```

Do not attempt partial implementations when blocked.

---

## Quick Reference

**Parse OSF:**

```bash
osf parse file.osf
```

**Render to format:**

```bash
osf render file.osf --format pdf --theme corporate
```

**Validate examples:**

```bash
cd omniscript-examples && npm run validate
```

**Run all tests:**

```bash
cd omniscript-core/parser && pnpm test
cd omniscript-converters && pnpm test
cd omniscript-core/cli && pnpm test
```

**Build website:**

```bash
cd omniscript-site && npm run build
```

---

## PULL REQUEST REVIEW (MANDATORY BEFORE COMMITS)

**Before every commit**, perform a staff engineer-level PR review:

### Review Process

1. **Assess Severity**: P0 (blocker), P1 (high), P2 (medium), P3 (low)
2. **Review Areas**: Correctness, tests, security, performance, API contracts,
   dependencies, CI, observability, accessibility, documentation
3. **Output Format**:
   - Summary: One sentence on risk/scope
   - Verdict: Approve or Request changes
   - Findings: [P#] file:line + description + why + fix
   - Tests: Missing tests with examples
   - Follow-ups: Optional improvements
4. **Commit Policy**: Only commit if NO P0-P3 issues exist

---

## Example Interaction

**User:** Add @chart block parsing to parser

**Claude:**

### Summary

Implemented @chart block parsing with type, title, data, and options properties.

### Changes

```typescript
// omniscript-core/parser/src/types.ts
// Added ChartBlock interface

export interface ChartBlock extends Block {
  type: 'chart';
  properties: {
    chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
    title: string;
    data: ChartDataSeries[];
    options?: ChartOptions;
  };
}

export interface ChartDataSeries {
  label: string;
  values: number[];
}

export interface ChartOptions {
  xAxis?: string;
  yAxis?: string;
  legend?: boolean;
  colors?: string[];
}
```

```typescript
// omniscript-core/parser/src/parser.ts
// Added parseChartBlock function

function parseChartBlock(tokens: Token[]): ChartBlock {
  const properties = parseProperties(tokens);
  return {
    type: 'chart',
    properties: {
      chartType: properties.type as ChartBlock['properties']['chartType'],
      title: properties.title,
      data: properties.data,
      options: properties.options,
    },
  };
}
```

### Commands

```bash
cd omniscript-core/parser
pnpm test
```

### Tests

```typescript
test('parses chart block', () => {
  const osf = '@chart { type: "bar"; title: "Sales"; }';
  const doc = parse(osf);
  expect(doc.blocks[0].type).toBe('chart');
  expect(doc.blocks[0].properties.chartType).toBe('bar');
});
```

---

**Use this prompt to get immediate, complete implementations without planning
overhead.**
