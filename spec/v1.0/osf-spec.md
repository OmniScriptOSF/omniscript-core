# OmniScript Format (OSF) Specification v1.0

**Status**: Release Candidate  
**Date**: October 15, 2025  
**Authors**: OmniScript Core Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Syntax Overview](#syntax-overview)
4. [Block Types](#block-types)
5. [Data Types](#data-types)
6. [Reserved Keywords](#reserved-keywords)
7. [Version History](#version-history)

---

## 1. Introduction

OmniScript Format (OSF) is a universal document specification language that
unifies documents, presentations, and spreadsheets into a single plain-text
format optimized for version control and AI collaboration.

### 1.1 Goals

- **Git-native**: Plain text format with meaningful diffs
- **AI-friendly**: Structured syntax that LLMs can parse and generate
- **Multi-format**: Single source that exports to PDF, DOCX, PPTX, XLSX
- **Human-readable**: Clear, intuitive syntax that developers can write directly

### 1.2 Use Cases

- Technical documentation
- Business reports combining narrative, slides, and data
- Academic papers with calculations
- API documentation
- Product specifications
- Training materials

---

## 2. Design Principles

### 2.1 Block-Based Structure

Documents are composed of typed blocks (e.g., `@meta`, `@doc`, `@slide`). Each
block has:

- A **type** identifier (e.g., `@doc`)
- Optional **properties** (key-value pairs)
- Optional **content** (markdown, data, or structured elements)

### 2.2 Progressive Enhancement

Blocks degrade gracefully. If a renderer doesn't support `@diagram`, it can
display as preformatted text or skip it.

### 2.3 Separation of Content and Presentation

Content is semantic. Themes control visual presentation.

---

## 3. Syntax Overview

### 3.1 Comments

```osf
// Single-line comment

/*
   Multi-line comment
   Can span multiple lines
*/
```

### 3.2 Block Structure

```osf
@blocktype {
  property: value;
  another_property: "string value";

  Content goes here if applicable
}
```

### 3.3 Properties

Properties are key-value pairs ending with semicolons:

```osf
title: "Document Title";
author: "John Doe";
date: "2025-10-15";
theme: corporate;
```

**Property Types**:

- **String**: `"quoted text"`
- **Number**: `42`, `3.14`
- **Boolean**: `true`, `false`
- **Identifier**: `corporate` (unquoted keyword)
- **Array**: `[A, B, C]`
- **Object**: `{ key: value; }`

---

## 4. Block Types

### 4.1 @meta Block

**Purpose**: Document-level metadata

**Properties**:

- `title` (string): Document title
- `author` (string): Author name
- `date` (string): ISO 8601 date or human-readable
- `version` (string): Document version
- `theme` (identifier): Visual theme name

**Example**:

```osf
@meta {
  title: "Q3 Business Review";
  author: "Alice Smith";
  date: "2025-10-15";
  version: "1.0";
  theme: corporate;
}
```

**Cardinality**: 0 or 1 per document  
**Content**: None (properties only)

---

### 4.2 @doc Block

**Purpose**: Markdown-formatted document content

**Properties**:

- `title` (string, optional): Section title

**Content**: Markdown text with support for:

- Headings (`#`, `##`, `###`, etc.)
- Bold (`**text**`), Italic (`*text*`)
- Inline code (`` `code` ``)
- Lists (unordered `-`, ordered `1.`)
- Links, images, tables (future)

**Example**:

```osf
@doc {
  # Introduction

  This document demonstrates **bold** and *italic* text.

  - Item 1
  - Item 2

  ## Code Example

  Use `console.log()` to print output.
}
```

**Cardinality**: 0 or more per document  
**Content**: Markdown text

---

### 4.3 @slide Block

**Purpose**: Presentation slide

**Properties**:

- `title` (string): Slide title
- `layout` (identifier): Layout type
  - `TitleOnly`: Title with no content area
  - `TitleAndContent`: Title + content region
  - `TwoColumn`: Title + two side-by-side columns
  - `ThreeColumn`: Title + three columns

**Content**: Markdown text, rendered according to layout

**Example**:

```osf
@slide {
  title: "Key Features";
  layout: TitleAndContent;

  - Feature 1: Fast performance
  - Feature 2: Easy to use
  - Feature 3: Secure by default
}
```

**Cardinality**: 0 or more per document  
**Content**: Markdown text

---

### 4.4 @sheet Block

**Purpose**: Spreadsheet data with formulas

**Properties**:

- `name` (string): Sheet name (for multi-sheet exports)
- `cols` (array, optional): Column headers

**Content**: Cell assignments and formulas

**Cell Reference Syntax**:

- `A1 = value`: Assign value to cell
- `A1 = "text"`: String value
- `A1 = 42`: Numeric value
- `A1 = =B1+C1`: Formula (prefix with `=`)

**Formula Support**:

- Arithmetic: `+`, `-`, `*`, `/`, `^`
- Cell references: `A1`, `B2:B10`
- Functions: `SUM()`, `AVERAGE()`, `COUNT()`, `MAX()`, `MIN()`, `IF()`

**Example**:

```osf
@sheet {
  name: "Budget";
  cols: [Item, Cost, Quantity, Total];

  A1 = "Item";
  B1 = "Cost";
  C1 = "Quantity";
  D1 = "Total";

  A2 = "Widget";
  B2 = 100;
  C2 = 5;
  D2 = =B2*C2;

  A3 = "Total";
  D3 = =SUM(D2:D2);
}
```

**Cardinality**: 0 or more per document  
**Content**: Cell assignments

---

### 4.5 @chart Block (v1.0 NEW)

**Purpose**: Data visualization

**Properties**:

- `type` (identifier): Chart type
  - `bar`: Bar chart
  - `line`: Line chart
  - `pie`: Pie chart
  - `scatter`: Scatter plot
  - `area`: Area chart
- `title` (string): Chart title
- `data` (array): Data series
  - Each series: `{ label: string; values: number[]; }`
- `options` (object, optional): Configuration
  - `xAxis` (string): X-axis label
  - `yAxis` (string): Y-axis label
  - `legend` (boolean): Show legend (default: true)
  - `colors` (array): Color palette

**Example**:

```osf
@chart {
  type: "bar";
  title: "Sales by Quarter";
  data: [
    { label: "Q1"; values: [100, 150, 200]; },
    { label: "Q2"; values: [120, 180, 220]; }
  ];
  options: {
    xAxis: "Product Category";
    yAxis: "Revenue ($K)";
    legend: true;
  };
}
```

**Rendering**:

- **PDF/DOCX**: Embedded image (PNG/SVG)
- **PPTX**: Native chart object
- **XLSX**: Excel chart object
- **HTML**: Interactive Chart.js visualization

**Cardinality**: 0 or more per document  
**Content**: None (properties only)

---

### 4.6 @diagram Block (v1.0 NEW)

**Purpose**: Flowcharts, sequence diagrams, architecture diagrams

**Properties**:

- `type` (identifier): Diagram type
  - `flowchart`: Flowchart with boxes and arrows
  - `sequence`: UML sequence diagram
  - `gantt`: Project timeline
  - `mindmap`: Mind map
- `engine` (identifier): Rendering engine
  - `mermaid`: Mermaid.js syntax (default)
  - `graphviz`: DOT language syntax
- `code` (string): Diagram definition in engine syntax

**Example (Mermaid)**:

```osf
@diagram {
  type: "flowchart";
  engine: "mermaid";
  code: "
    graph TD
      A[Start] --> B{Decision}
      B -->|Yes| C[Action 1]
      B -->|No| D[Action 2]
      C --> E[End]
      D --> E
  ";
}
```

**Example (Sequence)**:

```osf
@diagram {
  type: "sequence";
  engine: "mermaid";
  code: "
    sequenceDiagram
      Client->>Server: Request
      Server->>Database: Query
      Database-->>Server: Result
      Server-->>Client: Response
  ";
}
```

**Rendering**:

- **PDF/DOCX**: Rendered image (SVG or PNG)
- **PPTX**: Embedded image
- **HTML**: Interactive SVG with zoom/pan

**Cardinality**: 0 or more per document  
**Content**: None (properties only)

---

### 4.7 @code Block (v1.0 NEW)

**Purpose**: Syntax-highlighted code listings

**Properties**:

- `language` (identifier): Programming language
  - Common: `javascript`, `typescript`, `python`, `java`, `go`, `rust`, `sql`
  - Auto-detect: `auto` (attempts detection from code)
- `caption` (string, optional): Code block caption
- `lineNumbers` (boolean, optional): Show line numbers (default: false)
- `highlight` (array, optional): Line numbers to highlight
- `code` (string): Source code

**Example**:

```osf
@code {
  language: "typescript";
  caption: "User Authentication Function";
  lineNumbers: true;
  highlight: [3, 7, 8];
  code: "
    async function authenticateUser(username: string, password: string) {
      const user = await db.users.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new Error('Invalid password');
      }

      return generateToken(user);
    }
  ";
}
```

**Rendering**:

- **PDF/DOCX**: Syntax-highlighted preformatted text
- **PPTX**: Monospace font with color coding
- **HTML**: Full syntax highlighting with Shiki/Prism

**Cardinality**: 0 or more per document  
**Content**: None (properties only, code in `code` property)

---

## 5. Data Types

### 5.1 String

Quoted text with escape sequences:

```osf
title: "Hello, World!";
message: "Line 1\nLine 2";
path: "C:\\Users\\John";
```

**Escape Sequences**:

- `\n`: Newline
- `\t`: Tab
- `\"`: Quote
- `\\`: Backslash

### 5.2 Number

Integer or floating-point:

```osf
count: 42;
price: 19.99;
ratio: 0.5;
scientific: 1.5e10;
```

### 5.3 Boolean

```osf
enabled: true;
visible: false;
```

### 5.4 Identifier

Unquoted keyword (no spaces):

```osf
theme: corporate;
layout: TitleAndContent;
type: bar;
```

### 5.5 Array

Comma-separated values in brackets:

```osf
cols: [A, B, C, D];
colors: ["#FF0000", "#00FF00", "#0000FF"];
highlight: [3, 5, 7];
```

### 5.6 Object

Key-value pairs in braces:

```osf
options: {
  xAxis: "Time";
  yAxis: "Revenue";
  legend: true;
};
```

---

## 6. Reserved Keywords

### 6.1 Block Types

- `@meta`
- `@doc`
- `@slide`
- `@sheet`
- `@chart`
- `@diagram`
- `@code`

### 6.2 Layout Types

- `TitleOnly`
- `TitleAndContent`
- `TwoColumn`
- `ThreeColumn`

### 6.3 Chart Types

- `bar`
- `line`
- `pie`
- `scatter`
- `area`

### 6.4 Diagram Types

- `flowchart`
- `sequence`
- `gantt`
- `mindmap`

### 6.5 Boolean Values

- `true`
- `false`

### 6.6 Theme Names

Themes are implementation-defined. Standard themes:

- `default`
- `minimal`
- `corporate`
- `academic`
- `creative`
- `technical`
- `retro`
- `modern`
- `elegant`
- `bold`

---

## 7. Version History

### v1.0 (October 2025)

- Added `@chart` block for data visualization
- Added `@diagram` block for flowcharts and diagrams
- Added `@code` block for syntax-highlighted code
- Formalized property type system
- Added object and array data types
- Complete specification document

### v0.5 (October 2025)

- Initial public release
- `@meta`, `@doc`, `@slide`, `@sheet` blocks
- Basic markdown support
- Spreadsheet formulas
- Theme system
- Multi-format export (PDF, DOCX, PPTX, XLSX)

---

## 8. Grammar (EBNF)

```ebnf
(* OSF Grammar v1.0 *)

document = { block } ;

block = meta_block
      | doc_block
      | slide_block
      | sheet_block
      | chart_block
      | diagram_block
      | code_block
      ;

meta_block = "@meta", "{", { property }, "}" ;
doc_block = "@doc", "{", [ property ], markdown_content, "}" ;
slide_block = "@slide", "{", { property }, [ markdown_content ], "}" ;
sheet_block = "@sheet", "{", { property }, { cell_assignment }, "}" ;
chart_block = "@chart", "{", { property }, "}" ;
diagram_block = "@diagram", "{", { property }, "}" ;
code_block = "@code", "{", { property }, "}" ;

property = identifier, ":", value, ";" ;

value = string
      | number
      | boolean
      | identifier
      | array
      | object
      ;

string = '"', { character }, '"' ;
number = [ "-" ], digit, { digit }, [ ".", digit, { digit } ] ;
boolean = "true" | "false" ;
identifier = letter, { letter | digit | "_" } ;
array = "[", [ value, { ",", value } ], "]" ;
object = "{", { property }, "}" ;

cell_assignment = cell_ref, "=", ( value | formula ) ;
cell_ref = column, row ;
column = letter, [ letter ] ;
row = digit, { digit } ;
formula = "=", expression ;

markdown_content = { text | formatting | list | heading } ;

(* Terminals *)
letter = "A" | "B" | ... | "Z" | "a" | "b" | ... | "z" ;
digit = "0" | "1" | ... | "9" ;
character = ? any Unicode character ? ;
```

---

## 9. Best Practices

### 9.1 File Organization

- One `.osf` file per logical document
- Use meaningful filenames: `q3-business-review.osf`
- Include `@meta` block at the top
- Group related blocks together

### 9.2 Commit Messages

When committing `.osf` files to version control:

```
feat: Add Q3 financial projections to business review
fix: Correct revenue formula in budget sheet
docs: Update product roadmap slides
```

### 9.3 Property Naming

- Use `snake_case` for custom properties
- Keep property names concise but descriptive
- Document custom properties in comments

### 9.4 Content Guidelines

- Keep `@doc` blocks focused on one topic
- Limit slides to 5-7 bullet points
- Use formulas instead of hardcoded values in sheets
- Add captions to charts and diagrams for accessibility

### 9.5 Performance

- Split large documents (>10,000 lines) into multiple files
- Use selective rendering for faster previews
- Cache parsed AST for repeated renders

---

## 10. Migration from v0.5

### Breaking Changes

None. v1.0 is fully backward compatible with v0.5.

### New Features

All new features (`@chart`, `@diagram`, `@code`) are additive. Existing
documents continue to work.

### Recommended Updates

1. Add explicit `version: "1.0"` to `@meta` blocks
2. Convert manual chart descriptions to `@chart` blocks
3. Replace ASCII diagrams with `@diagram` blocks
4. Use `@code` blocks instead of markdown code fences for better syntax
   highlighting

---

## 11. Implementation Notes

### 11.1 Parser Requirements

- Must handle comments (single-line and multi-line)
- Must validate block types and properties
- Should provide helpful error messages with line numbers
- Should support streaming for large files

### 11.2 Converter Requirements

- Must handle missing optional properties gracefully
- Should degrade unsupported blocks (e.g., old renderers ignore `@chart`)
- Must maintain data integrity in round-trip conversions
- Should optimize output file size

### 11.3 Security Considerations

- Sanitize markdown to prevent XSS in HTML output
- Validate formula expressions before evaluation
- Limit recursion depth in formulas
- Sandbox diagram rendering engines
- Escape code in syntax highlighting

---

## 12. Extensions

### 12.1 Custom Block Types

Implementations may add custom blocks prefixed with `@x-`:

```osf
@x-video {
  url: "https://example.com/video.mp4";
  autoplay: false;
}
```

Custom blocks should be ignored by standard parsers.

### 12.2 Custom Properties

Implementations may add custom properties prefixed with `x-`:

```osf
@meta {
  title: "My Document";
  x-company: "Acme Corp";
  x-confidential: true;
}
```

---

## 13. References

- Markdown Specification: CommonMark 0.30
- Mermaid.js Documentation: https://mermaid.js.org
- Chart.js Documentation: https://www.chartjs.org
- Excel Formula Reference: Microsoft Office documentation

---

## Appendix A: Complete Example

```osf
@meta {
  title: "OmniScript v1.0 Demo";
  author: "OmniScript Team";
  date: "2025-10-15";
  version: "1.0";
  theme: modern;
}

@doc {
  # Introduction

  This document demonstrates all v1.0 features.
}

@slide {
  title: "Key Features";
  layout: TitleAndContent;

  - Charts and data visualization
  - Diagrams and flowcharts
  - Syntax-highlighted code
}

@chart {
  type: "bar";
  title: "Quarterly Revenue";
  data: [
    { label: "Q1"; values: [100]; },
    { label: "Q2"; values: [150]; },
    { label: "Q3"; values: [200]; }
  ];
}

@diagram {
  type: "flowchart";
  engine: "mermaid";
  code: "
    graph LR
      A[Start] --> B[Process]
      B --> C[End]
  ";
}

@code {
  language: "javascript";
  caption: "Hello World";
  lineNumbers: true;
  code: "
    console.log('Hello, World!');
  ";
}

@sheet {
  name: "Data";
  cols: [Item, Value];

  A1 = "Item";
  B1 = "Value";
  A2 = "Total";
  B2 = =SUM(B3:B5);
  A3 = "A";
  B3 = 10;
  A4 = "B";
  B4 = 20;
  A5 = "C";
  B5 = 30;
}
```

---

**End of OmniScript Format Specification v1.0**

_© 2025 OmniScript OSF. Licensed under MIT._
