# OmniScript CLI

<div align="center">

<img src="https://raw.githubusercontent.com/OmniScriptOSF/omniscript-core/main/assets/osf-icon-512px.png" alt="OmniScript Logo" width="120" height="120" />

# ⚡ Command-Line Tools for OSF

**Professional command-line interface for the OmniScript Format (OSF) - Parse,
validate, format, and render documents with ease**

[![npm version](https://badge.fury.io/js/omniscript-cli.svg)](https://badge.fury.io/js/omniscript-cli)
[![npm downloads](https://img.shields.io/npm/dm/omniscript-cli.svg)](https://www.npmjs.com/package/omniscript-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[🚀 Quick Start](#-quick-start) • [📖 Commands](#-commands) •
[💡 Examples](#-examples) • [🔧 Integration](#-integration) •
[🛠️ Advanced Usage](#-advanced-usage)

</div>

---

## ✨ Features

<table>
<tr>
<td width="25%">

### 📝 **Parse & Validate**

- Comprehensive syntax checking
- Detailed error reporting
- JSON AST output
- Schema validation

</td>
<td width="25%">

### 🎨 **Format & Lint**

- Auto-format OSF documents
- Consistent code styling
- Configurable formatting rules
- Batch processing support

</td>
<td width="25%">

### 🌐 **Render & Export**

- HTML with live formulas
- Multiple output formats
- Theme-based styling
- Professional layouts

</td>
<td width="25%">

### 🔍 **Diff & Compare**

- Semantic document diffing
- Intelligent change detection
- Git integration ready
- Merge conflict resolution

</td>
</tr>
</table>

---

## 🚀 Quick Start

### 📦 Installation

<table>
<tr>
<td width="50%">

**🌐 Global Installation (Recommended)**

```bash
npm install -g omniscript-cli
# or
pnpm add -g omniscript-cli
# or
yarn global add omniscript-cli
```

</td>
<td width="50%">

**📦 Local Installation**

```bash
npm install omniscript-cli
# or
pnpm add omniscript-cli
# or use npx for one-time usage
npx omniscript-cli --help
```

</td>
</tr>
</table>

### ⚡ First Steps

```bash
# Check version and help
osf --version
osf --help

# Create your first OSF document
echo '@meta { title: "Hello OSF"; }
@doc { # Welcome
This is **your first** OSF document! }' > hello.osf

# Parse and validate
osf parse hello.osf

# Format for consistency
osf format hello.osf --output formatted.osf

# Render to beautiful HTML
osf render hello.osf --output hello.html
```

---

## 📖 Commands

### 🔍 `osf parse <file>`

Parse and validate OSF files with comprehensive syntax checking.

```bash
# Basic parsing
osf parse document.osf

# Parse with JSON output
osf parse document.osf > parsed.json

# Parse multiple files
osf parse *.osf

# Validate syntax only (no output)
osf parse document.osf --validate-only
```

**Options:**

- `--validate-only` - Only validate syntax, no JSON output
- `--schema <file>` - Use custom JSON schema for validation
- `--strict` - Enable strict mode with additional checks

**Exit Codes:**

- `0` - Parsing successful
- `1` - Syntax errors or validation failures

---

### 🎨 `osf format <file> [options]`

Auto-format OSF documents with consistent styling and indentation.

```bash
# Format to stdout
osf format document.osf

# Save formatted version
osf format document.osf --output clean.osf

# Format in-place
osf format document.osf --in-place

# Batch format all files
osf format *.osf --in-place
```

**Options:**

- `--output, -o <file>` - Output file path (default: stdout)
- `--in-place, -i` - Modify file in-place
- `--indent <spaces>` - Indentation size (default: 2)
- `--max-line-length <chars>` - Maximum line length (default: 100)

**Formatting Rules:**

- Consistent indentation and spacing
- Proper quote normalization
- Sorted metadata properties
- Aligned table columns

---

### 🌐 `osf render <file> [options]`

Render OSF documents to various output formats with professional styling.

```bash
# Render to HTML (default)
osf render document.osf

# Save HTML file
osf render document.osf --output document.html

# Render with specific theme
osf render document.osf --theme corporate --output report.html

# Render presentation
osf render slides.osf --format html --output presentation.html
```

**Options:**

- `--format, -f <format>` - Output format: `html` (more coming soon)
- `--output, -o <file>` - Output file path (default: stdout)
- `--theme <theme>` - Visual theme: `default`, `corporate`, `academic`, `modern`
- `--include-css` - Include inline CSS in HTML output
- `--standalone` - Generate complete HTML document

**Themes Available:**

- 🏢 **Corporate** - Professional business styling
- 🎓 **Academic** - Traditional academic layout
- ✨ **Modern** - Contemporary design
- 📄 **Default** - Clean, versatile styling

---

### 📤 `osf export <file> [options]`

Export OSF documents to structured formats like Markdown and JSON.

```bash
# Export to Markdown
osf export document.osf

# Export to JSON
osf export document.osf --target json

# Save to file
osf export document.osf --target md --output document.md

# Export with computed formulas
osf export spreadsheet.osf --target json --evaluate-formulas
```

**Options:**

- `--target, -t <format>` - Export format: `md`, `json` (default: md)
- `--output, -o <file>` - Output file path (default: stdout)
- `--evaluate-formulas` - Compute formula results in export
- `--include-metadata` - Include frontmatter metadata

**Export Formats:**

- 📝 **Markdown** - Clean MD with frontmatter and computed values
- 🔧 **JSON** - Structured data with AST and evaluated content

---

### 🔍 `osf diff <file1> <file2>`

Compare OSF documents with intelligent semantic diffing.

```bash
# Compare two documents
osf diff old.osf new.osf

# Detailed diff output
osf diff old.osf new.osf --detailed

# Machine-readable diff
osf diff old.osf new.osf --format json
```

**Options:**

- `--format <format>` - Output format: `text`, `json` (default: text)
- `--detailed` - Show detailed change information
- `--ignore-whitespace` - Ignore whitespace differences
- `--context <lines>` - Context lines around changes (default: 3)

**Exit Codes:**

- `0` - Files are identical
- `1` - Files differ or comparison failed

---

### 🔧 `osf lint <file> [options]`

Validate OSF files with comprehensive linting and style checks.

```bash
# Lint a single file
osf lint document.osf

# Lint multiple files
osf lint src/*.osf

# Lint with specific rules
osf lint document.osf --rules strict

# Auto-fix issues
osf lint document.osf --fix
```

**Options:**

- `--rules <preset>` - Linting rules: `basic`, `recommended`, `strict`
- `--fix` - Automatically fix issues where possible
- `--config <file>` - Custom linting configuration file
- `--reporter <format>` - Output format: `default`, `json`, `checkstyle`

---

## 💡 Examples

### 📋 Working with Business Documents

```bash
# Create a business report
cat > quarterly-report.osf << 'EOF'
@meta {
  title: "Q2 2025 Business Review";
  author: "Jane Smith";
  date: "2025-06-28";
  theme: "Corporate";
}

@doc {
  # Executive Summary

  Our Q2 performance exceeded expectations with **15% revenue growth**
  and significant improvements in customer retention.

  ## Key Metrics
  - Revenue: $2.3M (+15%)
  - Customer Churn: 3% (-2%)
  - Team Size: 45 (+8 new hires)
}

@sheet {
  name: "Regional Performance";
  cols: [Region, Q1_Revenue, Q2_Revenue, Growth_Percent];
  data {
    (1,1)="North America"; (1,2)=850000; (1,3)=975000;
    (2,1)="Europe"; (2,2)=650000; (2,3)=748000;
    (3,1)="Asia Pacific"; (3,2)=400000; (3,3)=477000;
  }
  formula (1,4): "=(C1-B1)/B1*100";
  formula (2,4): "=(C2-B2)/B2*100";
  formula (3,4): "=(C3-B3)/B3*100";
}
EOF

# Validate and format
osf lint quarterly-report.osf
osf format quarterly-report.osf --in-place

# Generate HTML report
osf render quarterly-report.osf \
  --theme corporate \
  --output quarterly-report.html

# Export to Markdown for wiki
osf export quarterly-report.osf \
  --target md \
  --evaluate-formulas \
  --output quarterly-report.md
```

### 🎯 Creating Presentations

```bash
# Create a product presentation
cat > product-launch.osf << 'EOF'
@meta {
  title: "Product Launch 2025";
  author: "Product Team";
  theme: "Modern";
}

@slide {
  title: "Introducing OmniScript";
  layout: "TitleAndContent";
  content: "The future of document processing is here.";
}

@slide {
  title: "Key Features";
  layout: "TitleAndBullets";
  bullets {
    "🚀 Universal document format";
    "🤖 AI-native syntax design";
    "🔄 Git-friendly version control";
    "📊 Multi-format export capabilities";
  }
}

@slide {
  title: "Market Opportunity";
  layout: "TitleAndBullets";
  bullets {
    "📈 $50B document processing market";
    "🎯 Growing demand for AI-native tools";
    "🔄 Version control pain points";
    "🌐 Multi-format compatibility needs";
  }
}
EOF

# Validate and render presentation
osf lint product-launch.osf
osf render product-launch.osf \
  --theme modern \
  --output product-launch.html \
  --standalone
```

### 📊 Data Analysis Workflows

```bash
# Create a data analysis document
cat > sales-analysis.osf << 'EOF'
@meta {
  title: "Sales Analysis Dashboard";
  author: "Analytics Team";
  theme: "DataViz";
}

@sheet {
  name: "Monthly Sales";
  cols: [Month, Sales, Target, Performance];
  data {
    (1,1)="Jan"; (1,2)=85000; (1,3)=80000;
    (2,1)="Feb"; (2,2)=92000; (2,3)=85000;
    (3,1)="Mar"; (3,2)=78000; (3,3)=90000;
  }
  formula (1,4): "=B1/C1*100";
  formula (2,4): "=B2/C2*100";
  formula (3,4): "=B3/C3*100";
}

@doc {
  # Analysis Summary

  The Q1 sales data shows strong performance in January and February,
  with March slightly underperforming target due to market conditions.

  **Key Insights:**
  - January: **106.25%** of target achieved
  - February: **108.24%** of target achieved
  - March: **86.67%** of target achieved
}
EOF

# Process the analysis
osf lint sales-analysis.osf
osf render sales-analysis.osf --output dashboard.html
osf export sales-analysis.osf \
  --target json \
  --evaluate-formulas \
  --output sales-data.json
```

---

## 🔧 Integration

### 🚀 CI/CD Integration

#### GitHub Actions

```yaml
name: OSF Document Processing
on: [push, pull_request]

jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install OmniScript CLI
        run: npm install -g omniscript-cli

      - name: Validate OSF Files
        run: |
          find docs/ -name "*.osf" -exec osf lint {} \;

      - name: Generate Documentation
        run: |
          mkdir -p dist
          for file in docs/*.osf; do
            osf render "$file" \
              --theme corporate \
              --output "dist/$(basename $file .osf).html"
          done

      - name: Deploy to Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### GitLab CI

```yaml
stages:
  - validate
  - build
  - deploy

validate-osf:
  stage: validate
  image: node:18
  script:
    - npm install -g omniscript-cli
    - find . -name "*.osf" -exec osf lint {} \;
  only:
    changes:
      - '**/*.osf'

build-docs:
  stage: build
  image: node:18
  script:
    - npm install -g omniscript-cli
    - mkdir -p public
    - for file in docs/*.osf; do osf render "$file" --output "public/$(basename
      $file .osf).html"; done
  artifacts:
    paths:
      - public
```

### 🐳 Docker Integration

```dockerfile
FROM node:18-alpine

# Install OmniScript CLI
RUN npm install -g omniscript-cli

# Set working directory
WORKDIR /workspace

# Copy OSF files
COPY . .

# Validate and build
RUN osf lint *.osf
RUN osf render presentation.osf --output index.html

# Serve the result
EXPOSE 3000
CMD ["npx", "http-server", "-p", "3000"]
```

### 📝 Pre-commit Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check if any OSF files are being committed
osf_files=$(git diff --cached --name-only | grep '\.osf$')

if [ -n "$osf_files" ]; then
  echo "Validating OSF files..."

  for file in $osf_files; do
    if ! osf lint "$file"; then
      echo "❌ OSF validation failed for $file"
      exit 1
    fi
  done

  echo "✅ All OSF files are valid"
fi
```

---

## 🛠️ Advanced Usage

### 📋 Configuration File

Create `.osfrc.json` in your project root:

```json
{
  "formatting": {
    "indent": 2,
    "maxLineLength": 100,
    "sortMetadata": true,
    "alignTables": true
  },
  "linting": {
    "rules": "recommended",
    "allowEmptyBlocks": false,
    "requireMetadata": true,
    "maxNestingDepth": 5
  },
  "rendering": {
    "defaultTheme": "corporate",
    "includeCss": true,
    "standalone": true
  }
}
```

### 🔄 Batch Processing

```bash
# Format all OSF files in a project
find . -name "*.osf" -exec osf format {} --in-place \;

# Generate HTML for all documents
for file in docs/*.osf; do
  osf render "$file" \
    --theme corporate \
    --output "build/$(basename $file .osf).html"
done

# Validate all files and collect errors
find . -name "*.osf" -exec osf lint {} \; > validation-report.txt 2>&1
```

### 🔍 Advanced Diffing

```bash
# Compare document versions with context
osf diff v1/document.osf v2/document.osf --context 5

# Generate diff report for CI
osf diff old.osf new.osf --format json > diff-report.json

# Ignore formatting differences
osf diff formatted.osf unformatted.osf --ignore-whitespace
```

### 🎯 Custom Scripting

```bash
#!/bin/bash
# osf-build-docs.sh - Custom documentation build script

set -e

echo "🔍 Validating OSF documents..."
find docs/ -name "*.osf" -exec osf lint {} \;

echo "🎨 Formatting documents..."
find docs/ -name "*.osf" -exec osf format {} --in-place \;

echo "🌐 Generating HTML..."
mkdir -p dist/docs

for file in docs/*.osf; do
  filename=$(basename "$file" .osf)
  osf render "$file" \
    --theme corporate \
    --standalone \
    --output "dist/docs/$filename.html"
  echo "✅ Generated $filename.html"
done

echo "📤 Exporting to Markdown..."
mkdir -p dist/markdown

for file in docs/*.osf; do
  filename=$(basename "$file" .osf)
  osf export "$file" \
    --target md \
    --evaluate-formulas \
    --output "dist/markdown/$filename.md"
  echo "✅ Exported $filename.md"
done

echo "🎉 Documentation build complete!"
```

---

## 🔧 Troubleshooting

### Common Issues

**❌ Permission Denied (Global Install)**

```bash
# Solution 1: Use sudo (Unix systems)
sudo npm install -g omniscript-cli

# Solution 2: Configure npm prefix
npm config set prefix ~/.local
export PATH=~/.local/bin:$PATH

# Solution 3: Use npx for one-time usage
npx omniscript-cli parse document.osf
```

**❌ Module Not Found**

```bash
# Reinstall the package
npm uninstall -g omniscript-cli
npm install -g omniscript-cli

# Verify installation
which osf
osf --version
```

**❌ Parse Errors**

```bash
# Enable debug mode for detailed errors
DEBUG=1 osf parse problematic.osf

# Use strict validation
osf lint document.osf --rules strict

# Check syntax step by step
osf parse document.osf --validate-only
```

### 🐛 Debug Mode

Enable detailed logging and error reporting:

```bash
# Set debug environment variable
export DEBUG=1
osf parse document.osf

# Or inline
DEBUG=1 osf render presentation.osf
```

---

## 📚 OSF Language Guide

### 🏗️ Document Structure

```osf
@meta {
  title: "Document Title";
  author: "Author Name";
  date: "2025-06-28";
  theme: "Corporate";
}

@doc {
  # Markdown Content

  Regular **markdown** formatting is fully supported.

  ## Features
  - Rich text formatting
  - Tables and lists
  - Math expressions
}

@slide {
  title: "Slide Title";
  layout: "TitleAndBullets";
  bullets {
    "Bullet point 1";
    "Bullet point 2";
    "Bullet point 3";
  }
}

@sheet {
  name: "Data Sheet";
  cols: [Column1, Column2, Result];
  data {
    (1,1) = "Value A";
    (1,2) = 100;
    (2,1) = "Value B";
    (2,2) = 200;
  }
  formula (1,3): "=B1*2";
  formula (2,3): "=B2*2";
}
```

### 🧮 Formula Syntax

```osf
# Basic arithmetic
formula (1,1): "=10+20";
formula (1,2): "=A1*2";

# Cell references
formula (2,1): "=A1+B1";
formula (2,2): "=C1-D1";

# Percentages
formula (3,1): "=(B2-B1)/B1*100";

# Future: Advanced functions
formula (4,1): "=SUM(A1:A10)";  # Planned
formula (4,2): "=AVERAGE(B1:B10)";  # Planned
```

---

## 🤝 Contributing

We welcome contributions to make the CLI even better!

### 🌟 Areas for Contribution

- 🔧 **New Commands** - Add useful new CLI commands
- 🎨 **Themes** - Create beautiful new rendering themes
- 📊 **Export Formats** - Add support for more output formats
- 🧪 **Testing** - Expand test coverage and edge cases
- 📖 **Documentation** - Improve examples and guides

### 🚀 Development Setup

```bash
# Clone the repository
git clone https://github.com/OmniScriptOSF/omniscript-core.git
cd omniscript-core/cli

# Install dependencies
pnpm install

# Build the CLI
pnpm run build

# Test locally
node dist/osf.js --version

# Run tests
pnpm test
```

---

## 📄 License

MIT License © 2025 [Alphin Tom](https://github.com/alpha912)

---

## 🔗 Related Tools

- **[omniscript-parser](https://www.npmjs.com/package/omniscript-parser)** -
  Core parsing library
- **[omniscript-converters](https://www.npmjs.com/package/omniscript-converters)** -
  Professional format converters
- **[OmniScript Core](https://github.com/OmniScriptOSF/omniscript-core)** -
  Complete ecosystem

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/OmniScriptOSF/omniscript-core/issues)
- 💬 [Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
- 🏢 [Organization](https://github.com/OmniScriptOSF)
- 👤 [Maintainer](https://github.com/alpha912)

---

<div align="center">

### ⚡ Ready to supercharge your OSF workflow?

**[📦 Install Now](https://www.npmjs.com/package/omniscript-cli)** •
**[📖 View Examples](https://github.com/OmniScriptOSF/omniscript-examples)** •
**[🤝 Get Support](https://github.com/OmniScriptOSF/omniscript-core/discussions)**

---

_Empowering the future of document processing with OSF_ 🚀

</div>
