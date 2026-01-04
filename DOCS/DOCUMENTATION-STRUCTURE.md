# Documentation Structure

**Last Updated**: January 4, 2025  
**Total Files**: 45 documents (cleaned up from 54)

---

## Quick Navigation

| I want to... | Go to |
|--------------|-------|
| **Get started as a new developer** | [`GETTING-STARTED.md`](GETTING-STARTED.md) |
| **Understand the architecture** | [`architecture/`](architecture/) |
| **Learn coding standards** | [`development/development-guidelines.md`](development/development-guidelines.md) |
| **Write tests** | [`development/testing.md`](development/testing.md) |
| **See what's implemented** | [`features/implementation-status.md`](features/implementation-status.md) |
| **Check the roadmap** | [`planning/roadmap.md`](planning/roadmap.md) |
| **Fix a build issue** | [`troubleshooting/`](troubleshooting/) |

---

## Directory Structure

```
DOCS/
├── 📄 GETTING-STARTED.md              ← START HERE (new developers)
├── 📄 README.md                       ← Documentation index
├── 📄 DOCUMENTATION-STRUCTURE.md      ← This file
├── 📄 e2e-testing.md                  ← E2E testing overview
├── 📄 ephemeral-environments.md       ← Ephemeral environment setup
├── 📄 performance-improvements-priority-1.md  ← Critical performance fixes
│
├── 📁 architecture/                   ← System design & structure (7 files)
│   ├── architectural-review-2025-01-03.md
│   ├── aws-architecture.md            ← AWS services & data flow
│   ├── cody-overview.md
│   ├── component-consolidation-RESOLVED.md
│   ├── component-library.md           ← UI component patterns
│   ├── project-structure.md           ← Directory structure
│   └── service-consolidation.md
│
├── 📁 cleanup/                        ← Cleanup tracking (2 files)
│   ├── documentation-consolidation-plan.md
│   └── template-cleanup-completed.md
│
├── 📁 code_reviews/                   ← Code review archives (1 file)
│   └── CODERABBIT_PR37_COMMENTS.md
│
├── 📁 development/                    ← Coding standards & guides (10 files)
│   ├── development-guidelines.md      ← READ THIS (coding standards)
│   ├── testing.md                     ← Testing guide (mandatory)
│   ├── testing-coordinated-seeding.md
│   ├── testing-sync.md
│   ├── any-elimination-roadmap.md     ← TypeScript any removal plan
│   ├── any-type-analysis.md
│   ├── coverage-setup.md
│   ├── docstring-coverage.md
│   ├── font-system.md
│   └── logging-service.md
│
├── 📁 features/                       ← Feature documentation (8 files)
│   ├── implementation-status.md       ← What's built / not built
│   ├── task-system-package.md         ← @orion/task-system package
│   ├── task-system-fixture-and-hydration.md
│   ├── translations.md                ← i18n system
│   ├── translation-memory.md
│   ├── analytics-implementation.md
│   ├── image-storage-s3-setup.md
│   └── temp-answer-graphql-mutation.md
│
├── 📁 integration/                    ← Integration guides (1 file)
│   └── lx-image-storage-setup.md
│
├── 📁 planning/                       ← Roadmap & todos (6 files)
│   ├── roadmap.md                     ← Development priorities
│   ├── todos.md                       ← Current todos
│   ├── current-rule-logic.md
│   ├── component-documentation-plan.md
│   ├── typescript-errors-remaining.md
│   └── typescript-fix-progress.md
│
├── 📁 testing/                        ← Test coverage & guides (6 files)
│   ├── poc-json-loading-guide.md
│   ├── test-progress-summary.md
│   ├── component-test-coverage-status.md
│   ├── comprehensive-testing-progress.md
│   ├── remaining-testid-work.md
│   └── verify-poc-tasks-loaded.md
│
└── 📁 troubleshooting/                ← Common issues & fixes (3 files)
    ├── native-build-fixes.md          ← Required for iOS/Android builds
    ├── image-storage-native-module-error.md
    └── troubleshooting-unauthorized.md
```

---

## By Category

### 🚀 Onboarding (Start Here)

