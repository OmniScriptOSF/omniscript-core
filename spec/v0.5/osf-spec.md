# OmniScript Format (OSF) – v0.5 Specification

**OmniScript Format (OSF)** is a new domain-specific language (DSL) designed as
_“the universal document DSL for LLMs, agentic AI, and Git-native workflows.”_
It aims to unify the capabilities of text documents, presentations, and
spreadsheets into a single, plain-text format. This specification defines OSF’s
purpose, design principles, syntax, and how it relates to existing standards
like Markdown, LaTeX, JSON/YAML, and Office file formats. The goal is to make
OSF accessible to developers, document engineers, and standards bodies, while
ensuring it can be easily adopted in modern, AI-assisted and version-controlled
authoring workflows. **This draft corresponds to CLI/parser version 0.5.0.**

## Purpose and Scope

OSF is intended to be a **universal document source language** that merges the
strengths of multiple formats into one. Today’s document ecosystem is
fragmented: authors use **Markdown** or **LaTeX** for easy-to-write, text-based
content, or turn to binary **Office formats** (Word, PowerPoint, Excel) for rich
styling, layouts, and data-driven charts. Structured data and configuration are
often handled in **JSON** or **YAML**, which are praised for human-readability
in data serialization. Each format excels in its domain – for example, Markdown
is a _“lightweight markup language for creating formatted text using a
plain-text editor”_, and LaTeX markup focuses on content and structure separate
from presentation. However, no single format today smoothly spans **prose,
presentations, and data tables** together in a way that is both
**human-friendly** and **machine-friendly**.

**OmniScript Format’s purpose** is to fill that gap. An `.osf` document can
contain an entire report or knowledge asset: interleaving written chapters,
slide decks, and spreadsheet data in one text file. This single source can then
be transformed into multiple end-user formats (web pages, PDFs, `.docx` Word
documents, `.pptx` slideshows, `.xlsx` spreadsheets, etc.) without maintaining
separate files for each. By using plain text, OSF makes documents _diffable_ and
_version-controllable_, in contrast to binary office files – a critical feature
for collaboration and tracking changes in Git-based workflows. It is also being
designed with AI integration in mind: the structured yet natural syntax allows
large language models (LLMs) to easily parse and generate OSF content as part of
automated document generation or analysis tools.

In scope, OSF covers:

- **Text Documents** – chapters, sections, and rich text (analogous to
  Markdown/LaTeX or Word documents).
- **Slide Presentations** – slide definitions with titles, bullet points,
  images, and transitions (analogous to PowerPoint/Keynote decks).
- **Spreadsheets/Data Tables** – tabular data with formulas and charts
  (analogous to Excel/Sheets files).

All of these live together in a unified syntax. OSF is _not_ aiming to replace
programming notebooks or executable documents (its focus is documents and
presentations rather than code execution), and it leverages existing standards
(HTML/CSS, PDF, etc. via exporters) rather than defining a new rendering engine.
The scope also explicitly includes **round-trip compatibility** with existing
formats – meaning content authored in OSF can be exported to
Word/PowerPoint/Excel or LaTeX/Markdown, and ideally imported back, without
significant loss of fidelity.

## Design Principles

The design of OSF is guided by several core principles:

- **Single Source of Truth:** One plain-text `.osf` file contains the content
  for documents, slides, and sheets together. This eliminates divergent copies
  of the same content in separate formats and ensures consistency across
  different output mediums.

- **Human-Readable Markup:** The syntax is inspired by Markdown and LaTeX,
  emphasizing clarity and minimizing noise. Even before conversion, an OSF file
  should be relatively easy to read in raw form (much like Markdown is
  _“easy-to-read and easy-to-write”_ as plain text). Content is written in an
  intuitive style without excessive angle-bracket tags or binary gibberish.

- **Expressive Formatting and Layout:** OSF incorporates rich document features
  traditionally found in WYSIWYG editors. This includes styling (bold, italics,
  headings), layout structures (sections, columns, slide layouts), and support
  for visual elements like images, shapes, or transitions. It takes inspiration
  from LaTeX’s ability to handle structured documents and complex elements (e.g.
  figures, cross-references) in text form, and from Office formats’ support of
  design elements. For example, OSF will support presentation themes, slide
  transitions, and basic drawing shapes similar to those in `.pptx`.

