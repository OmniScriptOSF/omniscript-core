# OmniScript Core

🚀 **OmniScript Format (OSF)** — *the universal document DSL for LLMs, agentic AI, and Git-native workflows.*

OmniScript Format (OSF) unifies the strengths of:

* **Markdown / LaTeX**: expressive prose, math, and structure
* **DOCX / PPTX**: rich styles, layouts, transitions, shapes
* **XLSX / YAML / JSON**: data tables, live formulas, charts

`omniscript-core` provides the formal specification, parser, serializer, and reference CLI tooling for OSF.

---

## 🌟 Key Features

✅ **Single plain-text source of truth** for docs, slides, sheets — `.osf` files interleave prose, slides, and data tables seamlessly.

✅ **LLM- and agentic-tool friendly syntax** — block-based structure with clear `@` markers (e.g. `@doc`, `@slide`, `@sheet`).

✅ **Rich styling & structure** — support for themes, transitions, shapes, SmartArt, charts, and formulas.

✅ **Live formula evaluation** — OSF viewers and tooling compute spreadsheet formulas and update charts at runtime.

✅ **Round-trip compatibility** — export to and import from `.docx`, `.pptx`, `.xlsx`, Markdown, LaTeX, JSON/YAML.

✅ **Git-native diff & merge** — meaningful, human-readable text changes.

---

## 📂 Project Structure

```
omniscript-core/
 ├── spec/           # Grammar, JSON schema, OpenAPI spec
 ├── parser/         # Reference parser code
 ├── cli/            # CLI tooling (parse, lint, render, diff)
 ├── examples/       # Example .osf documents
 ├── tests/          # Unit + integration tests
 ├── README.md
 ├── LICENSE
 ├── CONTRIBUTING.md
 └── CODE_OF_CONDUCT.md
```

---

## ⚡ Quick Example

### OSF file excerpt:

```osf
@meta {
  title   : "Q2 Business Review";
  author  : "Alice";
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

---

## 🚀 Planned CLI Features

* `osf parse <file>` → Parse and validate OSF file syntax.
* `osf lint <file>` → Style and structure checks.
* `osf render <file> --format <html|pdf|docx|pptx|xlsx>` → Render to desired output.
* `osf diff <file1> <file2>` → Semantic diff of two OSF files.

---

## 🤝 Contributing

We welcome contributions!

➡ Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

➡ All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🌐 Resources (coming soon)

* Project website & docs
* Interactive OSF viewer
* Conversion tools
* Example repository

---

## 💡 Vision

OmniScript Format (OSF) aims to be the universal document source language — a single plain-text format powering documents, presentations, and data tables in a world of AI collaboration and versioned knowledge.
