# Unused Files Analysis

**Last Updated:** 2025-01-09

This document lists files that are not being used by the application.

## Package-Level Unused Files (`packages/task-system/src/`)

### Components (Excluded from build per tsconfig.build.json)

These components are not imported or used by `TaskActivityModule`:

1. ✅ **DELETED** (2025-01-04): `components/AppointmentsGroupedView.tsx` - Not exported, not used
2. ✅ **DELETED** (2025-01-04): `components/TodoForm.tsx` - Todo components removed from package
3. ✅ **DELETED** (2025-01-04): `components/TodoList.tsx` - Todo components removed from package
4. ✅ **DELETED** (2025-01-04): `components/TaskList.tsx` - Not imported anywhere in package
5. ✅ **DELETED** (2025-01-04): `components/TasksView.tsx` - Not imported anywhere in package

### Hooks (Excluded from build per tsconfig.build.json)

These hooks are only used in root app screens, not by the package:

1. `hooks/useActivityList.ts` - Only used in `app/(tabs)/activities.tsx` (root level)
2. `hooks/useQuestionList.ts` - Not imported anywhere
3. `hooks/useTaskAnswerList.ts` - Only used in `app/(tabs)/task-answers.tsx` (root level)
4. `hooks/useTaskHistoryList.ts` - Only used in `app/(tabs)/task-history.tsx` (root level)
5. `hooks/useTaskResultList.ts` - Only used in `app/(tabs)/task-results.tsx` (root level)

### Notes

- The root app (`src/` directory) has its own copies of these components/hooks that are actually used
- The package versions are excluded from the build and not exported
- These files may have been kept for reference or future use, but are currently unused

## Root-Level Unused Files

### Utilities

1. ✅ **DELETED** (2025-01-04): `src/utils/questionValidation.ts` - Duplicate of package file, not imported anywhere

### Components (Expo Template Files)

All root-level Expo template components have been removed:

1. ✅ **DELETED** (2025-01-04): `components/HapticTab.tsx` - Expo template file
2. ✅ **DELETED** (2025-01-04): `components/ThemedText.tsx` - Expo template file
3. ✅ **DELETED** (2025-01-04): `components/ThemedView.tsx` - Expo template file
4. ✅ **DELETED** (2025-01-04): `components/ui/` (18 files) - Expo template UI files

### Notes

- All functionality has been moved to the package (`packages/task-system/src/components/`)
- The root `src/` directory now only contains harness-specific components

## Summary

**Package-level files deleted: 5 components**

- ✅ AppointmentsGroupedView.tsx
- ✅ TodoForm.tsx
- ✅ TodoList.tsx
- ✅ TaskList.tsx
- ✅ TasksView.tsx

**Root-level files deleted: 26 files**

- ✅ 1 duplicate utility file (questionValidation.ts)
- ✅ 3 Expo template components (HapticTab, ThemedText, ThemedView)
- ✅ 18 Expo template UI files (components/ui/)
- ✅ 4 obsolete test files (ui-button, ui-card, ui-loading-spinner, ui-text-field)

**Hooks remaining (exported but only used by harness):**

These hooks are exported from the package for use by consuming applications:

1. `hooks/useActivityList.ts` - Used in harness, available for LX teams
2. `hooks/useQuestionList.ts` - Available for LX teams
3. `hooks/useTaskAnswerList.ts` - Used in harness, available for LX teams
4. `hooks/useTaskHistoryList.ts` - Used in harness, available for LX teams
5. `hooks/useTaskResultList.ts` - Used in harness, available for LX teams

**Decision:** Keeping these hooks as they are part of the package's public API.

**Total files deleted: 31 files**

**Remaining exported hooks: 5 hooks** (intentionally kept as public API)

---

## January 9, 2025 Cleanup - Duplicate Code Removal

**Goal:** Remove duplicate files from `src/` that shadow package versions

### Duplicate Component Files

1. ✅ **DELETED** (2025-01-09): `src/components/NetworkStatusIndicator.js` - JavaScript duplicate of TypeScript package version
   - Package version: `packages/task-system/src/components/NetworkStatusIndicator.tsx`
   - Root version had hardcoded colors/strings (violates project standards)
   - Package version properly uses translations and AppColors
   - No imports found in codebase - package version is exported and used

### Obsolete Service Files

1. ✅ **DELETED** (2025-01-09): `src/services/logging/serviceLogger.ts` - Old copy left during package consolidation
   - Not imported anywhere in codebase
   - Package has proper version at `packages/task-system/src/services/logging/serviceLogger.ts`

### Duplicate Utility Files

All duplicate of package versions, not imported anywhere in codebase:

1. ✅ **DELETED** (2025-01-09): `src/utils/activityParser.ts` - Duplicate of `packages/task-system/src/utils/activityParser.ts`
2. ✅ **DELETED** (2025-01-09): `src/utils/appointmentParser.ts` - Duplicate of `packages/task-system/src/utils/appointmentParser.ts`
3. ✅ **DELETED** (2025-01-09): `src/utils/deviceLogger.ts` - Duplicate of `packages/task-system/src/utils/deviceLogger.ts`
4. ✅ **DELETED** (2025-01-09): `src/utils/logger.ts` - Duplicate of `packages/task-system/src/utils/logger.ts`
5. ✅ **DELETED** (2025-01-09): `src/utils/platformIcons.ts` - Duplicate of `packages/task-system/src/utils/platformIcons.ts`
6. ✅ **DELETED** (2025-01-09): `src/utils/simpleHash.ts` - Duplicate of `packages/task-system/src/utils/simpleHash.ts`
7. ✅ **DELETED** (2025-01-09): `src/utils/unitLabel.ts` - Duplicate of `packages/task-system/src/utils/unitLabel.ts`

### Obsolete Test Files

Tests for deleted duplicate utilities:

1. ✅ **DELETED** (2025-01-09): `src/utils/__tests__/appointmentParser.test.ts` - Test for deleted duplicate
2. ✅ **DELETED** (2025-01-09): `src/utils/__tests__/simpleHash.test.ts` - Test for deleted duplicate

### Files Kept (Harness-Specific)

These `src/utils/` files are **actively used** by harness-specific code:

1. ✅ **KEPT**: `src/utils/syncUtils.ts` - Used by `src/hooks/useDevOptions.ts`
2. ✅ **KEPT**: `src/utils/taskSystemFixtureGenerator.ts` - Used by `src/hooks/useDevOptions.ts`
3. ✅ **KEPT**: `src/utils/platformLogger.ts` - Used by `src/bootstrap/taskSystemBootstrap.ts`

These are NOT duplicates - they provide harness-specific functionality.

### Summary (January 9, 2025)

**Files deleted:** 10 files

- 1 duplicate component (NetworkStatusIndicator.js)
- 1 obsolete service file (serviceLogger.ts)
- 7 duplicate utility files
- 2 obsolete test files

**Rationale:** Reinforces package-first architecture - the `@orion/task-system` package is the single source of truth for reusable code. Root `src/` directory should only contain harness-specific code that configures and tests the package.

**Impact:** None - comprehensive grep analysis confirmed no imports to deleted files

---

## Grand Total Summary

**Cumulative files deleted:**

- January 4, 2025: 31 files (Expo template cleanup, component consolidation)
- January 9, 2025: 10 files (duplicate code removal)
- **Total: 41 files deleted**

**Current state:**

- Clean separation between package (reusable) and harness (app-specific) code
- No duplicate files shadowing package versions
- All reusable components, services, and utilities in package
- Only harness-specific utilities in root `src/` directory
