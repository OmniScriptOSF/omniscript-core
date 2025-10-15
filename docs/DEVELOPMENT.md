# Development Documentation

**Last Updated**: October 15, 2025  
**Project**: OmniScript Format  
**Version**: v1.0

---

## 🏗️ Project Structure

```
OmniScriptOSF/
├── omniscript-core/          # Core packages
│   ├── parser/               # OSF parser
│   ├── cli/                  # Command-line tools
│   ├── spec/                 # OSF specifications
│   └── docs/                 # Core documentation
├── omniscript-converters/    # Format converters
├── omniscript-site/          # Documentation website
├── omniscript-vscode/        # VSCode extension
├── omniscript-examples/      # Example documents
├── docs/                     # Project documentation
│   ├── TESTING.md           # Test documentation
│   ├── CODE_QUALITY.md      # Quality reports
│   └── DEVELOPMENT.md       # This file
├── README.md                 # Main README
├── RELEASE_NOTES.md          # Release notes
├── AGENTS.md                 # AI context
└── CLAUDE.md                 # AI prompt
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 22.16.0 or higher
- **pnpm**: 10.12.1 or higher
- **Git**: Latest version

### Clone Repository

```bash
git clone https://github.com/OmniScriptOSF/omniscript-core.git
cd omniscript-core
```

### Install Dependencies

```bash
# Install all dependencies
pnpm install

# Install dependencies for specific package
cd omniscript-core/parser
pnpm install
```

### Build All Packages

```bash
# Build all packages
pnpm build --recursive

# Build specific package
cd omniscript-core/parser
pnpm build
```

---

## 🧪 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

Edit code in appropriate package:

- Parser: `omniscript-core/parser/src/`
- Converters: `omniscript-converters/src/`
- CLI: `omniscript-core/cli/src/`

### 3. Run Tests

```bash
# Run tests for changed package
cd omniscript-core/parser
pnpm test

# Run all tests
pnpm test --recursive
```

### 4. Build

```bash
# Build changed package
pnpm build

# Build all packages
pnpm build --recursive
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Refactoring
- `chore:` - Maintenance

### 6. Push and Create PR

```bash
git push origin feature/my-feature
```

Create pull request on GitHub.

---

## 📦 Package Development

### Parser Package

**Location**: `omniscript-core/parser/`

**Development**:

```bash
cd omniscript-core/parser

# Build
pnpm build

# Test
pnpm test

# Watch mode
pnpm build --watch
```

**Key Files**:

- `src/parser.ts` - Main parser logic
- `src/types.ts` - TypeScript types
- `src/index.ts` - Public API
- `tests/` - Test files

### Converters Package

**Location**: `omniscript-converters/`

**Development**:

```bash
cd omniscript-converters

# Build
pnpm build

# Test
pnpm test

# Test specific converter
pnpm test pdf
```

**Key Files**:

- `src/pdf.ts` - PDF converter
- `src/docx.ts` - DOCX converter
- `src/pptx.ts` - PPTX converter
- `src/xlsx.ts` - XLSX converter
- `tests/` - Test files

### CLI Package

**Location**: `omniscript-core/cli/`

**Development**:

```bash
cd omniscript-core/cli

# Build
pnpm build

# Test
pnpm test

# Run locally
node dist/osf.js parse example.osf
```

**Key Files**:

- `src/osf.ts` - CLI implementation
- `tests/` - Test files

---

## 🧩 Adding New Features

### Adding a New Block Type

1. **Update Types** (`parser/src/types.ts`):

```typescript
export interface MyNewBlock {
  type: 'mynew';
  property1: string;
  property2: number;
}

export type OSFBlock = MetaBlock | DocBlock | ... | MyNewBlock;
```

2. **Update Parser** (`parser/src/parser.ts`):

```typescript
case 'mynew': {
  const props = parseKV(b.content);
  const myNew: MyNewBlock = {
    type: 'mynew',
    property1: props.property1 as string,
    property2: props.property2 as number
  };
  return myNew;
}
```

3. **Update Serializer** (`parser/src/parser.ts`):

```typescript
case 'mynew': {
  const block = b as MyNewBlock;
  return `@mynew {
  property1: "${block.property1}";
  property2: ${block.property2};
}`;
}
```

4. **Update Converters**: Add rendering logic in `pdf.ts`, `docx.ts`, `pptx.ts`,
   `xlsx.ts`

5. **Add Tests**:

```typescript
it('parses @mynew block', () => {
  const osf = '@mynew { property1: "test"; property2: 42; }';
  const doc = parse(osf);
  expect(doc.blocks[0].type).toBe('mynew');
});
```

### Adding a New Converter

1. **Create Converter** (`converters/src/myformat.ts`):

```typescript
export class MyFormatConverter {
  async convert(doc: OSFDocument): Promise<ConversionResult> {
    // Implementation
  }
}
```

2. **Export** (`converters/src/index.ts`):

```typescript
export { MyFormatConverter } from './myformat';
```

