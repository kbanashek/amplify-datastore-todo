# CMP - Commit, Merge, Push Workflow

This command creates a new branch, commits changes, pushes to remote, and optionally opens a pull request.

## Usage

```
@CMP <branch-name> <commit-message>
```

## Example

```
@CMP refactor/update-components "Update component architecture and add new features"
```

## What it does

1. Creates a new branch with the specified name
2. Stages all changes (`git add -A`)
3. Commits with the provided message
4. Pushes the branch to remote
5. If GitHub CLI (`gh`) is available, opens a pull request to `develop` branch
6. Otherwise, provides the PR URL for manual creation

## Parameters

- `branch-name`: The name of the feature branch (e.g., `feature/new-feature`, `refactor/update-code`)
- `commit-message`: The commit message describing the changes

## Notes

- The PR will be opened against the `develop` branch by default
- If GitHub CLI is not installed, you'll need to manually create the PR using the URL provided
- The branch name should follow your project's naming conventions
- Install GitHub CLI with: `brew install gh` (macOS) or see https://cli.github.com/

