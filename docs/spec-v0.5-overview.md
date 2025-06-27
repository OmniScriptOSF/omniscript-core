# OSF v0.5 Overview

This document summarises the key elements of the OmniScript Format v0.5 specification.
Refer to the files under `spec/v0.5/` for the authoritative specification.

## Core Blocks

- `@meta` – document metadata such as `title`, `author`, `date` and `theme`.
- `@doc` – prose content written with Markdown-like syntax.
- `@slide` – slide definitions with properties like `title`, `layout` and
  optional `bullets`.
- `@sheet` – tabular data including column headers, cell assignments and
  formulas.

Each block follows the grammar defined in `spec/v0.5/grammar.ebnf` and maps to
the JSON Schema in `spec/v0.5/osf.schema.json`.

## Example

```osf
@meta {
  title: "Demo";
  author: "Test";
}

@doc {
  Hello World
}

@slide {
  title: "Intro";
  bullets {
    "First";
    "Second";
  }
}

@sheet {
  name: "Data";
  cols: [A, B];
  data {
    (2,1)=1;
    (2,2)=2;
  }
  formula (2,2): "=A1";
}
```
