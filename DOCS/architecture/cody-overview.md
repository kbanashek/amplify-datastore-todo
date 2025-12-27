# Task System Code Review

## Critical Issues (Fix Immediately)

### 1. Debug Code in Production

**File:** `TasksView.tsx`
**Severity:** CRITICAL

```typescript
// REMOVE THIS CODE - Creates test tasks in production
React.useEffect(() => {
  if (tasks.length === 0 && !loading) {
    const testTask = { id: "test-task-" + Date.now(), ... };
    TaskService.createTask(testTask);
  }
}, [tasks.length, loading]);
```

**Action:** Delete this useEffect block entirely.

---

### 2. Duplicate Conflict Resolution Configuration

**Files:** `TaskService.ts`, `TaskResultService.ts`, `TaskHistoryService.ts`, `ConflictResolution.ts`
**Severity:** CRITICAL

Each service calls `DataStore.configure()` with its own conflict handler. Only the LAST call takes effect.

**Action:** Remove `configureConflictResolution()` from all services except `ConflictResolution.ts`.

---

## High Priority Issues

| ID  | File                   | Issue                                             | Fix                                    |
| --- | ---------------------- | ------------------------------------------------- | -------------------------------------- |
| H-1 | `TaskResultService.ts` | `updateTaskResult` method is incomplete/truncated | Complete the implementation            |
| H-2 | All Services           | No unit tests                                     | Add Jest tests for all service methods |
| H-3 | `TaskCard.tsx`         | No loading state during async operations          | Add loading indicator                  |
| H-4 | `TaskCard.tsx`         | Errors not shown to users                         | Add toast/alert on failure             |

---

## Medium Priority Issues

| ID   | File                          | Issue                              | Fix                               |
| ---- | ----------------------------- | ---------------------------------- | --------------------------------- |
| M-1  | `NavigationService.ts`        | `navigation` typed as `any`        | Create proper TypeScript types    |
| M-2  | `NavigationService.ts`        | Hardcoded route names              | Create constants file             |
| M-3  | `TasksView.tsx`               | Uses `require()` instead of import | Use ES6 import                    |
| M-4  | `TasksView.tsx`               | Date grouping logic in component   | Extract to `useGroupedTasks` hook |
| M-5  | `TaskCard.tsx`                | Duplicate logic in handlers        | Extract to shared function        |
| M-6  | `QuestionRenderer.tsx`        | Naive HTML stripping with regex    | Use proper HTML parser            |
| M-7  | `GroupedTasksView.tsx`        | 9+ props                           | Use composition or context        |
| M-8  | `NavigationButtons.tsx`       | No keyboard avoidance              | Add KeyboardAvoidingView          |
| M-9  | All Services                  | No input validation                | Add Zod/Yup validation            |
| M-10 | `ConflictResolution.ts`       | `attempts` param unused            | Implement retry logic             |
| M-11 | `SeededDataCleanupService.ts` | Silent failures                    | Add fail-fast option              |
| M-12 | Multiple                      | Inconsistent error handling        | Standardize throw vs return null  |
| M-13 | Multiple                      | No React error boundaries          | Add error boundaries              |
| M-14 | Multiple                      | Missing loading states             | Track async operation states      |
| M-15 | i18n                          | Multiple translation patterns      | Standardize on one approach       |

---

## Low Priority Issues

| ID   | File                          | Issue                                   |
| ---- | ----------------------------- | --------------------------------------- |
| L-1  | `TaskList.tsx`                | Excessive debug logging                 |
| L-2  | `TaskList.tsx`                | Hardcoded emoji `📅`                    |
| L-3  | `GroupedTasksView.tsx`        | Render counting in production           |
| L-4  | `Button.tsx`                  | Color manipulation via string concat    |
| L-5  | `Button.tsx`                  | No haptic feedback                      |
| L-6  | `NavigationMenu.tsx`          | `onClose()` before navigation completes |
| L-7  | `NavigationButtons.tsx`       | Magic numbers (20, 60)                  |
| L-8  | `SeededDataCleanupService.ts` | Hardcoded batch size                    |
| L-9  | Multiple                      | Debug logs in production                |
| L-10 | Multiple                      | Inconsistent testID usage               |

---

## JIRA Tickets

### Sprint 1 (Critical/High)

| Ticket   | Title                                          | Points |
| -------- | ---------------------------------------------- | ------ |
| TASK-001 | Remove debug test task creation from TasksView | 1      |
| TASK-002 | Consolidate conflict resolution to single file | 3      |
| TASK-003 | Complete TaskResultService.updateTaskResult    | 2      |
| TASK-004 | Add loading states to TaskCard                 | 2      |
| TASK-005 | Add error feedback to TaskCard                 | 2      |

### Sprint 2 (Medium)

| Ticket   | Title                                         | Points |
| -------- | --------------------------------------------- | ------ |
| TASK-006 | Create navigation type definitions            | 3      |
| TASK-007 | Extract date grouping to useGroupedTasks hook | 3      |
| TASK-008 | Add input validation to services              | 5      |
| TASK-009 | Standardize error handling pattern            | 5      |
| TASK-010 | Add React error boundaries                    | 3      |
| TASK-011 | Standardize i18n approach                     | 3      |

### Sprint 3 (Low/Tech Debt)

| Ticket   | Title                                | Points |
| -------- | ------------------------------------ | ------ |
| TASK-012 | Remove debug logging from production | 2      |
| TASK-013 | Add unit tests for services          | 8      |
| TASK-014 | Add component tests                  | 5      |
| TASK-015 | Create BaseDataService class         | 3      |

---

## Recommended Architecture Changes

### 1. Single Conflict Resolution

```typescript
// ConflictResolution.ts - ONLY place to configure
export class ConflictResolution {
  private static configured = false;

  static configure() {
    if (this.configured) return;

    DataStore.configure({
      conflictHandler: async conflict => {
        switch (conflict.modelConstructor.name) {
          case "Task":
            return this.resolveTask(conflict);
          case "TaskResult":
            return this.resolveTaskResult(conflict);
          case "TaskHistory":
            return this.resolveTaskHistory(conflict);
          default:
            return conflict.remoteModel;
        }
      },
    });

    this.configured = true;
  }
}
```

### 2. Service Pattern

```typescript
// BaseDataService.ts
export abstract class BaseDataService<T> {
  abstract modelConstructor: PersistentModelConstructor<T>;

  async create(input: CreateInput<T>): Promise<T> {
    this.validate(input);
    return DataStore.save(new this.modelConstructor(input));
  }

  async getById(id: string): Promise<T | null> {
    return DataStore.query(this.modelConstructor, id) || null;
  }

  async getAll(): Promise<T[]> {
    return DataStore.query(this.modelConstructor);
  }

  abstract validate(input: unknown): void;
}
```

### 3. Route Constants

```typescript
// navigation/routes.ts
export const ROUTES = {
  APPOINTMENT_DETAILS: "appointment-details",
  TASK_DETAILS: "task-details",
  ACTIVITY: "activity",
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
```

---

## Summary

| Priority | Count | Action                  |
| -------- | ----- | ----------------------- |
| Critical | 2     | Fix this sprint         |
| High     | 4     | Fix this sprint         |
| Medium   | 15    | Plan for next 2 sprints |
| Low      | 10    | Backlog                 |

**Total Estimated Points:** 49

**Recommended Sprint Allocation:**

- Sprint 1: 10 points (Critical + High)
- Sprint 2: 22 points (Medium)
- Sprint 3: 17 points (Low + Tests)
