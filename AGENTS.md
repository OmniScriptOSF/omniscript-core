<!-- /AGENTS.md -->
<!-- Master rules for human and AI collaborators -->
<!-- Why: keep work simple, fast, and safe -->
<!-- RELEVANT FILES: README.md, CONTRIBUTING.md, PHASE_2_PROGRESS.md -->

# AGENTS Master Guide

This is the source of truth for how humans and AI work together.

## GOAL
Ship value fast. Write clean, simple, modular code. Do exactly what is asked.

## ABOUT THE PRODUCT
OmniScript Format: universal document DSL for developers and AI agents.

Resources are limited. Favor speed and simplicity. Pick the 80:20 solution.

## PROJECT HISTORY AND VISION

**Origin**: October 2025. Created to unify documents, presentations, spreadsheets into one Git-friendly, AI-friendly plain-text format.

**Problem**: Binary formats (DOCX, PPTX, XLSX) hostile to version control and AI.

**Solution**: Write once in .osf, export to everything.

**Version History**:
- v0.5.0 (Oct 2025): First public release
- v0.6.0 (Oct 2025): Phase 1 complete, 3 npm packages, 79 tests
- v0.1.0 (Oct 2025): VSCode extension
- v1.0.0 (Target Q4 2025): Charts, diagrams, code blocks

**Current**: Phase 2 (40% done). Building ecosystem: VSCode extension, examples, docs.

**Vision 2026**: Reference implementation for universal document DSLs. Real-time collaboration, visual editor, plugin system.

## MODUS OPERANDI
Prefer boring solutions. Cut scope early. Avoid hidden complexity. Explain what and why.

## TECH STACK
Backend: Node.js 22, TypeScript 5.8. Frontend: Next.js 15.3, React 18, Tailwind 3.4. Infra: Docker, GitHub Actions, pnpm 10.12. Data: File-based, no database.

## ARCHITECTURE

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

**Block Types**:
@meta (metadata), @doc (markdown), @slide (presentations), @sheet (spreadsheets), @chart/@diagram/@code (v1.0).

**Integration Points**:
VSCode ↔ Parser (real-time), CLI ↔ Parser ↔ Converters, Website ↔ Parser (playground), Examples ↔ Validator ↔ Parser (CI).

## DEPLOYED ENVIRONMENTS
Production: https://omniscriptosf.github.io. NPM: omniscript-parser, omniscript-converters, omniscript-cli. VSCode: marketplace.visualstudio.com.

## VERSION CONTROL
Git. Follow .cursor/rules/universal.mdc. Small commits with conventional commits: feat:, fix:, docs:, chore:.

## ESSENTIAL COMMANDS
Parser: cd omniscript-core/parser && pnpm test. Converters: cd omniscript-converters && pnpm test. CLI: osf render file.osf. VSCode: cd omniscript-vscode && npm run compile. Website: cd omniscript-site && npm run dev. Examples: cd omniscript-examples && npm run validate.

## HEADER COMMENTS
Every file starts with four lines: 1) exact file location, 2) what this file does, 3) why this file exists, 4) RELEVANT FILES: comma-separated list. Never remove.

## WRITING STYLE
Short sentences. Plain English. Split long sentences, add blank line. Comment non-obvious code.

## SIMPLICITY
Simple is good. Complex is bad. Fewer lines better if clarity stays high. Prefer standard library.

## ROLES AND PERMISSIONS
Product Owner: sets scope (Alphin Tom). Developers: implement, review, release. Editor AI: edits files, no npm publish without approval. Autonomous Agents: refactors/tests only when requested, no production changes.

## UI PRINCIPLES
NOIR design system: black backgrounds, white text, accent colors. Simple, minimal, clear hierarchy. Accessibility before decoration.

## API CONVENTIONS
Library exports. Parser: parse(text: string) → Document. Converters: convert(document, options) → Buffer. CLI: osf render <file> --format <type>. Errors: throw Error with context.

## DATABASE PRINCIPLES
No database. File-based .osf format. Version control via git.

## SECURITY BASELINE
No secrets in code. Validate OSF syntax at parse. Pin dependencies, run npm audit. VSCode: sandbox user code.

## PRIVACY AND DATA RETENTION
Collect no user data. Examples use synthetic data. Log no sensitive info. No telemetry in core packages.

## LOGGING AND TELEMETRY
Levels: debug, info, warn, error. Parser errors include line/column. CLI: stderr for logs, stdout for output. VSCode: output channel, not console.

## ERROR HANDLING
Parse: fail fast with line number. Converters: validate before conversion. CLI: exit 1 on error, 0 on success. Helpful messages, no internal stacks in production.

