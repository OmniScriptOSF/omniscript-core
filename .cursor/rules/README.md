# Cursor AI Rules for OmniScript

## Pull Request Review Process (MANDATORY)

**Before every commit**, perform a comprehensive PR review as a staff engineer:

### Severity Levels

- **P0**: Blocker - Must fix before commit
- **P1**: High - Critical issues that should block
- **P2**: Medium - Important but not blocking
- **P3**: Low - Nice to have improvements

### Review Checklist

#### Correctness & Testing

- [ ] Logic is correct and handles all cases
- [ ] Test coverage for new features (aim for 90%+)
- [ ] Edge cases identified and tested
- [ ] Error paths tested

#### Security

- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user data
- [ ] Output sanitization (XSS prevention)
- [ ] Authentication/authorization checked
- [ ] OWASP Top 10 risks addressed
- [ ] Dependencies scanned for vulnerabilities

#### Performance & Scalability

- [ ] No obvious performance bottlenecks
- [ ] Memory usage reasonable
- [ ] No N+1 queries or loops
- [ ] Complexity is O(n) or better where possible

#### API & Compatibility

- [ ] No breaking changes without major version bump
- [ ] Backward compatibility maintained
- [ ] Public API contracts documented
- [ ] Types are correct and complete

#### Database & Data

- [ ] Migrations are reversible
- [ ] No data loss risk
- [ ] Indexes added where needed
- [ ] Query performance acceptable

#### Dependencies & CI

- [ ] New dependencies justified and licensed (MIT/Apache/BSD)
- [ ] Lock files updated
- [ ] CI configuration correct
- [ ] Build and tests pass

#### Observability

- [ ] Errors logged with context
- [ ] Important operations logged
- [ ] No sensitive data in logs
- [ ] Metrics added for key operations

#### Code Quality

- [ ] Code is readable and maintainable
- [ ] Functions are small and focused
- [ ] Names are clear and descriptive
- [ ] Documentation exists for complex logic
- [ ] Comments explain "why" not "what"
- [ ] No commented-out code

#### Accessibility & i18n

- [ ] UI is keyboard accessible (if applicable)
- [ ] Screen reader compatible (if applicable)
- [ ] Text is externalized for i18n (if applicable)

### Output Format

```
Summary: [One sentence describing risk level and change scope]

Verdict: [Approve | Request changes]
Rationale: [Why this verdict]

Findings:
1. [P0] file.ts:123 - [Clear description] - [Why it matters] - [Minimal fix]
2. [P1] file.ts:456 - [Description] - [Impact] - [Solution]

Tests:
- Missing: [Test description with example case]
- Flaky: [Test that needs fixing]

Follow-ups:
- [P3] [Optional improvement for future PR]
```

### Commit Policy

**ONLY COMMIT IF**: No P0, P1, P2, or P3 issues are found in the review.

If issues exist:

1. Fix all P0-P2 issues immediately
2. Consider fixing P3 issues or document as tech debt
3. Re-run review after fixes
4. Commit only when clean

---

## Additional Rules

See AGENTS.md and CLAUDE.md for full coding standards and workflows.

### Quick Reference

- **Header comments**: 4 lines (File, What, Why, Related)
- **TypeScript**: Strict mode, no `any`
- **Tests**: Vitest, 90%+ coverage
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)
- **Files**: Keep under 300 lines
- **Security**: No secrets in code, validate inputs
