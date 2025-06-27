# OmniScript CLI

[![npm version](https://badge.fury.io/js/omniscript-cli.svg)](https://badge.fury.io/js/omniscript-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Professional command-line tools for the **OmniScript Format (OSF)** - a
universal document DSL designed for LLMs, agentic AI, and Git-native workflows.

## 🚀 Features

- **📝 Parse & Validate** - Parse OSF files with comprehensive syntax checking
- **🎨 Format & Lint** - Auto-format OSF documents with consistent styling
- **🌐 Render to HTML** - Generate responsive HTML with live formula evaluation
- **📄 Export Multiple Formats** - Convert to Markdown, JSON, and more
- **🔍 Semantic Diff** - Compare OSF documents with intelligent diffing
- **🧮 Formula Engine** - Built-in spreadsheet formula evaluation
- **⚡ Fast & Reliable** - Built with TypeScript for speed and reliability
- **🛠️ Developer Friendly** - Comprehensive error messages and debugging

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g omniscript-cli
# or
yarn global add omniscript-cli
# or
pnpm add -g omniscript-cli
```

### Local Installation

```bash
npm install omniscript-cli
# or
yarn add omniscript-cli
# or
pnpm add omniscript-cli
```

## 🏃 Quick Start

```bash
# Check version
osf --version

# Get help
osf --help

# Parse and validate an OSF file
osf parse document.osf

# Lint an OSF file
osf lint document.osf

# Format an OSF file
osf format document.osf

# Render to HTML
osf render presentation.osf

# Export to Markdown
osf export data.osf --target md

# Compare two OSF files
osf diff old.osf new.osf
```

## 📖 Commands

### `osf parse <file>`

Parse and validate an OSF file, outputting the parsed structure as JSON.

```bash
osf parse document.osf
osf parse document.osf > parsed.json
```

**Options:**

- `<file>` - Path to the OSF file to parse

**Output:** JSON representation of the parsed document structure

### `osf lint <file>`

Validate OSF file syntax and report any errors.

```bash
osf lint document.osf
osf lint *.osf  # Lint multiple files
```

**Options:**

- `<file>` - Path to the OSF file(s) to lint

**Exit Codes:**

- `0` - No errors found
- `1` - Syntax errors or validation failures

### `osf format <file> [options]`

Format an OSF file with consistent styling and indentation.

```bash
osf format document.osf                    # Output to stdout
osf format document.osf --output clean.osf # Save to file
```

**Options:**

- `<file>` - Path to the OSF file to format
- `--output, -o <file>` - Output file path (default: stdout)

### `osf render <file> [options]`

Render OSF files to various output formats with live formula evaluation.

```bash
osf render document.osf                           # HTML to stdout
osf render document.osf --output document.html    # Save HTML file
osf render slides.osf --format html               # Explicit HTML format
```

**Options:**

- `<file>` - Path to the OSF file to render
- `--format, -f <format>` - Output format: `html`, `pdf`, `docx`, `pptx`, `xlsx`
  (default: html)
- `--output, -o <file>` - Output file path (default: stdout)

**Supported Formats:**

- `html` - Responsive HTML with CSS styling ✅
- `pdf` - PDF document (planned)
- `docx` - Microsoft Word document (planned)
- `pptx` - PowerPoint presentation (planned)
- `xlsx` - Excel spreadsheet (planned)

### `osf export <file> [options]`

Export OSF files to structured formats like Markdown and JSON.

```bash
osf export document.osf                           # Markdown to stdout
osf export document.osf --target json             # JSON format
osf export document.osf --output document.md      # Save to file
```

**Options:**

- `<file>` - Path to the OSF file to export
- `--target, -t <format>` - Export format: `md`, `json` (default: md)
- `--output, -o <file>` - Output file path (default: stdout)

**Export Formats:**

- `md` - Markdown with formula results and metadata frontmatter
- `json` - Structured JSON with computed values

### `osf diff <file1> <file2>`

Compare two OSF files and show semantic differences.

```bash
osf diff old.osf new.osf
osf diff document.osf document-v2.osf
```

**Options:**

- `<file1>` - First OSF file to compare
- `<file2>` - Second OSF file to compare

**Exit Codes:**

- `0` - Files are identical
- `1` - Files differ or comparison failed

## 💡 Usage Examples

### Working with Documents

```bash
# Create a simple document
cat > example.osf << 'EOF'
@meta {
  title: "My First OSF Document";
  author: "John Doe";
  date: "2025-01-01";
}

@doc {
  # Welcome to OSF

  This is a **powerful** document format that supports:
  - Rich text formatting
  - Structured data
  - Formula calculations
}
EOF

# Validate the document
osf lint example.osf

# Format it nicely
osf format example.osf --output formatted.osf

# Render to HTML
osf render formatted.osf --output example.html
```

### Working with Presentations

```bash
# Create a presentation
cat > slides.osf << 'EOF'
@meta {
  title: "OSF Presentation";
  author: "Jane Smith";
}

@slide {
  title: "Introduction";
  layout: "TitleAndBullets";
  bullets {
    "Universal document format";
    "Git-friendly syntax";
    "AI-optimized structure";
  }
}

@slide {
  title: "Key Benefits";
  bullets {
    "Human readable";
    "Machine parseable";
    "Version control friendly";
  }
}
EOF

# Render as HTML presentation
osf render slides.osf --output presentation.html
```

### Working with Spreadsheets

```bash
# Create a data sheet with formulas
cat > data.osf << 'EOF'
@meta {
  title: "Sales Analysis";
}

@sheet {
  name: "Q1 Sales";
  cols: [Month, Revenue, Growth];
  data {
    (1,1) = "Jan";
    (1,2) = 100000;
    (2,1) = "Feb";
    (2,2) = 125000;
    (3,1) = "Mar";
    (3,2) = 150000;
  }
  formula (1,3): "=0";
  formula (2,3): "=(B2-B1)/B1*100";
  formula (3,3): "=(B3-B2)/B2*100";
}
EOF

# Export with calculated values
osf export data.osf --target json --output analysis.json

# Render as HTML table
osf render data.osf --output report.html
```

### Batch Processing

```bash
# Lint all OSF files in a directory
find . -name "*.osf" -exec osf lint {} \;

# Format all OSF files
for file in *.osf; do
  osf format "$file" --output "formatted_$file"
done

# Convert all OSF files to Markdown
for file in *.osf; do
  osf export "$file" --target md --output "${file%.osf}.md"
done
```

## 🔧 Development & Integration

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Validate OSF Files
  run: |
    npm install -g omniscript-cli
    find docs/ -name "*.osf" -exec osf lint {} \;

- name: Generate Documentation
  run: |
    for file in docs/*.osf; do
      osf render "$file" --output "public/$(basename $file .osf).html"
    done
```

### Programmatic Usage

```javascript
// Using with Node.js
const { execSync } = require('child_process');

// Parse OSF file
const result = execSync('osf parse document.osf', { encoding: 'utf8' });
const parsed = JSON.parse(result);

// Validate files
try {
  execSync('osf lint document.osf');
  console.log('✅ Valid OSF file');
} catch (error) {
  console.error('❌ Invalid OSF file');
}
```

### Docker Usage

```dockerfile
FROM node:18-alpine
RUN npm install -g omniscript-cli
COPY . /workspace
WORKDIR /workspace
RUN osf lint *.osf
RUN osf render presentation.osf --output index.html
```

## 🎨 HTML Output Features

The HTML renderer includes:

- **📱 Responsive Design** - Mobile-friendly layouts
- **🎯 Semantic Markup** - Proper HTML5 structure
- **🧮 Live Formulas** - Computed spreadsheet values
- **🎨 Clean Styling** - Professional CSS styling
- **📊 Data Tables** - Formatted spreadsheet rendering
- **🔍 Error Highlighting** - Clear error indicators

## 🛠️ Troubleshooting

### Common Issues

**Permission Denied (Global Install)**

```bash
# Use sudo on Unix systems
sudo npm install -g omniscript-cli

# Or configure npm prefix
npm config set prefix ~/.local
export PATH=~/.local/bin:$PATH
```

**Module Not Found**

```bash
# Reinstall the package
npm uninstall -g omniscript-cli
npm install -g omniscript-cli

# Or use npx for one-time usage
npx omniscript-cli parse document.osf
```

**Parse Errors**

```bash
# Enable debug mode for detailed errors
DEBUG=1 osf parse document.osf

# Validate syntax step by step
osf lint document.osf
```

### Debug Mode

Enable detailed error reporting:

```bash
export DEBUG=1
osf parse problematic.osf
```

## 📚 OSF Format Guide

### Basic Structure

```osf
@meta {
  title: "Document Title";
  author: "Author Name";
  date: "2025-01-01";
}

@doc {
  # Markdown Content

  Regular **markdown** formatting is supported.
}

@slide {
  title: "Slide Title";
  bullets {
    "Bullet point 1";
    "Bullet point 2";
  }
}

@sheet {
  name: "Sheet Name";
  cols: [Column1, Column2, Result];
  data {
    (1,1) = "Value";
    (1,2) = 100;
  }
  formula (1,3): "=B1*2";
}
```

### Formula Syntax

```osf
# Basic arithmetic
formula (1,1): "=10+20";
formula (1,2): "=A1*2";

# Cell references
formula (2,1): "=A1+B1";
formula (2,2): "=SUM(A1:A10)";  # Planned

# Conditional logic (planned)
formula (3,1): "=IF(A1>100, 'High', 'Low')";
```

## 🔗 Related Tools

- [`omniscript-parser`](https://www.npmjs.com/package/omniscript-parser) - Core
  parsing library
- [OSF Specification](https://github.com/OmniScriptOSF/omniscript-core/tree/main/spec) -
  Format specification
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=omniscript.osf) -
  Syntax highlighting (planned)

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/OmniScriptOSF/omniscript-core/blob/main/CONTRIBUTING.md).

### Development Setup

```bash
# Clone the repository
git clone https://github.com/OmniScriptOSF/omniscript-core.git
cd omniscript-core

# Install dependencies
pnpm install

# Build the CLI
pnpm run build:cli

# Test the CLI
node cli/dist/osf.js --version

# Run tests
pnpm test
```

## 📄 License

MIT License - see the
[LICENSE](https://github.com/OmniScriptOSF/omniscript-core/blob/main/LICENSE)
file for details.

## 📞 Support

- 🐛 [Report Issues](https://github.com/OmniScriptOSF/omniscript-core/issues)
- 💬 [Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
- 🏢 [Organization](https://github.com/OmniScriptOSF)
- 👤 [Owner](https://github.com/alpha912/)
- 📖
  [Documentation](https://github.com/OmniScriptOSF/omniscript-core/tree/main/docs)

## 🗺️ Roadmap

- [ ] PDF/DOCX/PPTX rendering
- [ ] Advanced formula functions (SUM, AVERAGE, etc.)
- [ ] Plugin system for custom renderers
- [ ] VS Code extension with syntax highlighting
- [ ] Language server protocol support
- [ ] Web-based OSF editor

---

_Empowering the future of document processing with OSF_ 🚀