| File | Purpose | Priority |
|------|---------|----------|
| [`GETTING-STARTED.md`](GETTING-STARTED.md) | Complete onboarding guide | 🔥 READ FIRST |
| [`development/development-guidelines.md`](development/development-guidelines.md) | Coding standards | 🔥 REQUIRED |
| [`development/testing.md`](development/testing.md) | How to write tests | 🔥 REQUIRED |
| [`architecture/component-library.md`](architecture/component-library.md) | UI component patterns | ⭐ Important |
| [`features/implementation-status.md`](features/implementation-status.md) | What's built | ⭐ Important |

### 🏗️ Architecture & Design

| File | Purpose |
|------|---------|
| [`architecture/aws-architecture.md`](architecture/aws-architecture.md) | AWS services, data flow, conflict resolution |
| [`architecture/component-library.md`](architecture/component-library.md) | Component organization & principles |
| [`architecture/project-structure.md`](architecture/project-structure.md) | Directory structure explained |
| [`architecture/architectural-review-2025-01-03.md`](architecture/architectural-review-2025-01-03.md) | Recent architecture review findings |
| [`architecture/service-consolidation.md`](architecture/service-consolidation.md) | Service layer consolidation |

### 💻 Development

| File | Purpose |
|------|---------|
| [`development/development-guidelines.md`](development/development-guidelines.md) | Coding standards, testing requirements |
| [`development/testing.md`](development/testing.md) | Unit test requirements & examples |
| [`development/logging-service.md`](development/logging-service.md) | Centralized logging |
| [`development/font-system.md`](development/font-system.md) | Font constants & usage |
| [`development/any-type-analysis.md`](development/any-type-analysis.md) | TypeScript any type elimination |
| [`development/coverage-setup.md`](development/coverage-setup.md) | Coverage reporting setup |

### ✨ Features

| File | Purpose |
|------|---------|
| [`features/implementation-status.md`](features/implementation-status.md) | Complete feature status |
| [`features/task-system-package.md`](features/task-system-package.md) | @orion/task-system package docs |
| [`features/translations.md`](features/translations.md) | i18n system documentation |
| [`features/analytics-implementation.md`](features/analytics-implementation.md) | Analytics tracking |
| [`features/image-storage-s3-setup.md`](features/image-storage-s3-setup.md) | S3 image storage setup |

### 📋 Planning & Roadmap

| File | Purpose |
|------|---------|
| [`planning/roadmap.md`](planning/roadmap.md) | High/medium/future priorities |
| [`planning/todos.md`](planning/todos.md) | Current task list |
| [`planning/current-rule-logic.md`](planning/current-rule-logic.md) | Rule engine planning |
| [`planning/typescript-errors-remaining.md`](planning/typescript-errors-remaining.md) | TypeScript migration tracking |

### 🧪 Testing

| File | Purpose |
|------|---------|
| [`development/testing.md`](development/testing.md) | Main testing guide |
| [`e2e-testing.md`](e2e-testing.md) | E2E test setup (Playwright, Maestro) |
| [`testing/poc-json-loading-guide.md`](testing/poc-json-loading-guide.md) | Load POC tasks for testing |
| [`testing/test-progress-summary.md`](testing/test-progress-summary.md) | Coverage progress |

### 🔧 Troubleshooting

| File | Purpose |
|------|---------|
| [`troubleshooting/native-build-fixes.md`](troubleshooting/native-build-fixes.md) | iOS/Android build fixes (required) |
| [`troubleshooting/image-storage-native-module-error.md`](troubleshooting/image-storage-native-module-error.md) | Image storage issues |
| [`troubleshooting/troubleshooting-unauthorized.md`](troubleshooting/troubleshooting-unauthorized.md) | Auth/DataStore issues |

---

## Recent Changes

### January 4, 2025 - Documentation Cleanup

**Deleted 9 files** (exact duplicates and outdated docs):

**Removed Duplicates:**
- ❌ `DOCS/component-library.md` (duplicate of `architecture/component-library.md`)
- ❌ `DOCS/testing.md` (duplicate of `development/testing.md`)
- ❌ `DOCS/task-system-package.md` (duplicate of `features/task-system-package.md`)
- ❌ `DOCS/task-system-fixture-and-hydration.md` (duplicate in features/)

