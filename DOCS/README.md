# 📚 Documentation Index

Welcome to the Orion Task System documentation! This directory contains comprehensive documentation organized by category.

---

## 🚀 New Developer? Start Here!

👉 **[GETTING-STARTED.md](GETTING-STARTED.md)** - Complete onboarding guide (setup to first PR in 30 minutes)

📋 **[DOCUMENTATION-STRUCTURE.md](DOCUMENTATION-STRUCTURE.md)** - Visual overview of all documentation

---

## 📁 Directory Structure

### 🏗️ Architecture (`architecture/`)

System architecture, components, and design decisions:

| Document | Purpose |
|----------|---------|
| **[AWS Architecture](architecture/aws-architecture.md)** | AWS services, data flow, conflict resolution |
| **[Component Library](architecture/component-library.md)** | Component organization, principles, patterns |
| **[Project Structure](architecture/project-structure.md)** | Directory structure explained |
| **[Service Consolidation](architecture/service-consolidation.md)** | Service layer organization |
| **[Component Consolidation](architecture/component-consolidation-RESOLVED.md)** | Component consolidation (resolved Dec 23, 2024) |
| **[Architectural Review](architecture/architectural-review-2025-01-03.md)** | Recent architecture review & recommendations |
| **[Cody Overview](architecture/cody-overview.md)** | AI assistant integration |

### 💻 Development (`development/`)

Coding standards, testing, and development guides:

| Document | Purpose | Priority |
|----------|---------|----------|
| **[Development Guidelines](development/development-guidelines.md)** | Coding standards, best practices | 🔥 REQUIRED |
| **[Testing Guide](development/testing.md)** | Unit test requirements, examples | 🔥 REQUIRED |
| **[Any Type Analysis](development/any-type-analysis.md)** | TypeScript `any` elimination plan | ⭐ Important |
| **[Coverage Setup](development/coverage-setup.md)** | GitHub Actions coverage reporting | - |
| **[Logging Service](development/logging-service.md)** | Centralized logging | - |
| **[Font System](development/font-system.md)** | Font constants & usage | - |
| **[Testing Coordinated Seeding](development/testing-coordinated-seeding.md)** | Seeding feature tests | - |
| **[Testing Sync](development/testing-sync.md)** | Sync functionality tests | - |
| **[Docstring Coverage](development/docstring-coverage.md)** | JSDoc coverage tracking | - |
| **[Any Elimination Roadmap](development/any-elimination-roadmap.md)** | TypeScript improvement plan | - |

### ✨ Features (`features/`)

Feature-specific documentation and implementation details:

| Document | Purpose | Priority |
|----------|---------|----------|
| **[Implementation Status](features/implementation-status.md)** | What's built / not built | 🔥 READ FIRST |
| **[Task System Package](features/task-system-package.md)** | @orion/task-system package docs | ⭐ Important |
| **[Translations](features/translations.md)** | i18n system documentation | ⭐ Important |
| **[Task System Fixture](features/task-system-fixture-and-hydration.md)** | Fixture generation & hydration | - |
| **[Translation Memory](features/translation-memory.md)** | Translation service & memory | - |
| **[Analytics](features/analytics-implementation.md)** | User engagement analytics | - |
| **[Image Storage S3](features/image-storage-s3-setup.md)** | S3 image storage setup | - |
| **[Temp Answer Mutation](features/temp-answer-graphql-mutation.md)** | Temp answer GraphQL mutation | - |

### 📋 Planning (`planning/`)

Roadmaps, todos, and planning documents:

| Document | Purpose | Priority |
|----------|---------|----------|
| **[Roadmap](planning/roadmap.md)** | Development priorities | 🔥 CHECK OFTEN |
| **[Todos](planning/todos.md)** | Current task list | ⭐ Important |
| **[Current Rule Logic](planning/current-rule-logic.md)** | Rule engine planning | - |
| **[Component Documentation Plan](planning/component-documentation-plan.md)** | Component doc roadmap | - |
| **[TypeScript Errors](planning/typescript-errors-remaining.md)** | TS migration tracking | - |
| **[TypeScript Progress](planning/typescript-fix-progress.md)** | TS fix history | - |

### 🧪 Testing (`testing/`)

Test coverage, guides, and progress tracking:

| Document | Purpose |
|----------|---------|
| **[POC JSON Loading Guide](testing/poc-json-loading-guide.md)** | Load POC tasks for testing |
| **[Test Progress Summary](testing/test-progress-summary.md)** | Coverage progress tracking |
| **[Component Test Coverage](testing/component-test-coverage-status.md)** | Component coverage status |
| **[Comprehensive Testing Progress](testing/comprehensive-testing-progress.md)** | Overall testing progress |
| **[Remaining TestID Work](testing/remaining-testid-work.md)** | TestID tracking |
| **[Verify POC Tasks](testing/verify-poc-tasks-loaded.md)** | POC task verification |

### 🔧 Troubleshooting (`troubleshooting/`)

Common issues, fixes, and debugging guides:

| Document | Purpose | Priority |
|----------|---------|----------|
| **[Native Build Fixes](troubleshooting/native-build-fixes.md)** | iOS/Android build fixes | 🔥 REQUIRED |
| **[Image Storage Error](troubleshooting/image-storage-native-module-error.md)** | Image storage issues | - |
| **[Unauthorized Error](troubleshooting/troubleshooting-unauthorized.md)** | AWS auth issues | - |

