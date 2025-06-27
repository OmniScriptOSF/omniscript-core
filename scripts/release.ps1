# OmniScript Release Automation Script (PowerShell)
# Usage: .\scripts\release.ps1 [patch|minor|major]

param(
    [Parameter(Position=0)]
    [ValidateSet("patch", "minor", "major")]
    [string]$BumpType = "patch"
)

$ErrorActionPreference = "Stop"

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow  
$Blue = [System.ConsoleColor]::Blue

function Write-ColorOutput($ForegroundColor, $Message) {
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

Write-ColorOutput $Blue "🚀 OmniScript Release Automation"
Write-ColorOutput $Blue "================================="

# Check if we're on main branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-ColorOutput $Red "❌ Must be on main branch to create release"
    exit 1
}

# Check if working directory is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-ColorOutput $Red "❌ Working directory is not clean. Commit or stash changes first."
    exit 1
}

# Pull latest changes
Write-ColorOutput $Yellow "📥 Pulling latest changes..."
git pull origin main

# Install dependencies and run tests
Write-ColorOutput $Yellow "📦 Installing dependencies..."
pnpm install

Write-ColorOutput $Yellow "🧪 Running tests..."
pnpm test

Write-ColorOutput $Yellow "🔍 Running linter..."
pnpm run lint:check

Write-ColorOutput $Yellow "💅 Checking formatting..."
pnpm run format:check

# Get current versions
$currentParserVersion = node -p "require('./parser/package.json').version"
$currentCliVersion = node -p "require('./cli/package.json').version"

Write-ColorOutput $Blue "📋 Current Versions:"
Write-Output "  Parser: $currentParserVersion"
Write-Output "  CLI: $currentCliVersion"

# Calculate new versions
switch ($BumpType) {
    "patch" {
        $newParserVersion = node -p "require('semver').inc('$currentParserVersion', 'patch')"
        $newCliVersion = node -p "require('semver').inc('$currentCliVersion', 'patch')"
    }
    "minor" {
        $newParserVersion = node -p "require('semver').inc('$currentParserVersion', 'minor')"
        $newCliVersion = node -p "require('semver').inc('$currentCliVersion', 'minor')"
    }
    "major" {
        $newParserVersion = node -p "require('semver').inc('$currentParserVersion', 'major')"
        $newCliVersion = node -p "require('semver').inc('$currentCliVersion', 'major')"
    }
}

Write-ColorOutput $Green "🆕 New Versions:"
Write-Output "  Parser: $newParserVersion"
Write-Output "  CLI: $newCliVersion"

# Confirm release
Write-ColorOutput $Yellow "❓ Create release v$newCliVersion? (y/N)"
$confirm = Read-Host
if ($confirm -notmatch "^[Yy]$") {
    Write-ColorOutput $Red "❌ Release cancelled"
    exit 1
}

# Update package versions
Write-ColorOutput $Yellow "📝 Updating package versions..."

# Update parser version
$updateParserScript = @"
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./parser/package.json', 'utf8'));
pkg.version = '$newParserVersion';
fs.writeFileSync('./parser/package.json', JSON.stringify(pkg, null, 2) + '\n');
"@
node -e $updateParserScript

# Update CLI version and parser dependency
$updateCliScript = @"
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./cli/package.json', 'utf8'));
pkg.version = '$newCliVersion';
pkg.dependencies['omniscript-parser'] = '^$newParserVersion';
fs.writeFileSync('./cli/package.json', JSON.stringify(pkg, null, 2) + '\n');
"@
node -e $updateCliScript

# Update lockfile
Write-ColorOutput $Yellow "🔒 Updating lockfile..."
pnpm install

# Build packages
Write-ColorOutput $Yellow "🔨 Building packages..."
pnpm run build

# Run tests again
Write-ColorOutput $Yellow "🧪 Running final tests..."
pnpm test

# Commit changes
Write-ColorOutput $Yellow "💾 Committing version bump..."
git add .
git commit -m "chore: Release v$newCliVersion

- Bump parser to v$newParserVersion
- Bump CLI to v$newCliVersion
- Update dependencies and lockfile"

# Create and push tag
Write-ColorOutput $Yellow "🏷️  Creating release tag..."
git tag "v$newCliVersion"
git push origin main
git push origin "v$newCliVersion"

# Get changelog
$lastTag = git describe --tags --abbrev=0 HEAD^
$changelog = git log --oneline "$lastTag..HEAD" | ForEach-Object { "- $_" } | Out-String

# Create GitHub release
Write-ColorOutput $Yellow "🎉 Creating GitHub release..."
$releaseNotes = @"
## 📦 Published Packages

- ``omniscript-parser@$newParserVersion``
- ``omniscript-cli@$newCliVersion``

## 🔄 Changes

This is a $BumpType release with the following updates:

$changelog

## 🚀 Installation

``````bash
npm install -g omniscript-cli@$newCliVersion
# or
npm install omniscript-parser@$newParserVersion
``````

## 🔗 Links

- [Parser on npm](https://www.npmjs.com/package/omniscript-parser)
- [CLI on npm](https://www.npmjs.com/package/omniscript-cli)
- [Documentation](https://github.com/OmniScriptOSF/omniscript-core#readme)
"@

gh release create "v$newCliVersion" --title "Release v$newCliVersion" --notes $releaseNotes --latest

Write-ColorOutput $Green "✅ Release v$newCliVersion created successfully!"
Write-ColorOutput $Green "🚀 GitHub Actions will automatically publish to npm"
Write-ColorOutput $Blue "📋 Next steps:"
Write-Output "  1. Monitor the GitHub Actions workflow"
Write-Output "  2. Verify packages on npm after ~2-3 minutes"
Write-Output "  3. Update any dependent projects"

Write-ColorOutput $Green "�� Release complete!" 