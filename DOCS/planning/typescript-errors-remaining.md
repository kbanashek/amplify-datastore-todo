# TypeScript Errors - Remaining Work

**Status:** 189 → 79 errors (-110, 58% complete)  
**Branch:** `kyle.banashek/fix/zero-typescript-errors`  
**Date:** 2025-12-27

## Progress Summary

### ✅ Completed (110 errors fixed)

1. **Zero-errors cursor rule created** (`.cursor/rules/zero-errors.mdc`)
2. **All story file decorator types** (12 files)
3. **All story file render function types** (50+ instances)
4. **SimpleStorybook component props** (10 errors)
5. **TextQuestion/MultiSelectQuestion imports** (4 files)
6. **answerFormatting.test.ts** (6 errors)
7. **TaskCard/AppointmentCard story files** (pk/sk properties, type imports)
8. **Invalid properties removed** (screenIndex, questionType)

### 🔴 Remaining (79 errors)

#### Test Files (50+ errors)

**Pattern:** `unknown` types, spread type errors, mock signature mismatches

**Files:**

- `TasksView.test.tsx` (8 errors) - `task` is of type `unknown`
- `TaskList.test.tsx` (8 errors) - `task` is of type `unknown`
- `GroupedTasksView.test.tsx` (7 errors) - `appointment` is of type `unknown`
- `QuestionHeader.test.tsx` (3 errors) - Spread types from object types
- `GlobalHeader.test.tsx` (3 errors) - Spread types from object types
- `AppointmentCard.test.tsx` (2 errors) - Spread types from object types
- `TaskContainer.test.tsx` (1 error) - `groupedTasks` is of type `unknown`
- `TaskForm.test.tsx` (1 error) - Mock type mismatch
- `QuestionScreenContent.test.tsx` (2 errors) - `element` is of type `unknown`

**Fix Strategy:**

```typescript
// ❌ Bad
const task = result.current.tasks[0]; // type: unknown
expect(task.title).toBe("Test Task"); // Error: 'task' is of type 'unknown'

// ✅ Good
const task = result.current.tasks[0] as Task;
expect(task.title).toBe("Test Task");

// Or better - type the mock properly
jest.mock("@hooks/useTaskList", () => ({
  useTaskList: jest.fn<ReturnType<typeof useTaskList>, []>(() => ({
    tasks: mockTasks as Task[],
    // ...
  })),
}));
```

#### Service Files (8 errors)

**Files:**

- `FixtureImportService.ts` (5 errors)
  - `LazyActivity` has no properties in common with `{ _lastChangedAt?: number }`
  - `Task` is not assignable to `LazyTask` (missing `[__modelMeta__]`)
  - `TModel` is not assignable to `Readonly<Record<string, any>>`
- `ConflictResolution.ts` (1 error)
  - `DataStoreModel | null` not assignable to `Partial<{ _deleted: true; ... }>`
  - Type `boolean | undefined` not assignable to `true | undefined`

**Fix Strategy:**

```typescript
// ConflictResolution.ts - Fix _deleted type
return ensurePkSk(
  { ...safeRemote, _deleted: true as const } as DataStoreModel,
  safeLocal
);

// FixtureImportService.ts - Add type assertions
await DataStore.save(
  Task.copyOf(task, updated => {
    // ...
  }) as LazyTask
);
```

#### Service Test Files (8 errors)

**Files:**

- `ActivityService.test.ts` (1 error) - `[__modelMeta__]` type mismatch
- `DataPointService.test.ts` (4 errors) - `[__modelMeta__]`, invalid properties
- `TaskAnswerService.test.ts` (2 errors) - `[__modelMeta__]`, `_deleted` property
- `TaskHistoryService.test.ts` (2 errors) - `[__modelMeta__]`, `_deleted` property
- `TaskResultService.test.ts` (2 errors) - `[__modelMeta__]`, `_deleted` property
- `TaskService.test.ts` (2 errors) - Cannot find name `Task`

**Fix Strategy:**

```typescript
// Remove [__modelMeta__] from test mocks - it's internal to DataStore
const mockActivity = {
  id: "test-1",
  pk: "ACTIVITY#test-1",
  sk: "ACTIVITY#test-1",
  // ... other properties
  // ❌ Don't include: [__modelMeta__]: { ... }
};

// For _deleted property in Partial types
DataPoint.copyOf(dataPoint, (updated: any) => {
  updated._deleted = true;
});
```

#### Component Files (5 errors)

**Files:**

- `WeightHeightQuestion.tsx` (4 errors)
- `UnitText.tsx` (1 error)
- `SingleSelectQuestion.stories.tsx` (3 errors)
- `SimpleStorybook.tsx` (3 errors)

#### Hook Files (2 errors)

**Files:**

- `useAnswerManagement.ts` (1 error)
  - `Record<string, unknown>` not assignable to `Record<string, AnswerValue>`

## Action Plan

### Phase 1: Test Files (Priority 1)

1. Fix all `unknown` type assertions in component tests
2. Fix spread type errors in test utilities
3. Fix mock signature mismatches

### Phase 2: Service Files (Priority 2)

1. Fix `ConflictResolution.ts` `_deleted` type with `as const`
2. Fix `FixtureImportService.ts` type assertions
3. Remove `[__modelMeta__]` from all test mocks

### Phase 3: Component/Hook Files (Priority 3)

1. Fix remaining component type issues
2. Fix hook type issues

## Commands to Run

```bash
# Check remaining errors
yarn check:types 2>&1 | grep "error TS" | wc -l

# Check specific file
yarn check:types 2>&1 | grep "TasksView.test.tsx"

# Run tests after fixes
yarn test

# Final verification
yarn check:types && yarn lint
```

## Expected Timeline

- **Phase 1:** ~30-40 errors (1-2 hours)
- **Phase 2:** ~15-20 errors (30-60 min)
- **Phase 3:** ~10-15 errors (30 min)

**Total:** 79 errors, estimated 2-3 hours of focused work

## Notes

- Pre-commit hook correctly blocks commits until 0 errors
- Zero-errors rule enforces this standard going forward
- All fixes must maintain test functionality
- Type assertions should be minimal and justified