- **Embedded Data and Computation:** Beyond text, OSF can represent data tables
  and perform computations. Borrowing ideas from spreadsheets, it allows
  defining cell data and formulas that can be **computed live** by OSF tooling.
  The syntax for tabular data is influenced by JSON/YAML for clarity in defining
  structured data (key-value pairs, lists). This ensures that numeric data and
  charts can live alongside narrative text, enabling data-driven reports in one
  file.

- **Interoperability and Standards Compliance:** OSF is built to **play well
  with existing standards** rather than replacing them outright. It can export
  to Markdown or LaTeX for integration with existing publishing pipelines, and
  to OpenDocument or Office Open XML formats for use in traditional office
  software. (Office Open XML, for instance, is the XML-based format behind
  `.docx/.xlsx/.pptx` files, and OpenDocument (ODF) similarly is an open
  XML-based format for text, spreadsheets, charts, etc..) By mapping OSF
  constructs to these standards, the format ensures information isn’t siloed.
  Authors can also import from those formats, easing migration to OSF.

- **AI and Automation Friendly:** OSF’s structure is unambiguous and easy to
  parse programmatically. Clear block demarcations (with `@` markers) and a
  possible JSON schema for the format mean that LLMs and other tools can
  reliably generate or edit OSF content. This principle acknowledges new use
  cases where AI agents dynamically compose documents – OSF acts as a lingua
  franca that both humans and machines can understand.

- **Version Control and Collaboration:** Being line-oriented and text-based, OSF
  files produce meaningful diffs when changes are made. Each logical section of
  a document (e.g. a slide, a chapter, a table row) can be diffed and merged
  with standard version control tools. This lowers the friction of collaborative
  editing and reviewing, addressing a common pain point with binary formats.

- **Extensibility and Evolvability:** The syntax is designed to accommodate
  future extensions without breaking compatibility. New block types or
  annotations (for example, a future `@diagram` block for drawings, or adding
  citation support for academic use) can be introduced in a forward-compatible
  way. The OSF specification will include reserved syntax for extensions and
  encourage a proposal process for new features. This principle ensures OSF can
  adapt and grow, incorporating community feedback and new requirements over
  time.

## Syntax Overview

An OSF file is a UTF-8 encoded plain text file typically with the extension
`.osf`. The content is divided into **blocks**, each starting with an `@keyword`
and containing a JSON/Markdown-like payload enclosed in braces `{ ... }`. The
general structure is:

- **Metadata Block (`@meta`)** – contains document metadata and global settings
  (similar to YAML front-matter or document properties).
- **Document Blocks (`@doc`)** – contain prose content (chapters, sections,
  paragraphs).
- **Slide Blocks (`@slide`)** – define slides for presentations.
- **Sheet Blocks (`@sheet`)** – define spreadsheet data, calculations, or
  charts.

These blocks can appear in any order, although typically a file begins with
`@meta`. Each block’s content follows a syntax tailored to its purpose, but all
are meant to be human-editable.

Below is a simplified example illustrating OSF syntax for a report with one
document section, one slide, and one sheet:

```osf
@meta {
  title: "Q2 Business Review";
  author: "Alphin Tom";
  date: "2025-06-07";
  theme: "CorporateBlue";
}

@doc {
  # Executive Summary
  Revenue grew by **15\\%** in Q2, exceeding targets and prior quarter performance.
  We continued to invest in customer success, resulting in higher retention.
}

@slide {
  title: "Q2 Highlights";
  layout: TitleAndBullets;
  bullets {
    "Revenue ↑ 15%";
    "Churn ↓ 3%";
  }
}

@sheet {
  name: "SalesData";
  cols: [Region, Q1, Q2, Growth%];
  data {
    (2,1) = "North";   (2,2) = 100000;   (2,3) = 115000;
    (3,1) = "South";   (3,2) =  80000;   (3,3) =  92000;
  }
  formula (2,4): "=(C2-B2)/B2*100";
  formula (3,4): "=(C3-B3)/B3*100";
}
```

