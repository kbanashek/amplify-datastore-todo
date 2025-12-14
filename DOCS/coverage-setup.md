# Test Coverage Setup Guide

This guide explains how test coverage is displayed in the GitHub repository.

## Overview

The project uses Jest for test coverage generation and displays coverage reports in multiple ways:

1. **GitHub Actions** - Automated coverage generation on every push/PR
2. **Codecov** (optional) - Coverage badges, PR comments, and historical tracking
3. **Coverage Artifacts** - Downloadable HTML reports from workflow runs

## Current Setup

### GitHub Actions Workflow

The `.github/workflows/test-coverage.yml` workflow automatically:

- Runs tests with coverage on every push to `main`/`develop` and on pull requests
- Generates coverage reports in multiple formats (HTML, LCOV, text)
- **Posts coverage summary as a comment on pull requests** (automatic)
- Uploads coverage reports as downloadable artifacts
- Optionally uploads to Codecov (if token is configured) for enhanced PR comments with diffs
- Displays coverage summary in workflow run details

### Viewing Coverage Reports

**From Pull Requests (Recommended):**

1. Open any pull request
2. Scroll to the bottom of the PR conversation
3. Look for the **📊 Test Coverage Report** comment (posted automatically by the workflow)
4. The comment shows:
   - Overall coverage percentages (Lines, Statements, Functions, Branches)
   - Link to download full HTML report from workflow artifacts

**From GitHub Actions:**

1. Go to the **Actions** tab in your GitHub repository
2. Click on a workflow run (e.g., "Test Coverage")
3. Scroll to the bottom to see the **Coverage Summary** section
4. Download the **coverage-report** artifact to get the full HTML report

**From Codecov (if configured):**

1. Visit `https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO`
2. See coverage trends, file-by-file breakdown, and enhanced PR comments with coverage diffs
3. Codecov provides more detailed PR comments showing which files have coverage changes

## Setting Up Codecov (Optional)

Codecov provides additional features like:

- Coverage badges in README
- Automatic PR comments with coverage changes
- Historical coverage trends
- File-by-file coverage visualization

### Setup Steps

1. **Sign up for Codecov:**
   - Go to [codecov.io](https://codecov.io)
   - Sign in with your GitHub account
   - Add your repository

2. **Get your Codecov token:**
   - In Codecov dashboard, go to your repository settings
   - Copy the repository upload token

3. **Add token to GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Paste your Codecov token
   - Click "Add secret"

4. **Update README badge:**
   - Replace `YOUR_USERNAME` and `YOUR_REPO` in the README badge URL:

   ```markdown
   [![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
   ```

5. **Push a commit:**
   - The workflow will automatically upload coverage to Codecov
   - The badge will update after the first successful upload

## Coverage Metrics

The project tracks coverage for:

- **Lines** - Percentage of code lines executed
- **Statements** - Percentage of statements executed
- **Functions** - Percentage of functions called
- **Branches** - Percentage of conditional branches taken

Current thresholds are set to 0% (no enforcement) in `jest.config.js`. You can increase these as coverage improves:

```javascript
coverageThreshold: {
  global: {
    branches: 50,    // Require 50% branch coverage
    functions: 50,   // Require 50% function coverage
    lines: 50,      // Require 50% line coverage
    statements: 50, // Require 50% statement coverage
  },
}
```

## Local Coverage Reports

To view coverage locally:

```bash
# Generate coverage report
yarn test:coverage

# Open HTML report (macOS)
open coverage/lcov-report/index.html

# Open HTML report (Linux)
xdg-open coverage/lcov-report/index.html

# Open HTML report (Windows)
start coverage/lcov-report/index.html
```

## Troubleshooting

**Coverage not showing in GitHub Actions:**

- Check that the workflow file exists at `.github/workflows/test-coverage.yml`
- Verify the workflow ran successfully (check Actions tab)
- Ensure `yarn test:coverage` works locally

**Codecov badge not updating:**

- Verify `CODECOV_TOKEN` secret is set correctly
- Check that Codecov workflow step completed without errors
- Wait a few minutes after the workflow completes (badge updates can be delayed)

**Coverage percentages seem incorrect:**

- Check `collectCoverageFrom` in `jest.config.js` to ensure correct files are included
- Verify test files are excluded from coverage (`!src/**/*.test.{ts,tsx}`)
- Run `yarn test:coverage` locally to verify
