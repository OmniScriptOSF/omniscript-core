#!/bin/bash

# OmniScript Release Automation Script
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

echo -e "${BLUE}🚀 OmniScript Release Automation${NC}"
echo -e "${BLUE}=================================${NC}"

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}❌ Invalid bump type. Use: patch, minor, or major${NC}"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Must be on main branch to create release${NC}"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Working directory is not clean. Commit or stash changes first.${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Install dependencies and run tests
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

echo -e "${YELLOW}🧪 Running tests...${NC}"
pnpm test

echo -e "${YELLOW}🔍 Running linter...${NC}"
pnpm run lint:check

echo -e "${YELLOW}💅 Checking formatting...${NC}"
pnpm run format:check

# Get current versions
CURRENT_PARSER_VERSION=$(node -p "require('./parser/package.json').version")
CURRENT_CLI_VERSION=$(node -p "require('./cli/package.json').version")

echo -e "${BLUE}📋 Current Versions:${NC}"
echo -e "  Parser: ${CURRENT_PARSER_VERSION}"
echo -e "  CLI: ${CURRENT_CLI_VERSION}"

# Calculate new versions
case $BUMP_TYPE in
    "patch")
        NEW_PARSER_VERSION=$(node -p "require('semver').inc('$CURRENT_PARSER_VERSION', 'patch')")
        NEW_CLI_VERSION=$(node -p "require('semver').inc('$CURRENT_CLI_VERSION', 'patch')")
        ;;
    "minor")
        NEW_PARSER_VERSION=$(node -p "require('semver').inc('$CURRENT_PARSER_VERSION', 'minor')")
        NEW_CLI_VERSION=$(node -p "require('semver').inc('$CURRENT_CLI_VERSION', 'minor')")
        ;;
    "major")
        NEW_PARSER_VERSION=$(node -p "require('semver').inc('$CURRENT_PARSER_VERSION', 'major')")
        NEW_CLI_VERSION=$(node -p "require('semver').inc('$CURRENT_CLI_VERSION', 'major')")
        ;;
esac

echo -e "${GREEN}🆕 New Versions:${NC}"
echo -e "  Parser: ${NEW_PARSER_VERSION}"
echo -e "  CLI: ${NEW_CLI_VERSION}"

# Confirm release
echo -e "${YELLOW}❓ Create release v${NEW_CLI_VERSION}? (y/N)${NC}"
read -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Release cancelled${NC}"
    exit 1
fi

# Update package versions
echo -e "${YELLOW}📝 Updating package versions...${NC}"

# Update parser version
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./parser/package.json', 'utf8'));
pkg.version = '$NEW_PARSER_VERSION';
fs.writeFileSync('./parser/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update CLI version and parser dependency
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./cli/package.json', 'utf8'));
pkg.version = '$NEW_CLI_VERSION';
pkg.dependencies['omniscript-parser'] = '^$NEW_PARSER_VERSION';
fs.writeFileSync('./cli/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update lockfile
echo -e "${YELLOW}🔒 Updating lockfile...${NC}"
pnpm install

# Build packages
echo -e "${YELLOW}🔨 Building packages...${NC}"
pnpm run build

# Run tests again
echo -e "${YELLOW}🧪 Running final tests...${NC}"
pnpm test

# Commit changes
echo -e "${YELLOW}💾 Committing version bump...${NC}"
git add .
git commit -m "chore: Release v${NEW_CLI_VERSION}

- Bump parser to v${NEW_PARSER_VERSION}
- Bump CLI to v${NEW_CLI_VERSION}
- Update dependencies and lockfile"

# Create and push tag
echo -e "${YELLOW}🏷️  Creating release tag...${NC}"
git tag "v${NEW_CLI_VERSION}"
git push origin main
git push origin "v${NEW_CLI_VERSION}"

# Create GitHub release
echo -e "${YELLOW}🎉 Creating GitHub release...${NC}"
gh release create "v${NEW_CLI_VERSION}" \
    --title "Release v${NEW_CLI_VERSION}" \
    --notes "## 📦 Published Packages

- \`omniscript-parser@${NEW_PARSER_VERSION}\`
- \`omniscript-cli@${NEW_CLI_VERSION}\`

## 🔄 Changes

This is a ${BUMP_TYPE} release with the following updates:

$(git log --oneline $(git describe --tags --abbrev=0 HEAD^)..HEAD | sed 's/^/- /')

## 🚀 Installation

\`\`\`bash
npm install -g omniscript-cli@${NEW_CLI_VERSION}
# or
npm install omniscript-parser@${NEW_PARSER_VERSION}
\`\`\`

## 🔗 Links

- [Parser on npm](https://www.npmjs.com/package/omniscript-parser)
- [CLI on npm](https://www.npmjs.com/package/omniscript-cli)
- [Documentation](https://github.com/OmniScriptOSF/omniscript-core#readme)" \
    --latest

echo -e "${GREEN}✅ Release v${NEW_CLI_VERSION} created successfully!${NC}"
echo -e "${GREEN}🚀 GitHub Actions will automatically publish to npm${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "  1. Monitor the GitHub Actions workflow"
echo -e "  2. Verify packages on npm after ~2-3 minutes"
echo -e "  3. Update any dependent projects"

echo -e "${GREEN}🎉 Release complete!${NC}" 