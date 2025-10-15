# Contributing to OmniScript Core

Thank you for your interest in contributing to **OmniScript Format (OSF)**! We
welcome contributions from everyone — whether you're fixing bugs, improving
documentation, implementing new features, or helping with testing.

---

## 🚀 Getting Started

### 1️⃣ Fork the repository

Click the **Fork** button at the top right of the
[omniscript-core](https://github.com/OmniScriptOSF/omniscript-core) repository
page to create your own copy.

### 2️⃣ Clone your fork locally

```bash
git clone https://github.com/your-username/omniscript-core.git
cd omniscript-core
git checkout -b my-feature-branch
```

### 3️⃣ Install dependencies

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install project dependencies
pnpm install

# Build all packages
pnpm run build
```

### 4️⃣ Make your changes

- Follow the coding style enforced by ESLint and Prettier
- Add/update tests where relevant
- Update documentation if needed
- Ensure type safety with TypeScript

### 5️⃣ Run quality checks

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Check code coverage
pnpm run test:coverage

# Type checking
pnpm run typecheck

# Lint your code
pnpm run lint

# Format your code
pnpm run format

# Or run all checks at once
pnpm run lint && pnpm run typecheck && pnpm test
```

### 6️⃣ Commit and push

```bash
git add .
git commit -m "feat: describe your change concisely"
git push origin my-feature-branch
```

### 7️⃣ Open a Pull Request

Go to your fork on GitHub and click **Compare & pull request**. Fill in the PR
template and describe your change clearly.

---

## 💡 Contribution Types

✅ Fix bugs ✅ Add features to parser/CLI ✅ Improve or extend the OSF spec ✅
Write examples and test documents ✅ Improve documentation, READMEs, and guides
✅ Build conversion tools or integrations ✅ Improve tooling (VSCode, LSP, etc.)

---

## ✨ Guidelines

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring without changing functionality
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependencies, etc.
- `ci:` - CI/CD configuration changes

**Examples:**
```
feat: add @diagram block support
fix: handle nested bullets in slides properly
docs: update CLI usage examples
test: add tests for formula parsing
```

### Code Style

- **TypeScript**: Use strict mode with proper type annotations
- **Formatting**: Automatically handled by Prettier (run `pnpm run format`)
- **Linting**: Follow ESLint rules (run `pnpm run lint`)
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/types

### Testing Requirements

- All new features must include tests
- Aim for 80%+ code coverage
- Write both unit tests and integration tests where applicable
- Test edge cases and error handling

### Pull Request Process

1. All PRs should target the `main` branch unless directed otherwise
2. Fill out the PR template completely
3. Ensure all CI checks pass (tests, linting, type checking)
4. Request review from maintainers
5. Address any review feedback
6. Once approved, maintainers will merge your PR

### Code Review Guidelines

- Be respectful and constructive in feedback
- Focus on code quality, not personal preferences
- Explain the "why" behind suggestions
- Approve PRs that meet the project standards

### All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md)

---

## 🤝 Community

Join our discussions on
[GitHub Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
to ask questions, propose ideas, or collaborate.

We value respectful, constructive collaboration. Your contributions help build
the future of intelligent, interoperable documents!

---

## 📚 Development Resources

### Project Structure

```
omniscript-core/
├── parser/          # Core OSF parsing library
├── cli/             # Command-line interface
├── spec/            # OSF specification versions
├── examples/        # Example OSF documents
├── tests/           # Test suites
└── docs/            # Documentation

omniscript-converters/
└── src/             # Format conversion implementations

omniscript-vscode/
└── # VSCode extension (in development)

omniscript-site/
└── # Documentation website (in development)
```

### Key Technologies

- **Language**: TypeScript 5.x
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Linting**: ESLint 9.x
- **Formatting**: Prettier 3.x
- **Build**: TypeScript Compiler (tsc)
- **CI/CD**: GitHub Actions

### Useful Commands

```bash
# Development
pnpm run dev              # Watch mode for development

# Building
pnpm run build            # Build all packages
pnpm run clean            # Clean build artifacts

# Testing
pnpm test                 # Run tests
pnpm run test:watch       # Watch mode testing
pnpm run test:coverage    # Coverage report

# Code Quality
pnpm run lint             # Lint and fix
pnpm run format           # Format code
pnpm run typecheck        # Type checking

# CLI Testing
cd cli/dist
node index.js parse ../../examples/rich_demo.osf
```

### Getting Help

- 📖 Read the [documentation](docs/spec-v0.5-overview.md)
- 💬 Ask in [GitHub Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
- 🐛 Report issues using [issue templates](.github/ISSUE_TEMPLATE/)
- 📧 Contact maintainer: [@alpha912](https://github.com/alpha912)

---

## 📄 License & Ownership

By contributing, you agree that your contributions will be licensed under the
terms of the [MIT License](LICENSE).

OmniScript Format (OSF) is led and maintained by **Alphin Tom**
([alpha912](https://github.com/alpha912)). Please credit the creator when
referencing the project.
