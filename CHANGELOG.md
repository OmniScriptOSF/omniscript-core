# Changelog

All notable changes to the OmniScript OSF project will be documented in this
file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-01-16

### Added - Parser

- ✨ Strikethrough text support (`~~text~~`) in parseStyledText and
  serializeTextRun
- ✨ Unicode escape sequence support (`\uXXXX`, `\xXX`) in string serialization
- ✨ Line:column position tracking in all parser error messages
- 🐛 Unterminated string literal detection with clear error messages
- New `strike` property in StyledText interface

### Added - CLI

- ✨ Extended HTML rendering with ordered lists, blockquotes, code blocks,
  images, and links
- ✨ Enhanced Markdown export supporting ordered lists, blockquotes, code
  blocks, and images
- ✨ Full text styling support (bold, italic, underline, strikethrough) in HTML
  and Markdown
- 🔒 HTML escaping (XSS prevention) in all HTML output
- ✅ Circular formula reference detection test for improved test coverage

### Security

- 🔒 HTML output now escapes all user-provided content to prevent XSS attacks
- Input validation for unterminated strings prevents malformed parsing

### Improved

- Error messages now include precise line:column locations (e.g., "Error at
  5:12")
- renderTextRun() helper provides consistent text rendering across formats
- textRunToMarkdown() helper ensures proper Markdown formatting
- Better developer experience with enhanced debugging information

### Fixed

- Vitest config now excludes .git directory from test discovery
- ESLint warnings addressed for intentional control character handling

### Notes

- Fully backward compatible with v1.0.0
- No breaking changes
- All 56 tests passing (100% success rate)

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

[Unreleased]:
  https://github.com/OmniScriptOSF/omniscript-core/compare/v0.5.7...HEAD
[0.5.7]:
  https://github.com/OmniScriptOSF/omniscript-core/compare/v0.5.6...v0.5.7
[0.5.6]:
  https://github.com/OmniScriptOSF/omniscript-core/compare/v0.5.0...v0.5.6
[0.5.0]: https://github.com/OmniScriptOSF/omniscript-core/releases/tag/v0.5.0
