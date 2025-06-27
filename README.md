# OmniScript Core

🚀 **OmniScript Format (OSF)** — _the universal document DSL for LLMs, agentic
AI, and Git-native workflows._

OmniScript Format (OSF) unifies the strengths of:

- **Markdown / LaTeX**: expressive prose, math, and structure
- **DOCX / PPTX**: rich styles, layouts, transitions, shapes
- **XLSX / YAML / JSON**: data tables, live formulas, charts

`omniscript-core` provides the formal specification, parser, serializer, and
reference CLI tooling for OSF. **Current version: v0.5.0.**

---

## 🌟 Key Features

✅ **Single plain-text source of truth** for docs, slides, sheets — `.osf` files
interleave prose, slides, and data tables seamlessly.

✅ **LLM- and agentic-tool friendly syntax** — block-based structure with clear
`@` markers (e.g. `@doc`, `@slide`, `@sheet`).

✅ **Rich styling & structure** — support for themes, transitions, shapes,
SmartArt, charts, and formulas.

✅ **Live formula evaluation** — OSF viewers and tooling compute spreadsheet
formulas and update charts at runtime.

✅ **Round-trip compatibility** — export to and import from `.docx`, `.pptx`,
`.xlsx`, Markdown, LaTeX, JSON/YAML.

✅ **Git-native diff & merge** — meaningful, human-readable text changes.

✅ **Extensible syntax** — designed for future support of diagrams, forms,
citations, references, macros.

✅ **LLM function-call ready** — OSF's schema can map cleanly to AI agent tools
for parsing, editing, or generating content.

---

## 📂 Project Structure

```
omniscript-core/
 ├── spec/               # Versioned specifications
 │   ├── v0.5/
 │   ├── v1.0/
 │   └── roadmap.md
 ├── parser/             # Reference parser
 ├── cli/                # CLI tools
 ├── examples/           # OSF sample documents (spec example + tests)
 ├── tests/              # Unit + integration tests
 ├── docs/               # Architecture and design docs
 ├── .github/            # GitHub configs
 └── package.json
```

See [docs/spec-v0.5-overview.md](docs/spec-v0.5-overview.md) for an introduction
to the draft specification.

---

## 🚀 Quick Example

```osf
@meta {
  title   : "Q2 Business Review";
  author  : "Alphin Tom";
  date    : "2025-06-07";
  theme   : "CorporateBlue";
}

@doc {
  # Executive Summary
  Revenue grew by **15\\%** in Q2.
}

@slide {
  title : "Q2 Highlights";
  layout : TitleAndBullets;
  bullets {
    "Revenue ↑ 15%";
    "Churn ↓ 3%";
  }
}

@sheet {
  name : "SalesData";
  cols : [Region, Q1, Q2, Growth%];
  data {
    (2,1)="North"; (2,2)=100000; (2,3)=115000;
  }
  formula (2,4): "=(C2-B2)/B2*100";
}
```

For a more complete example with multiple slides and a sheet, see
[`examples/rich_demo.osf`](examples/rich_demo.osf).

---

## 🛠 Getting Started

Ensure **Node.js 18+** is installed, then run:

```bash
npm install
npm run build
npm test
```

---

## 🚀 CLI Features

The reference CLI implements several spec-defined commands:

- `osf parse <file>` → Parse and validate OSF file syntax.
- `osf lint <file>` → Style and structure checks.
- `osf diff <file1> <file2>` → Semantic diff of two OSF files.
- `osf render <file> --format <html>` → Render to HTML output.
- `osf export <file> --target <md>` → Export OSF to Markdown.
- `osf format <file>` → Auto-format OSF for style consistency.

### Using the reference CLI

Follow these steps to build and run the CLI:

1. **Install dependencies** (required before running tests)

   ```bash
   npm install
   ```

   Installing will automatically run the build thanks to the `prepare` script.

2. **Compile the TypeScript sources** (if you need to rebuild manually)

   ```bash
   npm run build
   # or run the test suite which also triggers the build
   npm test
   ```

3. **Invoke the CLI from the compiled `dist` directory**

   For the full spec example:

   ```bash
   node cli/dist/osf.js parse examples/v0.5_spec_example.osf
   ```

   For a richer demo:

   ```bash
   node cli/dist/osf.js parse examples/rich_demo.osf
   ```

   Or to parse a minimal test file:

   ```bash
   node cli/dist/osf.js parse examples/test_minimal.osf
   ```

---

## 🤝 Contributing

We welcome contributions!

➡ Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

➡ All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

➡ Maintainer: **Alphin Tom** ([alpha912](https://github.com/alpha912))

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © 2025 Alphin Tom.

---

## 💬 Community

Join us on
[GitHub Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
to propose ideas, ask questions, or share feedback.

## 💡 Vision

OmniScript Format (OSF) aims to be the universal document source language — a
single plain-text format powering documents, presentations, and data tables in a
world of AI collaboration and versioned knowledge.

## ❗ Known Limitations (v0.5)

- The initial CLI only covers parsing, linting and basic rendering; advanced
  conversion targets are under development.
- Diagram blocks, citation syntax and macro support are planned for future
  revisions.
- Formal grammar and normative references are scheduled for a later appendix
  release.