**Figure:** _Example OSF content demonstrating metadata, a document section, a
slide, and a sheet with data and formulas._ (In this snippet, `\\%` is used to
include a literal percent sign in text, since `%` may be reserved for comments
or other semantics in OSF, similar to LaTeX conventions.)

Let’s break down the syntax rules and features shown:

- **Metadata (`@meta`)**: Key–value pairs define global properties. In the
  example, `title`, `author`, `date`, and `theme` are specified. This is similar
  to a YAML front matter or JSON object. Keys and string values are separated by
  `:`. The metadata can include settings like default slide theme or document
  language. (Themes such as `"CorporateBlue"` might correspond to a style
  template for slides and docs.)

- **Document content (`@doc`)**: Inside a `@doc` block, OSF supports
  Markdown-like markup for text formatting and structure. In the example,
  `# Executive Summary` denotes a heading. Inline formatting like `**15\%**`
  produces bold text (“15%”). Paragraphs are separated by blank lines or line
  breaks; lists, subheadings, images, etc., can all be represented with familiar
  Markdown syntax. OSF also plans to support **LaTeX math** notation within
  `@doc` blocks (e.g., using `$...$` for inline equations or `$$...$$` for
  display equations), enabling complex formulas and symbols in technical
  documents. The document blocks thus combine the readability of Markdown with
  the technical prowess of LaTeX (for example, authors can include equations,
  citations, or cross-references similar to LaTeX documents).

- **Slides (`@slide`)**: Each slide is one block. The slide in the example has a
  `title` field and a `layout`. Here, `TitleAndBullets` might correspond to a
  predefined slide layout (title plus bullet list). The `bullets { ... }`
  section contains a list of bullet points for the slide. OSF uses a concise
  syntax for slide content: one could also include `image` or `notes` fields in
  a slide. Slide text may permit limited formatting (bold, italics, maybe simple
  Markdown in bullets). The emphasis is on capturing the semantics of a slide
  (its title, bullet points, images, etc.) rather than free-flowing text. This
  block-based approach is _“clear `@` markers”_ for tools – for instance, an OSF
  parser knows everything between `@slide { ... }` pertains to one slide.

- **Sheets (`@sheet`)**: This block represents a spreadsheet or table. In
  `@sheet`, we have a `name` for the sheet (like a sheet tab name), a definition
  of columns, and a `data` section. The columns are listed as an array
  `[Region, Q1, Q2, Growth%]` – reflecting how JSON/YAML list syntax is reused.
  The `data` is given here by cell coordinates: e.g., `(2,1) = "North"` means
  row 2, column 1 has the text "North". (Row 1 might be the header row
  containing `Region, Q1, Q2, Growth%` as given by `cols`.) Numerical values are
  entered for Q1 and Q2. Then `formula (2,4): "=(C2-B2)/B2*100";` indicates that
  cell (2,4) (row 2, 4th column – Growth%) is calculated by the formula
  `=(C2-B2)/B2*100`. The formula syntax in quotes is intentionally similar to
  Excel’s formula language, including cell references like `C2` and `B2`. By
  specifying formulas, OSF can capture dynamic calculations; OSF viewers or
  tools are expected to evaluate these formulas so that derived values (like
  Growth% = 15% for North) can be rendered or updated live. This gives OSF
  documents the power of spreadsheets embedded in text form.

- **Styling and Theming**: Rather than inline styling (as in HTML), OSF leans on
  higher-level styling rules. The `theme` specified in `@meta` might define
  colors, fonts, and default styles for slides and document elements. OSF’s core
  syntax includes support for specifying styles and transitions in a
  presentation context (for example, one could imagine a `transition: Fade`
  property on a slide, or shape definitions for diagrams). These stylistic
  features align OSF with what `.pptx/.docx` can do, but configured in text. The
  exact syntax for theme or style customization could involve additional blocks
  or references to style files, which will be elaborated in the complete spec
  (and is a likely topic for future appendices or extensions).

