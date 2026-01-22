# Project Architecture

This repository hosts the reference implementation of **OmniScript Format
(OSF)**. The codebase is organised as a monorepo with separate packages for the
parser and CLI.

The `spec/` directory contains versioned specifications. The current release is
[spec/v1.2](../spec/v1.2/) which defines the grammar and JSON schema used by the
parser (with [v0.5](../spec/v0.5/) retained as legacy reference).

```
omniscript-core/
 ├── spec/       # Formal OSF specifications
 ├── parser/     # Reference parser and serializer
 ├── cli/        # Command line interface
 └── docs/       # Project and design documentation
```

Developers can run the parser directly or invoke the CLI for tasks like parsing,
linting and rendering OSF files. See the spec for a detailed description of each
block type (`@meta`, `@doc`, `@slide`, `@sheet`).
