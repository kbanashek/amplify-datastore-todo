# Root vs Package Boundaries

**Last Updated:** 2025-01-04

## Overview

This document clarifies the organizational boundaries between the root `src/` directory and the `packages/task-system/src/` directory, explaining when to add code to each location.

## Directory Structure

```
orion-task-system/
├── src/                           # Root source directory (harness/test app)
│   ├── amplify-config.ts          # Amplify configuration for harness
│   ├── amplify-init.ts            # Amplify initialization for harness
│   ├── bootstrap/                 # Harness-specific bootstrap logic
│   ├── components/                # Harness-specific components
│   ├── screens/                   # Harness app screens
│   ├── contexts/                  # Harness-specific contexts
│   └── ...                        # Other harness-specific files
│
└── packages/
    └── task-system/               # Reusable package (single source of truth)
        ├── src/
        │   ├── modules/           # Module wrappers (TaskActivityModule)
        │   ├── components/        # Reusable UI components
        │   ├── hooks/             # Reusable React hooks
        │   ├── services/          # Business logic services
        │   ├── schemas/           # Validation schemas (Zod)
        │   ├── types/             # TypeScript type definitions
        │   ├── utils/             # Utility functions
        │   ├── constants/         # Constants and enums
        │   ├── contexts/          # Reusable contexts
        │   ├── translations/      # i18next translation system
        │   ├── screens/           # Reusable screens
        │   ├── models/            # DataStore model types
        │   ├── fixtures/          # Test fixtures
        │   ├── polyfills/         # Polyfills for compatibility
        │   ├── runtime/           # Runtime initialization
        │   ├── __mocks__/         # Test mocks
        │   └── index.ts           # Package exports (public API)
        ├── docs/                  # Package documentation (MDX)
        ├── config/                # Package configuration files
        └── package.json           # Package metadata
```

## Root `src/` - Harness Application

### Purpose

The root `src/` directory contains a **test/demo harness application** that exercises the task-system package. It serves as:

- Development playground for testing package features
- Integration testing environment
- Demo application for stakeholders
- Example of how to consume the package

### When to Add Code to Root `src/`

Add code to root `src/` when it is:

1. **Harness-specific** - Only needed for the test/demo app
2. **Amplify bootstrap** - App-level Amplify configuration and initialization
3. **Test/demo scenarios** - Specific test cases or demo flows
4. **App-level state management** - Navigation, app-wide contexts specific to harness
5. **Development utilities** - Tools for development/debugging the harness

### Examples of Root `src/` Code

- `src/amplify-config.ts` - Amplify configuration for harness
- `src/amplify-init.ts` - Amplify initialization for harness
- `src/bootstrap/` - Harness-specific bootstrap logic
- `src/components/` - Harness-specific components (e.g., app shell, dev tools)
- `src/screens/` - Harness app screens
- `src/contexts/` - Harness-specific contexts

## Package `packages/task-system/src/` - Reusable Package

### Purpose

The `packages/task-system/src/` directory contains the **reusable task-system package** intended for consumption by LX teams and other host applications. It is the **single source of truth** for:

- Task management components and logic
- Activity configuration and parsing
- Question flow and rendering
- AWS Amplify DataStore integration
- Translation system
- UI components

### When to Add Code to Package

Add code to the package when it is:

1. **Reusable** - Needed by multiple host applications
2. **Core business logic** - Task management, activity parsing, etc.
3. **UI components** - Reusable components for tasks, questions, etc.
4. **Data layer** - Services, hooks, DataStore interactions
5. **Type definitions** - Shared types and interfaces
6. **Utilities** - General-purpose utility functions

### Examples of Package Code

- `packages/task-system/src/modules/TaskActivityModule.tsx` - Main entry point for host apps
- `packages/task-system/src/components/` - Reusable UI components
- `packages/task-system/src/services/` - Business logic services
- `packages/task-system/src/hooks/` - Reusable React hooks
- `packages/task-system/src/types/` - TypeScript type definitions
- `packages/task-system/src/schemas/` - Validation schemas

