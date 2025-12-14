# Unused Files Analysis

This document lists files that are not being used by the application.

## Package-Level Unused Files (`packages/task-system/src/src/`)

### Components (Excluded from build per tsconfig.build.json)

These components are not imported or used by `TaskActivityModule`:

1. ✅ **DELETED**: `components/AppointmentsGroupedView.tsx` - Not exported, not used
2. ✅ **DELETED**: `components/TodoForm.tsx` - Todo components removed from package
3. ✅ **DELETED**: `components/TodoList.tsx` - Todo components removed from package
4. `components/TaskList.tsx` - Not imported anywhere in package
5. `components/TasksView.tsx` - Not imported anywhere in package

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

## Root-Level Potentially Unused Files

### Components

1. `src/components/AppointmentsGroupedView.tsx` - Only has a test file, not used in app
2. `src/components/AppointmentsGroupedView.test.tsx` - Test for unused component

### Note

- The root app uses `GroupedTasksView` instead, which handles both tasks and appointments together

## Summary

**Package-level unused files: 10 files**

- 4 components (1 already deleted)
- 5 hooks

**Root-level potentially unused files: 2 files**

- 1 component + 1 test

**Total: 12 files** (1 already deleted, 11 remaining)
