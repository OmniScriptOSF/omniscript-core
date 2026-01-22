# Design Decisions

This project follows the OSF v1.2 specification located under `spec/v1.2`. The
core blocks – `@meta`, `@doc`, `@slide` and `@sheet` – are implemented as
described in that release, with v0.5 retained as a legacy reference.

- **Parser simplicity** – The reference parser mirrors the grammar in
  `spec/v1.2/grammar.ebnf` to keep implementations easy to understand.
- **JSON Schema** – The AST produced by the parser conforms to
  `spec/v1.2/osf.schema.json` which allows tooling in any language to validate
  documents.
- **Incremental roadmap** – Features beyond v1.2 are tracked in
  `spec/roadmap.md`. Contributions should aim to match the spec before proposing
  extensions.
