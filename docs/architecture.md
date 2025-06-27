# Project Architecture

This repository hosts the reference implementation of **OmniScript Format
(OSF)**. The codebase is organised as a monorepo with separate packages for the
parser and CLI.

The `spec/` directory contains versioned specifications. The current release is [spec/v0.5](../spec/v0.5/) which defines the grammar and JSON schema used by the parser.

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
