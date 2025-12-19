# Testing Guide

## Unit Test Coverage Requirements

**All new code must include unit tests.** This is a **mandatory requirement** for:

- ✅ **Custom Hooks** (`src/hooks/`) - All hooks must have corresponding test files
- ✅ **Services** (`src/services/`) - All services must have comprehensive test coverage
- ✅ **Components** (`src/components/`) - All components must have rendering and interaction tests
- ✅ **Stateless Functions** (`src/utils/`) - All utility functions must have unit tests

## Test File Naming Convention

- Hooks: `src/hooks/__tests__/useHookName.test.ts`
- Services: `src/services/__tests__/ServiceName.test.ts`
- Components: `src/components/__tests__/ComponentName.test.tsx` or `src/components/[category]/__tests__/ComponentName.test.tsx`
- Utils: `src/utils/__tests__/utilityName.test.ts`

## Test Requirements

- ✅ Test files must be created **alongside** source files (not as an afterthought)
- ✅ Test all return values, state changes, side effects, and edge cases
- ✅ Test user interactions (clicks, input changes, form submissions)
- ✅ Test error states and loading states
- ✅ Test edge cases (empty data, null values, invalid inputs)
- ✅ Use Jest and React Testing Library
- ✅ Mock external dependencies (DataStore, APIs, AsyncStorage, etc.)

## Current Test Coverage

| Category                | Location                                                       | Examples                                                                       |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Hooks**               | `src/hooks/__tests__/`                                         | `useAppointmentList.test.ts`, `useGroupedTasks.test.ts`                        |
| **Services**            | `src/services/__tests__/`                                      | `TaskService.test.ts`, `AppointmentService.test.ts`, `ActivityService.test.ts` |
| **Components**          | `src/components/__tests__/`                                    | `TaskCard.test.tsx`, `AppointmentCard.test.tsx`, `GroupedTasksView.test.tsx`   |
| **Question Components** | `packages/task-system/src/src/components/questions/__tests__/` | `IntroductionScreen.test.tsx`, `SingleSelectQuestion.test.tsx`, etc.           |

## Running Unit Tests

```bash
yarn test
```

## Test Structure Example

```typescript
// src/hooks/__tests__/useTaskList.test.ts
import { renderHook, waitFor } from "@testing-library/react-native";
import { useTaskList } from "../useTaskList";

describe("useTaskList", () => {
  it("should fetch tasks on mount", async () => {
    const { result } = renderHook(() => useTaskList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toBeDefined();
  });

  // ... more tests
});
```

## Testing Coordinated Seeding

See [testing-coordinated-seeding.md](testing-coordinated-seeding.md) for detailed testing instructions on the coordinated seeding system.

## When Creating New Code

1. Create the hook/service/component/function
2. **Immediately create the corresponding test file**
3. Write tests covering the main functionality
4. Ensure tests pass before considering the feature complete

📖 See `.cursor/rules/testing.mdc` for detailed guidelines.