## PERFORMANCE BUDGETS
Parser: 1000-line doc in <100ms. Converters: PDF in <2s. Website: LCP <2s on 4G. CLI: total <5s for typical doc.

## ACCESSIBILITY AND I18N
WCAG 2.1 AA for website. Keyboard navigation. Screen reader support. CLI/parser language-agnostic. Error messages in English only.

## FEATURE FLAGS AND ROLLOUT
New @blocks start experimental. Document in spec with version tag. Parser accepts but warns. Promote to stable after 2 releases.

## DEPENDENCIES
Prefer standard library. Parser: zero dependencies. Converters: pdfkit, docx, pptxgenjs, exceljs. VSCode: @types and vscode SDK only. Website: Next.js, React, Tailwind. Review licenses.

## FORMATTING AND LINTING
TypeScript: ESLint v9 strict. Formatter: Prettier for TS/JS. Python (future): ruff, black. Run in CI.

## RELEASE AND ROLLBACK
Publish from main with version tag. Follow semver. Breaking changes = major bump. Monitor npm downloads and GitHub issues. Rollback: npm deprecate if critical bug.

## MANDATORY FIRST ACTIONS

**ALWAYS RUN THESE COMMANDS FIRST** before any work:

1. **Get Current Date/Time** - NEVER assume dates:
   ```bash
   date "+%Y-%m-%d %H:%M:%S %Z" && date "+Today is %B %d, %Y"
   ```
   Use this date in ALL documentation, examples, and release notes.

2. **Read Context** - Read AGENTS.md for project rules.

**CRITICAL**: Do not use assumed dates like "January 2025" or "today". Always get the actual system date first.

## RESTRICTIONS
Do not npm publish unless told. Do not push to remote unless told. Do not modify published packages. Do exactly what is asked. Test locally first.

**NEVER CREATE META-DOCUMENTATION**: Do not create documentation about documentation work (e.g., DOCUMENTATION_CONSOLIDATION.md, FIXES_APPLIED_FINAL.md, TEST_RESULTS_COMPLETE.md, PUBLISHING_v1.0.md, LOCAL_INTEGRATION_TEST_REPORT.md, V1.0_LAUNCH_READY.md). Results go in proper docs (README, RELEASE_NOTES.md, docs/TESTING.md, docs/CODE_QUALITY.md, docs/DEVELOPMENT.md). Temporary work reports are forbidden. Only create docs requested by user or required for public API.

## FILE LENGTH
Keep under 300 lines. Parser: split by block type. Converters: one file per format. Examples: split by category.

## READING FILES
Read full file before editing. Read related files in same module. Check examples when changing parser. Check spec when adding features.

## DATABASE CHANGES
No database in project. File format changes require spec update first in spec/v1.0/ or new version folder.

## OUTPUT STYLE
State assumptions clearly. State conclusions briefly. Show code changes inline. Include test commands when relevant.

## PULL REQUEST REVIEW PROCESS

**MANDATORY BEFORE EVERY COMMIT**: Act as a staff engineer performing a Pull Request review using a P# severity scheme: P0 blocker, P1 high, P2 medium, P3 low. Read the diff and context, attempt to build and run tests if possible, and assess:

- Correctness, test coverage and edge cases
- Error handling and input validation
- Concurrency and race conditions
- Security including secrets, auth, OWASP risks
- Performance and complexity, memory use
- API contracts and backward compatibility
- Database or migration safety
- Dependency changes and licenses
- CI configuration
- Logging and observability
- Accessibility and i18n
- Readability and style
- Documentation and comments
- Alignment with architectural guidelines

**Output Format**:
- **Summary**: One sentence on risk and scope
- **Verdict**: Approve or Request changes with rationale
- **Findings**: Numbered list where each item starts with [P#] then file:line then description then why it matters then minimal patch
- **Tests**: List missing or flaky tests with sample cases
- **Follow-ups**: Optional small improvements

**Commit Policy**: Only commit if there are NO P0-P3 issues found.

---

## CHECKLIST FOR EVERY CHANGE
- [ ] PR review process completed (no P0-P3 issues)
- [ ] Scope confirmed
- [ ] Relevant files read including spec
- [ ] Header comments present and updated
- [ ] File under 300 lines or split
- [ ] Security checked: no secrets, input validated
- [ ] Errors return helpful messages
- [ ] Tests pass: npm test in affected package
- [ ] Examples still validate if parser changed
- [ ] Version bumped if publishing
- [ ] CHANGELOG updated if publishing