3. **Add Tests** (`converters/tests/myformat.test.ts`)

4. **Update CLI** to support new format

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test --recursive

# Run specific package tests
cd omniscript-core/parser && pnpm test

# Run specific test file
pnpm test parser.test.ts

# Run in watch mode
pnpm test --watch

# Run with coverage
pnpm test --coverage
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration

# Run end-to-end tests
pnpm test:e2e
```

### Writing Tests

Use Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser';

describe('Parser', () => {
  it('parses @doc block', () => {
    const osf = '@doc { # Hello }';
    const doc = parse(osf);
    expect(doc.blocks[0].type).toBe('doc');
  });
});
```

---

## 🔍 Debugging

### Debug Parser

```typescript
// Add console.log in parser
console.log('Parsing block:', blockType);
console.log('Properties:', props);
```

### Debug Converters

```typescript
// Enable debug mode
const converter = new PDFConverter();
converter.setDebug(true);
```

### Debug CLI

```bash
# Add --verbose flag
node dist/osf.js parse example.osf --verbose

# Use Node debugger
node --inspect dist/osf.js parse example.osf
```

---

## 🎨 Code Style

### TypeScript

- Use strict mode
- No implicit `any`
- Use explicit return types
- Use interfaces over types

```typescript
// Good
function parse(input: string): OSFDocument {
  // ...
}

// Bad
function parse(input) {
  // ...
}
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Comments

```typescript
/**
 * Parses OSF string into document AST
 * @param input - OSF string
 * @returns Parsed document
 */
export function parse(input: string): OSFDocument {
  // Implementation
}
```

---

## 📝 Documentation

### Code Documentation

Use JSDoc comments:

```typescript
/**
 * Converts OSF document to PDF
 * @param doc - OSF document
 * @param options - Conversion options
 * @returns PDF buffer and metadata
 */
async convert(doc: OSFDocument, options?: ConversionOptions): Promise<ConversionResult>
```

### README Updates

When adding features:

1. Update main README.md
2. Update package README.md
3. Add examples
4. Update specification

---

## 🚢 Release Process

### 1. Version Bump

```bash
cd omniscript-core/parser
npm version patch  # or minor, major
```

### 2. Update CHANGELOG

Add changes to `CHANGELOG.md`:

```markdown
## [1.0.1] - 2025-10-20

### Fixed

- Fix parser edge case

### Added

- Add new feature
```

### 3. Build

```bash
pnpm build --recursive
```

### 4. Test

```bash
pnpm test --recursive
```

### 5. Publish

```bash
# Login to npm (if not already)
npm login

# Publish packages in order
cd omniscript-core/parser && npm publish
cd ../../omniscript-converters && npm publish
cd ../omniscript-core/cli && npm publish
```

### 6. Tag Release

```bash
git tag v1.0.1
git push origin v1.0.1
```

### 7. Create GitHub Release

1. Go to GitHub releases
2. Create new release from tag
3. Add release notes
4. Publish

---

## 🐛 Troubleshooting

### Build Errors

**Problem**: TypeScript compilation errors

**Solution**:

```bash
# Clean and rebuild
rm -rf dist
pnpm build
```

### Test Failures

**Problem**: Tests failing after changes

**Solution**:

```bash
# Run tests with verbose output
pnpm test --verbose

# Run specific failing test
pnpm test failing-test.test.ts
```

### Dependency Issues

**Problem**: Dependency resolution errors

**Solution**:

```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Puppeteer Issues

**Problem**: Chrome not found for PDF generation

**Solution**:

```bash
# Install Chrome
npx puppeteer browsers install chrome
```

---

## 🔧 Tools

### Essential Tools

- **VSCode** - Recommended editor
- **pnpm** - Package manager
- **Vitest** - Testing framework
- **TypeScript** - Language

### VSCode Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- vitest

### Recommended VSCode Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 📊 Project Stats

### Lines of Code

| Package    | TypeScript | Tests     | Total      |
| ---------- | ---------- | --------- | ---------- |
| Parser     | 1,200      | 800       | 2,000      |
| Converters | 4,500      | 2,800     | 7,300      |
| CLI        | 900        | 600       | 1,500      |
| **Total**  | **6,600**  | **4,200** | **10,800** |

### Dependencies

| Package    | Runtime | Dev | Total |
| ---------- | ------- | --- | ----- |
| Parser     | 0       | 5   | 5     |
| Converters | 6       | 5   | 11    |
| CLI        | 4       | 4   | 8     |

---

## 🤝 Contributing

See [CONTRIBUTING.md](../omniscript-core/CONTRIBUTING.md) for:

- Code of conduct
- Pull request process
- Coding standards
- Review process

---

## 📞 Support

### Getting Help

- **Documentation**: https://omniscript.dev/docs
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas

### Contact

- **Email**: support@omniscript.dev
- **GitHub**: @OmniScriptOSF
- **Twitter**: @OmniScriptOSF

---

**Last Updated**: October 15, 2025  
**Maintained By**: OmniScript Development Team
