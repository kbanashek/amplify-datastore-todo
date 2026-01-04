# Unused Files Analysis

**Last Updated:** 2025-01-04

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

**Root-level files deleted: 22 files**

- ✅ 1 duplicate utility file (questionValidation.ts)
- ✅ 3 Expo template components (HapticTab, ThemedText, ThemedView)
- ✅ 18 Expo template UI files (components/ui/)

**Hooks remaining (exported but only used by harness):**

These hooks are exported from the package for use by consuming applications:

1. `hooks/useActivityList.ts` - Used in harness, available for LX teams
2. `hooks/useQuestionList.ts` - Available for LX teams
3. `hooks/useTaskAnswerList.ts` - Used in harness, available for LX teams
4. `hooks/useTaskHistoryList.ts` - Used in harness, available for LX teams
5. `hooks/useTaskResultList.ts` - Used in harness, available for LX teams

**Decision:** Keeping these hooks as they are part of the package's public API.

**Total files deleted: 27 files**

**Remaining exported hooks: 5 hooks** (intentionally kept as public API)