**Removed Outdated Component Consolidation Docs:**
- ❌ `architecture/component-consolidation-plan.md` (resolved Dec 23, 2024)
- ❌ `architecture/component-consolidation-summary.md` (resolved Dec 23, 2024)
- ❌ `architecture/component-duplication-analysis-2025-01-03.md` (resolved)
- ❌ `why-components-outside-package.md` (resolved)

**Removed Redundant Cleanup Doc:**
- ❌ `cleanup/expo-template-cleanup-plan.md` (completed version exists)

**Added New Documents:**
- ✅ `GETTING-STARTED.md` - Comprehensive onboarding guide
- ✅ `DOCUMENTATION-STRUCTURE.md` - This file

**Result**: 35% reduction in doc files, easier navigation, single source of truth

---

## Documentation Standards

### When to Create New Documentation

**DO create docs for:**
- ✅ New architectural patterns or decisions
- ✅ Complex feature implementations
- ✅ Troubleshooting guides for recurring issues
- ✅ Integration guides for external services
- ✅ Development workflows or tools

**DON'T create docs for:**
- ❌ Things already documented elsewhere (update existing instead)
- ❌ Temporary status (use comments or PRs)
- ❌ Things well-explained in code comments
- ❌ External tool docs (link instead)

### File Naming Conventions

```
lowercase-with-hyphens.md     ✅ Good
camelCaseFile.md              ❌ Bad
UPPERCASE_FILE.md             ❌ Bad
spaces in name.md             ❌ Bad
```

### Where to Put New Docs

| Topic | Directory |
|-------|-----------|
| System design, data flow, patterns | `architecture/` |
| Coding standards, tools, how-tos | `development/` |
| Feature documentation | `features/` |
| Future plans, priorities | `planning/` |
| Test guides, coverage | `testing/` |
| Bug fixes, common issues | `troubleshooting/` |
| Integration with external systems | `integration/` |
| Cleanup tracking | `cleanup/` |

### Documentation Update Checklist

When making significant changes:

- [ ] Update relevant docs (don't let them become outdated)
- [ ] Update `DOCS/README.md` if adding new categories
- [ ] Add date stamp to doc: `**Last Updated**: YYYY-MM-DD`
- [ ] Remove or consolidate outdated information
- [ ] Link related docs together
- [ ] Update this structure doc if adding new categories

---

## Maintenance

### Quarterly Review

Every 3 months, review for:
- Outdated information (mark with dates or remove)
- Duplicate content (consolidate)
- Broken links (fix or remove)
- Missing documentation (add)
- Unused docs (archive or remove)

### Signs Doc Needs Updating

- ⚠️ No date stamp or >6 months old
- ⚠️ Describes features that changed
- ⚠️ Has "TODO" or "Coming soon" for things already done
- ⚠️ References removed code or files
- ⚠️ Conflicts with other docs

---

## Contributing to Documentation

### Quick Fixes

Small typos, broken links, minor clarifications:
- Just fix them and commit directly
- Use commit message: `docs: fix typo in X.md`

### Larger Changes

New guides, restructuring, major updates:
1. Create a branch: `docs/your-change`
2. Make changes
3. Update this structure doc if needed
4. Create PR with description of changes
5. Get review from team

### Style Guide

- **Use clear headings** - Make it scannable
- **Use tables** - Great for comparisons and lists
- **Use code blocks** - Show, don't just tell
- **Use emoji sparingly** - Only for quick visual categorization
- **Link to code** - Reference actual files with line numbers
- **Add examples** - Real-world examples beat theory
- **Keep it current** - Add dates, remove outdated info
- **Be concise** - Developers are busy, respect their time

---

## Need Help?

| Question | Answer |
|----------|--------|
| Where do I start? | [`GETTING-STARTED.md`](GETTING-STARTED.md) |
| How do I find specific info? | Use search in your editor (`Cmd/Ctrl+Shift+F`) |
| Doc is outdated | Update it! Use commit message `docs: update X.md` |
| Can't find what I need | Ask in Slack or create an issue |
| Want to add new doc | Follow "Where to Put New Docs" above |

---

**This documentation structure was cleaned up on January 4, 2025 to reduce confusion and improve developer onboarding.**
