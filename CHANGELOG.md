# Changelog

All notable changes to the OmniScript OSF project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive CI/CD pipeline with GitHub Actions
  - Multi-platform testing (Linux, macOS, Windows)
  - Node.js compatibility testing (18.x, 20.x, 22.x)
  - Code quality checks (linting, formatting, type checking)
  - Security scanning (CodeQL, Snyk)
  - Automated dependency updates
  - Test coverage reporting
- GitHub issue templates for bugs, features, and questions
- Pull request template with comprehensive checklist
- Enhanced CONTRIBUTING.md with detailed development guidelines
- NPM publishing configuration for all packages
- `.npmignore` files for better package control

### Changed
- Enhanced package.json metadata for better NPM discoverability
- Added `publishConfig` to all packages
- Added `exports` field for modern Node.js compatibility
- Updated package descriptions with more detail

### Improved
- Documentation structure and organization
- Contribution workflow clarity
- Package metadata and keywords

## [0.5.7] - 2025-01-XX

### Fixed
- CLI version number alignment

## [0.5.6] - 2025-01-XX

### Added
- Working PDF, DOCX, XLSX converters
- Comprehensive test suite with Vitest
- Modern tooling (ESLint 9, Prettier 3, TypeScript 5.8)
- Parser with full OSF v0.5 support

### Changed
- Migrated to pnpm workspace
- Updated all dependencies to latest versions

## [0.5.0] - 2024-XX-XX

### Added
- Initial release
- Core parser implementation
- CLI tools (parse, lint, format, render, export, diff)
- Basic converter stubs
- OSF v0.5 specification

---

## Release Guidelines

### Version Numbering

- **Major (x.0.0)**: Breaking changes to the OSF spec or API
- **Minor (0.x.0)**: New features, backward-compatible
- **Patch (0.0.x)**: Bug fixes, documentation updates

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
- **Improved**: Performance or quality improvements

---

[Unreleased]: https://github.com/OmniScriptOSF/omniscript-core/compare/v0.5.7...HEAD
[0.5.7]: https://github.com/OmniScriptOSF/omniscript-core/compare/v0.5.6...v0.5.7
[0.5.6]: https://github.com/OmniScriptOSF/omniscript-core/compare/v0.5.0...v0.5.6
[0.5.0]: https://github.com/OmniScriptOSF/omniscript-core/releases/tag/v0.5.0