## Decision Matrix

| Characteristic    | Root `src/`           | Package `src/`                |
| ----------------- | --------------------- | ----------------------------- |
| **Reusability**   | Single app (harness)  | Multiple apps (LX teams)      |
| **Purpose**       | Testing/demo          | Production use                |
| **Dependencies**  | Can depend on package | Should minimize external deps |
| **Exports**       | Not exported          | Exported via `index.ts`       |
| **Testing**       | Manual/integration    | Unit + integration            |
| **Documentation** | Minimal               | Comprehensive                 |
| **Versioning**    | Not versioned         | Versioned via package.json    |

## Package Public API

The package exposes its public API through `packages/task-system/src/index.ts`. This file defines what's available to consuming applications.

### Exported Categories

1. **Module Wrapper**: `TaskActivityModule` - Main entry point
2. **Components**: Reusable UI components
3. **Services**: Business logic services
4. **Hooks**: React hooks for state management
5. **Types**: TypeScript type definitions
6. **Constants**: Enums and constants
7. **Contexts**: React contexts
8. **Translation System**: i18next-based translation system
9. **Runtime Initialization**: `initTaskSystem`, configuration
10. **Fixtures**: Test fixtures for integration testing

### Internal vs External

- **Internal**: Implementation details not exported from `index.ts`
- **External**: Public API exported from `index.ts`
- **Rule**: Only add to `index.ts` if it's intended for host apps

## Migration Guidelines

### Moving Code from Root to Package

If you find code in root `src/` that should be in the package:

1. **Identify dependencies** - What does it depend on?
2. **Refactor if needed** - Remove harness-specific dependencies
3. **Move to appropriate package directory** - Follow package structure
4. **Add to package exports** - If it's part of public API
5. **Update imports** - In harness and any other consumers
6. **Add tests** - Ensure proper test coverage
7. **Document** - Update relevant documentation

### Moving Code from Package to Root

If you find code in the package that's only used by harness:

1. **Verify it's truly harness-only** - Check all consumers
2. **Remove from package exports** - Update `index.ts`
3. **Move to root `src/`** - Appropriate subdirectory
4. **Update imports** - In harness code
5. **Clean up tests** - Keep only package-relevant tests

## Best Practices

### For Package Development

1. **Think reusability** - Will other teams need this?
2. **Minimize dependencies** - Keep package lean
3. **Document public API** - Clear JSDoc comments
4. **Version carefully** - Breaking changes require major version bump
5. **Test thoroughly** - Unit and integration tests
6. **Export selectively** - Only expose what's needed

### For Harness Development

1. **Import from package** - Always use package exports, not internal paths
2. **Keep it simple** - Harness is for testing, not production features
3. **Document testing scenarios** - What are you testing?
4. **Don't duplicate** - If package has it, use it
5. **Provide feedback** - Harness usage reveals package issues

## Common Patterns

### Pattern 1: Shared Component

**Question**: Where should a new TaskCard variant go?

**Answer**: Depends on reusability:

- If all apps need it → `packages/task-system/src/components/`
- If only harness needs it → `src/components/`
- If it's configurable → Add props to existing TaskCard

### Pattern 2: New Service

**Question**: Where should a new reporting service go?

**Answer**: Depends on scope:

- If it's core task management → `packages/task-system/src/services/`
- If it's harness analytics → `src/services/`

### Pattern 3: Utility Function

**Question**: Where should a date formatting function go?

**Answer**: Consider reusability:

- If generally useful → `packages/task-system/src/utils/`
- If harness-specific format → `src/utils/`
- If already exists in package → Use it!

## Related Documentation

- [Project Structure](./project-structure.md) - Detailed directory structure
- [Service Consolidation](./service-consolidation.md) - Service architecture
- [Package Architecture](../../.cursor/rules/architecture.mdc) - Package design principles
- [Component Architecture](../../.cursor/rules/react-native.mdc) - Component patterns

## Changelog

| Date       | Change                   |
| ---------- | ------------------------ |
| 2025-01-04 | Initial document created |
