# CMP - Commit, Merge, Push Workflow

This command creates a new branch, commits changes, pushes to remote, and optionally opens a pull request.

## Usage

```
@CMP <description> <commit-message>
```

## Example

```
@CMP update-components "Update component architecture and add new features"
```

## What it does

1. Creates a new branch with `{username}/feature/{description}` (where `{username}` is your GitHub username and `{description}` is provided by cursor)
2. Stages all changes (`git add -A`)
3. Updates `CHANGELOG.md` with the changes & update README.md if necessary
4. Commits with the provided message
5. Pushes the branch to remote
6. If GitHub CLI (`gh`) is available, opens a pull request to `develop` branch
7. Otherwise, provides the PR URL for manual creation

## Parameters

- `description`: The descriptive name for the feature (e.g., `update-components`, `add-new-feature`). Will be appended to `{username}/feature/` to create the full branch name
- `commit-message`: The commit message describing the changes

## Notes

- The PR will be opened against the `develop` branch by default
- If GitHub CLI is not installed, you'll need to manually create the PR using the URL provided
- The branch name will be in the format `{username}/feature/{description}` where username is detected from git config or GitHub CLI
- CHANGELOG.md will be automatically updated with the commit message
- Install GitHub CLI with: `brew install gh` (macOS) or see <https://cli.github.com/>
- The username is automatically detected from your git configuration or GitHub CLI authentication