- **Comments**: OSF will allow comments in the source which are ignored by the
  parser. These might be initiated by a special character (possibly `%` or
  `//`), similar to how LaTeX treats `%` as a comment or how many config formats
  allow `#`. The exact comment syntax will be defined in the grammar (e.g.,
  lines starting with `//` are comments).

**Parsing and Formal Grammar:** Each OSF file can be formally parsed into an
abstract syntax tree. The notation of `@keyword { ... }` blocks ensures a
deterministic structure. While this document doesn’t include the full grammar
rules, the OSF repository contains a grammar and JSON Schema defining the
allowed syntax and data types for each section. (For example, it specifies that
`@meta` may contain string or date fields, `@slide` may contain certain keys
like `title` (string) and `bullets` (list of strings), `@sheet` may contain
`cols` (list of identifiers) and `data` (table entries), etc.) This formal
definition will be included as an appendix when the specification is finalized.

## Compatibility and Comparisons to Existing Formats

One of OSF’s design goals is to **blend the familiar features** of existing
document formats while mitigating their weaknesses. Below, we outline how OSF
compares to and interacts with some key formats and standards:

### Markdown and LaTeX (Text Documents)

**Markdown** is widely used for README files, documentation, and static site
generators because it’s simple and **readable as plain text**. OSF adopts
Markdown’s philosophy for its document sections – authors can write headings,
lists, and emphasis in an intuitive way. In fact, an `@doc` block in OSF can be
seen as a superset of Markdown: most Markdown syntax should be valid inside
`@doc`. OSF extends it with features like embedded spreadsheets or
cross-references that plain Markdown lacks. The benefit is that Markdown users
can quickly pick up OSF for writing prose.

**LaTeX** is the de facto standard for scientific and technical documents,
offering precise control over layout, mathematical notation, and references. OSF
draws inspiration from LaTeX’s ability to handle **complex content via markup**.
For instance, OSF will allow mathematical equations using LaTeX syntax (enclosed
in `$` or `$$`) so that academic papers or reports with formulas can be authored
in OSF. Like LaTeX, OSF distinguishes content from presentation – you describe
the structure and meaning (e.g., “this is a title slide” or “this text is a
heading”), and the formatting (fonts, alignment, theme colors) can be applied
uniformly by the rendering tool or style settings. Unlike LaTeX, OSF aims to be
easier to learn and use for non-technical authors; it avoids some of LaTeX’s
complexity by providing sensible defaults (e.g., built-in themes) and a simpler
syntax for common tasks. Nevertheless, advanced LaTeX users will find parallels,
and OSF’s future extensions may include a citation syntax or macro system
reminiscent of LaTeX’s capabilities.

**Conversion:** OSF documents can be converted to _pure Markdown_ or _LaTeX_ if
needed. For example, the `@doc` portions could become a Markdown `.md` file or a
`.tex` file. Some features that exist in OSF (like live formulas or slide
transitions) have no direct equivalent in basic Markdown/LaTeX; those would be
either dropped or converted to closest analogs (e.g., an OSF slide deck could be
converted into a LaTeX Beamer presentation). Ensuring that such transformations
are smooth is part of OSF’s commitment to interoperability.

### JSON and YAML (Data Representation)

OSF is not a general data serialization format, but it _incorporates_
JSON/YAML-like constructs to represent structured data within a document. This
design choice means developers and engineers find parts of OSF familiar. For
example, the metadata and sheet sections use key–value mappings and lists much
like a JSON or YAML document. In the `@sheet` example above, the syntax
resembles JSON with some sugar (allowing `(row,col)=value` for brevity). The
rationale is to leverage the readability of YAML (often touted as _“the most
human-readable data serialization format”_) and the ubiquity of JSON. Any valid
JSON could theoretically be embedded in an OSF block where structured data is
expected, since YAML is a superset of JSON.

