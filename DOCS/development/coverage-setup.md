# Test Coverage Setup Guide

This guide explains how test coverage is displayed in the GitHub repository.

## Overview

The project uses Jest for test coverage generation and displays coverage reports in multiple ways:

1. **GitHub Actions** - Automated coverage generation on every push/PR
2. **Coverage Artifacts** - Downloadable HTML reports from workflow runs

**Note:** Codecov integration has been removed as it requires security sign-off for third-party services. All coverage reporting is handled via GitHub Actions.

## Current Setup

### GitHub Actions Workflow

The `.github/workflows/test-coverage.yml` workflow automatically:

- Runs tests with coverage on every push to `main`/`develop` and on pull requests
- Generates coverage reports in multiple formats (HTML, LCOV, text)
- **Posts coverage summary as a comment on pull requests** (automatic)
- Uploads coverage reports as downloadable artifacts
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

## Codecov Integration (Removed)

Codecov integration has been removed from this project as it requires security sign-off for third-party services. Coverage reports contain file paths, code structure, and execution details that may be considered sensitive.

**Alternative:** All coverage reporting is handled via GitHub Actions:

- PR comments with coverage summaries
- Downloadable HTML reports from workflow artifacts
- Coverage summary in workflow run details

If Codecov is needed in the future, it will require:

1. Security team approval
2. Review of data sharing agreements
3. Configuration of `CODECOV_TOKEN` secret

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

**Coverage percentages seem incorrect:**

- Check `collectCoverageFrom` in `jest.config.js` to ensure correct files are included
- Verify test files are excluded from coverage (`!src/**/*.test.{ts,tsx}`)
- Run `yarn test:coverage` locally to verify
