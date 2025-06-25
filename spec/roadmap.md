# OmniScript Format Roadmap

This roadmap highlights the short‑term milestones for the OSF project. It is
derived from the OSF v0.5 specification and focuses on delivering a minimal but
complete toolchain for authoring documents, slides and sheets in plain text.

## v1.0 Goals

- **Finalize core block syntax** – stable `@meta`, `@doc`, `@slide` and `@sheet`
  sections as described in [spec/v0.5/osf-spec.md](v0.5/osf-spec.md).
- **Reference parser** – ability to parse an `.osf` file into an AST matching
  the JSON schema.
- **Command line tooling** – `osf` CLI providing `parse`, `lint`, `diff` and
  `render` commands.
- **Round‑trip conversion** – lossless serialisation back to the text form.
- **Examples and documentation** – minimal examples demonstrating each block
  type.

## v1.1 Ideas

- Chart and diagram primitives for slides and sheets.
- Basic citation and cross‑reference syntax.
- Import/export helpers for Markdown, LaTeX and Office formats.

Community proposals are tracked in repository issues and the discussion forum.