By structuring data in OSF this way, it becomes straightforward to export
certain parts of OSF to JSON or YAML. For instance, one could extract the
`@meta` block and produce a JSON metadata file, or convert an `@sheet` to a CSV
or JSON data set. Conversely, data prepared in JSON/YAML could be
programmatically inserted into an OSF file. This synergy with JSON/YAML means
OSF can serve as a bridge between free-form documentation and structured data:
imagine an OSF document that contains an embedded dataset (as a sheet) which was
originally in CSV/JSON – OSF keeps it human-editable alongside narrative text.

It’s worth noting that while JSON and YAML are excellent for data exchange
between systems, they don’t by themselves handle formatted text or presentation.
OSF augments them by situating data in context with narrative and visual layout
instructions. In summary, OSF borrows the machine-friendly structure of
JSON/YAML but repurposes it for document authoring.

### Office Document Formats (Word, PowerPoint, Excel)

**Office Open XML (OOXML)** and **OpenDocument Format (ODF)** are the XML-based
standards behind the scenes of Microsoft Office and LibreOffice files. They
represent documents, presentations, and spreadsheets as collections of XML files
(zipped into `.docx`, `.pptx`, `.xlsx` containers, etc.), complete with styling,
scripting, and multimedia content. These formats are very expressive and are
international standards, but they are not meant to be hand-edited; they are
essentially compiled outputs from editor software.

OSF’s relationship to these formats is **complementary**. OSF acts as a
high-level source that can be _compiled_ into OOXML or ODF. For example, an OSF
`@doc` with certain styles would map to a Word `.docx` (which is an OOXML
WordprocessingML file under the hood). An `@slide` sequence in OSF would
correspond to a PowerPoint `.pptx` (presentation part of OOXML), and `@sheet` to
an Excel `.xlsx`. By providing exporters, OSF enables content creators to use
plain text to generate binary office files when needed – useful for
compatibility with stakeholders who require a Word or PowerPoint file.

Going the other direction, OSF importers could read `.docx/.pptx/.xlsx` and
produce an OSF file. This is challenging (because information in Office files
may not translate cleanly to a linear text format), but core content like
paragraphs, headings, slide text, and raw table data can often be extracted. OSF
does not aim to encode every possible feature of Office formats (for instance,
exact pixel positioning of elements, or complex Word style hierarchies), but it
strives for **round-trip fidelity** on standard content. A text paragraph in
Word becomes a paragraph in OSF; a slide with a title and bullets in PowerPoint
becomes an `@slide` in OSF; an Excel table becomes an `@sheet`. Any aspects that
don’t translate (like elaborate visual effects or certain proprietary settings)
might be stored in OSF as meta-comments or ignored, depending on the goals of
the conversion.

**Comparison:** Unlike OOXML/ODF, which use verbose XML tags and separate files
for different content types, OSF is a single coherent document. This means OSF
sacrifices some low-level control (you won’t specify XML elements for each
formatting nuance) in exchange for **simplicity and unity**. While OOXML is _“a
zipped, XML-based file format… for representing spreadsheets, charts,
presentations and word processing documents”_ in separate parts, OSF is an
_uncompressed, single text file_ representing all those aspects in one flow.
Think of OSF as the source code, and OOXML/ODF as the compiled binaries. Both
have their place: OSF for editing and versioning, OOXML/ODF for final
distribution and compatibility. By adhering to this model, OSF hopes to gain
acceptance as a complementary format in office workflows, not a conflicting one.

### Other Related Tools and Standards

OSF is not the first attempt to unify or simplify document authoring:

- **ReStructuredText, AsciiDoc, and others** – These are markup languages more
  powerful than Markdown (supporting tables, citations, etc.) used in certain
  communities. OSF’s `@doc` portion can be seen in the same spirit, but OSF goes
  beyond by including slides and sheets. We have looked at these formats for
  inspiration on syntax choices and will ensure OSF can convert to/from at least
  one of them (for example, AsciiDoc which can produce DocBook or PDF).

- **Jupyter Notebooks, RMarkdown, and literate programming** – They combine
  code, data, and narrative. OSF shares the idea of **multi-modal content**,
  though targeting a different scope (documents, slides, spreadsheets rather
  than code execution). OSF could serve in scenarios where Jupyter is used just
  for combining text and charts (without code), offering a simpler paradigm for
  non-programmers.

