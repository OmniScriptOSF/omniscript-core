# OmniScript Format Specification

This directory contains the formal specification for the OmniScript Format
(OSF).

---

## 📄 Specification Versions

- **[v1.1/](v1.1/)** - Current stable specification (January 2025)
  - Strikethrough text support
  - Unicode escape sequences
  - Enhanced error reporting
- **[v1.0/](v1.0/)** - First stable release (October 2025)
  - @chart, @diagram, @code blocks
  - Complete feature set
- **[v0.5/](v0.5/)** - Initial release (October 2024)
  - Core block types
  - Basic syntax

---

## 🆕 What's New in v1.2?

v1.2 (October 2025) adds two major features but doesn't yet have a separate spec
document:

- **@table blocks** - Markdown-style tables with alignment and styling
- **@include directive** - Modular document composition

**Documentation**: See
[v1.2 Features Guide](https://omniscriptosf.github.io/docs/v1-2-features) and
[Release Notes](https://github.com/OmniScriptOSF/omniscript-core/blob/main/RELEASE_NOTES_v1.2.0.md)

---

## 📜 License

### Specification License: CC-BY-4.0

The OmniScript Format Specification documents in this directory are licensed
under the **Creative Commons Attribution 4.0 International License**
(CC-BY-4.0).

**You are free to**:

- Read and reference the specification
- Implement the specification in any programming language
- Create derivative specifications
- Use commercially

**You must**:

- Give appropriate credit to "OmniScript Format" and "Alphin Tom"
- Provide a link to https://creativecommons.org/licenses/by/4.0/

See [LICENSE](LICENSE) for full terms.

### Software License: MIT

**Important**: The specification itself is CC-BY-4.0, but:

- Software implementations (parser, CLI, converters) use **MIT License** (see
  root LICENSE)
- Example code in specifications is **MIT License**
- You can implement OSF in any software under any license

---

## 🔗 Resources

- **Latest Spec**: [v1.1/osf-spec.md](v1.1/osf-spec.md)
- **Roadmap**: [roadmap.md](roadmap.md)
- **Website**: https://omniscriptosf.github.io
- **Implementation**: https://github.com/OmniScriptOSF/omniscript-core

---

## 🤝 Contributing to the Specification

We welcome feedback and contributions to improve the specification!

### How to Contribute

1. **Discuss**: Open an issue or discussion about proposed changes
2. **Draft**: Write your proposed specification changes
3. **Review**: Submit a pull request for community review
4. **Consensus**: Specification changes require maintainer approval

### Specification Principles

- **Clarity**: Unambiguous and easy to understand
- **Completeness**: Sufficient for implementation
- **Compatibility**: Backward compatibility when possible
- **Simplicity**: Avoid unnecessary complexity

---

## 📖 Reading the Specification

### For Implementers

1. Start with [v1.1/osf-spec.md](v1.1/osf-spec.md) - current stable spec
2. Review
   [v1.2 features guide](https://omniscriptosf.github.io/docs/v1-2-features)
3. Check [CHANGELOG](v1.1/changelog.md) for recent changes
4. Refer to [examples](../examples/) for test cases

### For Users

1. See [Getting Started](https://omniscriptosf.github.io/docs/getting-started)
2. Browse
   [Examples Repository](https://github.com/OmniScriptOSF/omniscript-examples)
3. Try [Online Playground](https://omniscriptosf.github.io/playground)

---

## ⚖️ Why Two Licenses?

### Specification (CC-BY-4.0)

- **Purpose**: Allow anyone to read, reference, and implement
- **Allows**: Free implementation in any language/license
- **Requires**: Only attribution to the original spec
- **Standard**: Used by W3C, IETF, WHATWG for open standards

### Software (MIT)

- **Purpose**: Allow free use of our implementation
- **Allows**: Use, modify, distribute, commercial use
- **Requires**: Include copyright notice
- **Standard**: Popular for open source software

This dual-license approach:

- ✅ Keeps the specification open and implementable
- ✅ Allows competing implementations
- ✅ Permits commercial use
- ✅ Protects attribution
- ✅ Follows industry best practices

---

**Questions?** Open an issue or discussion on GitHub.
