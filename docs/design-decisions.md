# Design Decisions

This project follows the OSF v0.5 specification located under `spec/v0.5`. The
core blocks – `@meta`, `@doc`, `@slide` and `@sheet` – are implemented as
described in that release.

- **Parser simplicity** – The reference parser mirrors the grammar in
  `spec/v0.5/grammar.ebnf` to keep implementations easy to understand.
- **JSON Schema** – The AST produced by the parser conforms to
  `spec/v0.5/osf.schema.json` which allows tooling in any language to validate
  documents.
- **Incremental roadmap** – Features beyond v0.5 are tracked in
  `spec/roadmap.md`. Contributions should aim to match the spec before proposing
  extensions.
