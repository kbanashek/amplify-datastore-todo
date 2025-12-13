# Version Bump

Bump version and create new branch with commit and push.

## Usage

Run this command and provide:

1. **Bump type**: `patch`, `minor`, or `major`
2. **Commit message**: **REQUIRED** - Meaningful description of changes

## Examples

- `patch` - Bug fixes, small changes (0.0.1 → 0.0.2)
  - Example: `patch "Fix task sync issue with DataStore"`
- `minor` - New features, non-breaking (0.0.1 → 0.1.0)
  - Example: `minor "Add task grouping by date and time with icons"`
- `major` - Breaking changes (0.0.1 → 1.0.0)
  - Example: `major "Refactor task service architecture"`

## Commit Message Guidelines

**⚠️ Commit messages are REQUIRED and must be meaningful:**

- ✅ **Good**: "Add task grouping by date and time", "Fix DataStore sync issue", "Update task card UI with icons"
- ❌ **Bad**: "update", "changes", "fix", empty messages

Commit messages should:

- Be descriptive and explain what changed
- Use present tense ("Add" not "Added")
- Be concise but informative
- Focus on the "what" and "why" of changes

## What it does

1. Detects current version from branch name
2. Validates commit message is provided and meaningful
3. Creates new version branch
4. Stages all changes
5. Commits with versioned message (format: `vX.Y.Z: [your message]`)
6. Pushes to origin

update changelog.md with all changes made in branch before commiting:

- update with detailed functionality added
- update with bug fixes
- update with performance improvements
- update with dependency updates
- update with documentation improvements
- update with code refactoring
- update with test improvements
- update with CI/CD improvements
- update with deployment improvements
- update with security improvements
- update with any other notable changes
