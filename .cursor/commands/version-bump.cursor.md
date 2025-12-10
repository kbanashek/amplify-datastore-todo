# Version Bump

Bump version and create new branch with commit and push.

## Usage

Run this command and provide:
1. **Bump type**: `patch`, `minor`, or `major`
2. **Commit message**: Description of changes (optional)

## Examples

- `patch` - Bug fixes, small changes (0.0.1 → 0.0.2)
- `minor` - New features, non-breaking (0.0.1 → 0.1.0)  
- `major` - Breaking changes (0.0.1 → 1.0.0)

## What it does

1. Detects current version from branch name
2. Creates new version branch
3. Stages all changes
4. Commits with versioned message
5. Pushes to origin