### 🔗 Integration (`integration/`)

External service integrations:

| Document | Purpose |
|----------|---------|
| **[LX Image Storage](integration/lx-image-storage-setup.md)** | LX image storage integration |

### 🧹 Cleanup (`cleanup/`)

Cleanup tracking and completed work:

| Document | Purpose |
|----------|---------|
| **[Documentation Consolidation](cleanup/documentation-consolidation-plan.md)** | Doc cleanup plan (Jan 4, 2025) |
| **[Template Cleanup](cleanup/template-cleanup-completed.md)** | Expo template cleanup (Jan 3, 2025) |

### 📝 Code Reviews (`code_reviews/`)

Historical code review archives:

| Document | Purpose |
|----------|---------|
| **[CodeRabbit PR#37](code_reviews/CODERABBIT_PR37_COMMENTS.md)** | PR#37 review comments |

### 📄 Root-Level Docs

| Document | Purpose |
|----------|---------|
| **[E2E Testing](e2e-testing.md)** | Playwright & Maestro E2E tests |
| **[Ephemeral Environments](ephemeral-environments.md)** | Temporary environment setup |
| **[Performance Improvements](performance-improvements-priority-1.md)** | Critical performance fixes |

---

## 🎯 Quick Reference by Task

### I want to...

| Task | Document |
|------|----------|
| **Get started as new developer** | [GETTING-STARTED.md](GETTING-STARTED.md) |
| **Understand the architecture** | [AWS Architecture](architecture/aws-architecture.md) |
| **Learn coding standards** | [Development Guidelines](development/development-guidelines.md) |
| **Write tests** | [Testing Guide](development/testing.md) |
| **See what's implemented** | [Implementation Status](features/implementation-status.md) |
| **Check priorities** | [Roadmap](planning/roadmap.md) |
| **Fix build issues** | [Native Build Fixes](troubleshooting/native-build-fixes.md) |
| **Understand components** | [Component Library](architecture/component-library.md) |
| **Add translations** | [Translations](features/translations.md) |
| **Debug auth issues** | [Troubleshooting Unauthorized](troubleshooting/troubleshooting-unauthorized.md) |

---

## 🔍 Finding Documentation

- **Architecture questions?** → `architecture/`
- **Development setup?** → `development/`
- **Feature details?** → `features/`
- **Having issues?** → `troubleshooting/`
- **Planning work?** → `planning/`
- **Need tests?** → `testing/`
- **External integrations?** → `integration/`

**Can't find what you need?** Check [DOCUMENTATION-STRUCTURE.md](DOCUMENTATION-STRUCTURE.md) for complete visual overview.

---

## 📝 Contributing to Documentation

### Quick Fixes

Small typos, broken links, minor clarifications:
- Fix directly and commit with message: `docs: fix typo in X.md`

### Larger Changes

New guides, restructuring, major updates:
1. Create branch: `docs/your-change`
2. Place in appropriate subdirectory
3. Update this README with link
4. Update [DOCUMENTATION-STRUCTURE.md](DOCUMENTATION-STRUCTURE.md) if needed
5. Create PR with description

### Documentation Standards

✅ **DO:**
- Use clear, scannable headings
- Add tables for comparisons
- Include code examples
- Link to actual code files
- Add dates to time-sensitive info
- Keep it concise and current

❌ **DON'T:**
- Duplicate existing docs (update instead)
- Create temp status docs (use PRs)
- Document things well-explained in code
- Copy external docs (link instead)

### File Naming

```bash
lowercase-with-hyphens.md     # ✅ Good
camelCaseFile.md              # ❌ Bad
UPPERCASE_FILE.md             # ❌ Bad
spaces in name.md             # ❌ Bad
```

---

## 📊 Documentation Stats

**Last Updated**: January 4, 2025  
**Total Files**: 45 documents  
**Recent Cleanup**: Removed 9 duplicate/outdated files (35% reduction)

### By Category

| Category | Files | Description |
|----------|-------|-------------|
| Architecture | 7 | System design & structure |
| Development | 10 | Coding standards & guides |
| Features | 8 | Feature documentation |
| Planning | 6 | Roadmap & todos |
| Testing | 6 | Test coverage & guides |
| Troubleshooting | 3 | Common issues & fixes |
| Integration | 1 | External integrations |
| Cleanup | 2 | Cleanup tracking |
| Code Reviews | 1 | Review archives |
| Root | 3 | Miscellaneous |

---

## 🆘 Need Help?

| Question | Answer |
|----------|--------|
| Where do I start? | [GETTING-STARTED.md](GETTING-STARTED.md) |
| How do I find specific info? | Search in editor (`Cmd/Ctrl+Shift+F`) |
| Doc is outdated | Update it! Use `docs: update X.md` commit message |
| Can't find what I need | Ask in team Slack/chat |
| Want to add new doc | Follow "Contributing to Documentation" above |

---

**Welcome to the team! 🎉 Start with [GETTING-STARTED.md](GETTING-STARTED.md) and you'll be productive in 30 minutes.**