- **HTML/CSS** – The web’s format is the ultimate universal document format. OSF
  is not trying to replace HTML; in fact, exporting OSF to HTML is a key use
  case (e.g., to view an OSF doc in a web browser). By using well-defined
  structures, OSF content can map to HTML5 elements (sections, articles, lists,
  tables, canvas for drawings, etc.). Unlike raw HTML, OSF doesn’t require
  manual tagging of every element – it’s more declarative. This makes writing
  easier while still allowing conversion to clean HTML.

In summary, OSF’s approach to compatibility is **inclusive**: leverage what
exists. It takes cues from successful standards (human-readable like Markdown,
rigorous like LaTeX, structured like JSON, comprehensive like OOXML/ODF) and
combines them. By providing import/export tooling, OSF positions itself as a hub
in the format ecosystem, hopefully appealing to standards stakeholders as a
format that _complements and bridges_, rather than competes with, established
standards.

## Tooling and Implementation

Delivering OSF from concept to reality requires robust tooling. The
`omniscript-core` project provides a reference implementation comprising a
parser, serializer, and command-line interface (CLI) utilities. This section
outlines the tooling and how users can work with OSF documents:

- **Parser and Validator:** The OSF parser reads an `.osf` file and constructs
  an in-memory representation (syntax tree or object model). It checks for
  correctness against the OSF grammar and schema (e.g., ensuring that all blocks
  are properly formed, required metadata is present, formulas are valid, etc.).
  If there are syntax errors or schema violations, the parser will report them
  to help authors fix the source. The parser is designed to be used as a library
  (for integration into editors or other apps) as well as via the CLI.

- **CLI Tool (`osf`):** A command-line tool named `osf` is provided for common
  operations in a writer’s workflow. Planned CLI features include:
  - `osf parse <file.osf>` – Parse and validate the OSF file, outputting any
    errors or a confirmation that the file is well-formed. This can be used in
    CI pipelines to ensure documents meet the spec.

  - `osf lint <file.osf>` – Perform style and consistency checks on the
    document. For example, the linter might warn about unused metadata, overly
    long lines, or inconsistent heading formatting.

  - `osf render <file.osf> --format <html|pdf|docx|pptx|xlsx>` – Render the OSF
    document to a specified output format. This could generate an HTML bundle
    for web viewing, a PDF for printing, or Office files. Under the hood, this
    uses templates and conversion logic to map OSF structures to the target
    format.

  - `osf diff <file1.osf> <file2.osf>` – Produce a _semantic diff_ between two
    versions of an OSF document. Unlike line-by-line diff, this would understand
    the OSF structure: e.g., detect that a whole slide was reordered, or a
    bullet text changed, or a data value updated, and present that in a
    human-friendly way. This leverages the structured nature of OSF to give more
    meaningful comparisons in collaborative editing.

  - `osf export <file.osf> --target <format>` – Similar to render, but focused
    on converting to a format that might itself be edited further. For instance,
    `--target latex` could produce a `.tex` file (if one wanted to do complex
    tweaks in LaTeX), or `--target md` for a Markdown version. **Round-trip**
    fidelity is a goal, so an exported Markdown or LaTeX could be re-imported,
    although some constructs might be lost if the target format doesn’t support
    them.

  - `osf format <file.osf>` – Auto-format the source file (whitespace,
    indentation) according to canonical style. This is akin to how code
    formatters (prettier, black, etc.) work, making the document easier to read
    and diff. For example, it might align the `:` in key-value lists, or ensure
    uniform quoting style.

  These CLI commands make it convenient to integrate OSF into various
  environments: documentation build pipelines can call `osf render` to produce
  outputs; Git hooks can use `osf diff` to show changes; editors can use
  `osf lint` to provide real-time feedback.

- **Editors and Integration:** While not officially part of the spec, it’s
  expected that popular text editors/IDEs will add syntax highlighting and
  editing support for OSF. The block markers (`@doc`, `@slide`, etc.) provide
  clear scopes that an editor can recognize and highlight appropriately. The
  reference implementation or community contributions may include VS Code
  extensions, vim syntax files, etc., to improve the authoring experience.

