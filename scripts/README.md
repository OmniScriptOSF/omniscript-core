# Release Scripts

Automated release management for OmniScript packages.

## 🚀 Quick Release

```bash
# Patch release (0.5.4 → 0.5.5)
pnpm run release:patch

# Minor release (0.5.4 → 0.6.0)
pnpm run release:minor

# Major release (0.5.4 → 1.0.0)
pnpm run release:major
```

## 📋 What the Scripts Do

1. **Pre-flight Checks**
   - Ensures you're on `main` branch
   - Verifies working directory is clean
   - Pulls latest changes

2. **Quality Assurance**
   - Runs all tests
   - Checks linting and formatting
   - Validates build process

3. **Version Management**
   - Calculates new semantic versions
   - Updates `package.json` files
   - Updates dependency references
   - Syncs `pnpm-lock.yaml`

4. **Release Process**
   - Commits version changes
   - Creates and pushes git tag
   - Creates GitHub release with changelog
   - Triggers automated npm publishing

## 🔐 Prerequisites

### Required Tools

- **Node.js 18+** with `pnpm`
- **Git** with push access to repository
- **GitHub CLI** (`gh`) authenticated

### Required Secrets

- **NPM_TOKEN** - Automation token stored in GitHub Secrets

### Setup GitHub CLI

```bash
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login
```

### Setup NPM Token

1. Create automation token: `npm token create --type=automation`
2. Add to GitHub Secrets as `NPM_TOKEN`

## 📝 Manual Process (Alternative)

If you prefer manual releases:

```bash
# 1. Update versions manually
# Edit parser/package.json and cli/package.json

# 2. Update dependencies
pnpm install

# 3. Run tests
pnpm test

# 4. Commit and tag
git add .
git commit -m "chore: Release v0.5.5"
git tag v0.5.5
git push origin main v0.5.5

# 5. Create GitHub release
gh release create v0.5.5 --generate-notes --latest
```

## 🔧 Script Files

- **`release.ps1`** - PowerShell script for Windows
- **`release.sh`** - Bash script for Unix/Linux/macOS

Both scripts have identical functionality.

## 🚨 Troubleshooting

### Common Issues

**"Must be on main branch"**

```bash
git checkout main
git pull origin main
```

**"Working directory not clean"**

```bash
git status
git add . && git commit -m "fix: pending changes"
# or
git stash
```

**"GitHub CLI not authenticated"**

```bash
gh auth status
gh auth login
```

**"NPM publishing fails"**

- Check NPM_TOKEN is set in GitHub Secrets
- Verify token has publish permissions
- Check package names are not taken

### Debug Mode

Add verbose logging to scripts:

```bash
# PowerShell
$VerbosePreference = "Continue"
.\scripts\release.ps1 patch

# Bash
set -x
./scripts/release.sh patch
```

## 🔄 CI/CD Integration

The release process integrates with GitHub Actions:

1. **Release Creation** triggers the `publish` job
2. **Quality Gates** must pass before publishing
3. **Automated Publishing** to npm registry
4. **Release Assets** are built and attached

Monitor releases at: https://github.com/OmniScriptOSF/omniscript-core/actions