- **Interactive Viewer:** A planned tool is an **interactive OSF viewer**
  (possibly web-based) where an `.osf` file can be loaded to view the fully
  formatted document, slides, and any interactive charts. Think of it as a
  lightweight alternative to opening a Word/PowerPoint – a single tool that
  knows how to display an OSF as a document and slideshow, with the ability to
  toggle into a data view for sheets. This viewer would use the parser and
  rendering engine under the hood. The “Resources (coming soon)” in the project
  hint at such a viewer and other conversion tools.

- **APIs and Automation:** Because OSF has a defined schema (and potentially an
  OpenAPI interface for services), developers could programmatically generate or
  modify OSF content. For instance, an analytics platform might output an OSF
  report combining textual analysis with charts, instead of a PDF. Or an AI
  writing assistant could read an OSF file, apply some transformations (like
  updating figures or rewriting a summary), and save it back. The structured
  nature of OSF simplifies these use cases compared to manipulating binary files
  or raw text in disparate formats.

- **Performance Considerations:** As a text-based format, OSF files can
  potentially grow large (imagine a report with a hundred slides and a large
  dataset embedded). Tools will handle such cases by perhaps offering splitting
  or modular includes in the future (e.g., including external CSV data into an
  OSF sheet by reference, rather than inline). The spec will consider such
  features as they become necessary. For now, typical use (a few hundred pages
  or slides, moderate data) is easily handled by modern computers.

The **implementation status**: At the time of this release, the core parser and
initial CLI commands are under development in the `omniscript-core` repository.
Example OSF documents and tests are provided there to illustrate usage.
Community contributions are welcome to expand the tooling (see **Contributing**
guidelines in the repository).

## Roadmap

OSF is currently an early-stage specification and prototype. The roadmap below outlines
the path toward a stable 1.0 release and beyond, indicating both technical
milestones and standardization efforts:

- **v0.5 – Initial Specification & Prototype (2025):** The focus is on validating
  the core ideas. Deliverables include this specification, the reference parser,
  and basic CLI functionality (parse, render to a couple of formats, basic
  lint). Feedback is solicited from early adopters, especially regarding the
  syntax choices and conversion fidelity.

- **v0.9 – Public Beta and Community Feedback:** By this stage, OSF should be
  usable for real-world authoring of mixed document types. More output formats
  (e.g., PDF, ODF) and a polished interactive viewer will be available. During
  the beta, we plan to engage with **standards stakeholders** – for example,
  discussing OSF in relevant W3C or OASIS groups – to ensure our format aligns
  with broader conventions and to explore the possibility of a formal standard
  in the future. The specification document will be refined with clearer grammar
  definitions and more examples. Performance tuning will happen here (for larger
  documents and data sets).

- **v1.0 – Official Release:** This will mark the specification as stable. All
  core features described in this document (basic documents, slides, sheets,
  themes, formulas) will be fully implemented. The appendices (grammar, schema,
  etc.) will be completed. At 1.0, we expect to have conversion tools for
  Markdown, LaTeX, DOCX/PPTX/XLSX, and possibly ODF. We will also finalize how
  citations, cross-references, and figure handling work (these may be in beta
  prior to 1.0). v1.0 is targeted to be submitted for consideration as an open
  standard if there is sufficient interest (the model could be similar to how
  CommonMark was standardized for Markdown).

- **Post-1.0 – Extensions and Advanced Features:** After stabilization,
  attention turns to **extensions** that were deferred:
  - _Diagrams and Drawings:_ Introduce an `@diagram` block or integration with
    diagram DSLs (like Mermaid or Graphviz) to include flowcharts and vector
    graphics in OSF.
  - _Forms and Interactivity:_ Possibly define form elements or interactive
    widgets (useful for e-learning content or enriched PDFs).
  - _Citations and Bibliography:_ Add syntax for scholarly citations and
    bibliographic entries, making OSF suitable for academic papers. This could
    integrate with existing citation formats (like BibTeX or CSL JSON).
  - _Localization/Internationalization:_ Support multi-language documents or
    translations within one OSF (perhaps via tags for different language
    versions of text).
  - _Macros/Templating:_ A mechanism to define reusable content snippets or
    conditional content (somewhat akin to LaTeX macros or Mustache templates,
    but kept simpler to avoid complicating the core syntax).
  - _Collaboration Features:_ Although beyond the file format itself, we
    envision tools for change tracking (similar to “track changes” in Word but
    for OSF text) and perhaps a web-based editor for real-time collaboration on
    `.osf` files.

- **Standardization & Adoption:** We will continue working with interested
  parties (open-source projects, companies, and standards organizations) to push
  OSF toward formal standardization if it gains traction. The vision is that one
  day OSF could be for unified documents what Markdown is for READMEs – an
  _open, accepted standard_. Given that ODF is an ISO/IEC standard and OOXML is
  an ECMA/ISO standard, we may aim for OSF to be an **open standard** through a
  body like OASIS. This would involve rigorous review of the spec, test suites
  for compliance, and multiple independent implementations to prove the concept.

- **Tooling Ecosystem:** On the roadmap is also fostering an ecosystem of tools:
  plugins for content management systems, integrations with static site
  generators, or add-ons for existing office software to export/import OSF. We
  recognize that user adoption will depend on how easily OSF fits into their
  current workflows.

The roadmap will be publicly tracked (e.g., in the project’s GitHub discussions
or a ROADMAP.md file) to allow the community to see progress and contribute.

## Conclusion

OmniScript Format is an ambitious attempt to simplify and unify the way we
author multifaceted documents. By staying true to its core principles –
human-readability, rich expressiveness, and seamless compatibility – OSF seeks
to empower everyone from technical writers to business analysts to create,
share, and collaborate on content in a single format. We encourage
experimentation with the format and invite feedback to refine this
specification.

As we work towards a 1.0 release, we believe OSF can become a powerful enabler:
_a plain-text source of truth for the era of AI-assisted writing and versioned
knowledge management_. It stands on the shoulders of giants (Markdown, LaTeX,
JSON, ODF, etc.) and aims to bring their best ideas together. We look forward to
the community’s involvement in shaping OSF’s future and making this open format
robust and widely adopted.

---

## Appendices (Planned)

_The following appendices will provide detailed technical specifications and
references in a future revision of this document. They are outlined here for
completeness but are not yet included in this release._

### Appendix A: OSF Grammar Definition (BNF)

_This section will contain the formal grammar for OSF in Backus–Naur Form (or an
equivalent format). It will specify tokenization (e.g., how identifiers,
strings, numbers are defined), block structure rules, and any operator
precedences for expressions (like formulas)._

### Appendix B: Schema and Data Model

_This section will include the JSON Schema for OSF documents and an OpenAPI
specification for any services using OSF. It defines the data model — for
example, the object representation of an OSF file (document nodes, slide nodes,
sheet nodes, etc.), which could be useful for developers integrating OSF
support._

### Appendix C: CLI Tools and Usage Examples

_This section will list each CLI command in detail, with usage syntax and
examples. It will also cover environment integration tips (for instance, how to
use `osf diff` in a Git merge driver, or how to incorporate `osf render` in a
continuous documentation deployment pipeline)._

### Appendix D: Conversion Mappings (Informative)

_This appendix will provide tables or descriptions of how OSF elements map to
other formats (e.g., OSF `@doc` heading → HTML `<h1>` or Word Heading 1 style;
OSF `@slide` bullet → PowerPoint bullet shape; OSF formula syntax → Excel
formula). This is intended to help implementers of import/export functions and
to serve as proof of round-trip capability._

---

**References:**

- OSF Project README – _OmniScript Format overview and features_
- _Markdown_ – Lightweight markup for formatted text
- _John Gruber (2004):_ Markdown design goals
- _LaTeX_ – Markup for content/layout separation
- _SnapLogic (2024):_ YAML vs JSON (YAML as human-readable superset of JSON)
- _Office Open XML_ – Zipped XML format for word/spreadsheet/presentation docs
- _OASIS OpenDocument_ – Open XML-based format for text, spreadsheets, charts,
  etc.
