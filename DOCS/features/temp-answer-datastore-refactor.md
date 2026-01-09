# Temp Answer Refactor: DataStore Approach

**Status**: 🚧 In Progress  
**Created**: January 5, 2026  
**Branch**: `kbanashek/refactor/temp-answers-datastore`

---

## Problem with Current Implementation

The current temp answer implementation uses:

- Custom AppSync mutation + Lambda resolver
- Custom DynamoDB table (separate from DataStore)
- Custom sync service with outbox pattern
- AsyncStorage for offline caching
- Manual network state management

**Issues**:

1. **Offline access is limited**: Requires prior online fetch to populate cache
2. **Complex**: Custom sync logic duplicates DataStore functionality
3. **Inconsistent**: Different pattern from other data (Task, Activity, etc.)
4. **Not truly offline-first**: Cache is a workaround, not the source of truth

---

## Proposed Solution: Use DataStore

Create a `TaskTempAnswer` model that uses DataStore's built-in offline/sync capabilities.

### Benefits

✅ **True offline-first**: DataStore uses SQLite, always available  
✅ **Automatic sync**: Built-in conflict resolution and sync  
✅ **Consistent**: Same pattern as all other data models  
✅ **Simpler code**: Just `DataStore.save()` and `DataStore.query()`  
✅ **No custom infrastructure**: No Lambda, no separate DynamoDB table  
✅ **Better offline**: Works even on first visit (no cache needed)

---

## Implementation Plan

### Step 1: Add DataStore Model to Schema

```graphql
type TaskTempAnswer @model @auth(rules: [{ allow: public }]) {
  id: ID!
  taskPk: String! @index(name: "byTaskPk", sortKeyFields: ["updatedAt"])
  activityId: String!
  answers: AWSJSON!
  localtime: AWSDateTime!
}
```

**Key Points**:

- `@model` directive enables DataStore sync
- `@index` for efficient querying by taskPk
- `AWSJSON` stores answers as JSON object
- DataStore automatically adds: `_version`, `_lastChangedAt`, `_deleted`, `createdAt`, `updatedAt`

### Step 2: Generate DataStore Models

```bash
amplify codegen models
```

This generates TypeScript classes in `/src/models/`:

- `TaskTempAnswer.ts` - Model class
- Automatic CRUD methods
- Automatic sync setup

### Step 3: Simplify TempAnswerSyncService

**Before** (Complex):

```typescript
static async enqueueTempAnswers(input) {
  const outbox = await readOutbox(storageKey);
  outbox[stableKey] = { document, variables, updatedAt };
  await writeOutbox(storageKey, outbox);

  if (online) {
    const result = await executor.execute({ document, variables });
    if (success) removeFromOutbox();
  }
}
```

**After** (Simple):

```typescript
static async saveTempAnswers(input: SaveTempAnswersInput): Promise<void> {
  const { task, activity, answers } = input;

  await DataStore.save(
    new TaskTempAnswer({
      taskPk: task.pk,
      activityId: activity.pk ?? activity.id,
      answers: answers, // DataStore handles AWSJSON serialization
      localtime: new Date().toISOString(),
    })
  );

  // That's it! DataStore handles:
  // - Saving to SQLite (offline)
  // - Syncing to cloud (when online)
  // - Conflict resolution
  // - Network retry logic
}
```

### Step 4: Simplify getTempAnswers

**Before** (Complex):

```typescript
static async getTempAnswers(taskPk: string) {
  const netState = await NetInfo.fetch();
  if (!online) {
    return await readCache(taskPk); // Manual cache
  }

  const result = await executor.execute({ document, variables });
  if (result) await writeCache(taskPk, result.answers);
  return result?.answers;
}
```

**After** (Simple):

```typescript
static async getTempAnswers(taskPk: string): Promise<Record<string, any> | null> {
  // DataStore queries SQLite first (instant, always available)
  // Then syncs with cloud in background
  const results = await DataStore.query(
    TaskTempAnswer,
    (c) => c.taskPk.eq(taskPk),
    {
      sort: (s) => s.updatedAt(SortDirection.DESCENDING),
      limit: 1,
    }
  );

  if (results.length === 0) return null;

  // DataStore automatically deserializes AWSJSON
  return results[0].answers;
}
```

### Step 5: Remove Unnecessary Code

**Delete**:

- Lambda function: `amplify/backend/function/getTempAnswersResolver/`
- Custom DynamoDB table from `CustomResources.json`
- Custom resolvers (VTL templates)
- Outbox logic in `TempAnswerSyncService.ts`
- Cache helpers (`readCache`, `writeCache`)
- Network state checks
- Manual sync logic

**Keep**:

- `TempAnswerSyncService.ts` (simplified to DataStore wrapper)
- Integration in `useActivityData` and `useQuestionsScreen`
- Unit tests (updated for DataStore)

### Step 6: Update Integration Points

**useActivityData.ts**:

```typescript
// Before
const tempAnswers = await TempAnswerSyncService.getTempAnswers(task.pk);

// After (same API, different implementation)
const tempAnswers = await TempAnswerSyncService.getTempAnswers(task.pk);
```

**QuestionNavigationControls.tsx**:

```typescript
// Before
await TempAnswerSyncService.enqueueFromMapper({
  task,
  activity,
  answers,
  localtime,
});

// After (same API, different implementation)
await TempAnswerSyncService.saveTempAnswers({ task, activity, answers });
```

---

## Migration Steps

### 1. Add Model to Schema

```graphql
type TaskTempAnswer @model @auth(rules: [{ allow: public }]) {
  id: ID!
  taskPk: String! @index(name: "byTaskPk", sortKeyFields: ["updatedAt"])
  activityId: String!
  answers: AWSJSON!
  localtime: AWSDateTime!
}
```

### 2. Deploy Backend

```bash
amplify push
amplify codegen models
```

### 3. Refactor TempAnswerSyncService

- Replace `enqueueTempAnswers` with `DataStore.save()`
- Replace `getTempAnswers` GraphQL query with `DataStore.query()`
- Remove outbox, cache, network checks
- Keep same public API for backward compatibility

### 4. Remove Old Implementation

```bash
# Remove Lambda
rm -rf amplify/backend/function/getTempAnswersResolver

# Remove custom DynamoDB table and resolvers from CustomResources.json
# (edit file manually)

# Push changes
amplify push
```

### 5. Update Tests

- Replace executor mocks with DataStore mocks
- Test offline behavior (DataStore handles this)
- Verify sync behavior

### 6. Clean Up

- Remove unused imports
- Remove AsyncStorage cache logic
- Remove network state management
- Update documentation

---

## Code Comparison

### Saving Temp Answers

**Current** (95 lines):

```typescript
// TempAnswerSyncService.ts
static async enqueueTempAnswers(input: {
  stableKey: string;
  variables: { [key: string]: unknown };
  document?: string;
}): Promise<void> {
  if (!config) return;
  const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
  const document = input.document ?? config.document;
  const outbox = await readOutbox(storageKey);
  const existed = !!outbox[input.stableKey];
  outbox[input.stableKey] = {
    stableKey: input.stableKey,
    document,
    variables: input.variables,
    updatedAt: Date.now(),
  };
  await writeOutbox(storageKey, outbox);
  // ... more code ...
}

static async enqueueFromMapper(input: BuildSaveTempAnswersVariablesInput): Promise<void> {
  if (!config) return;
  const mapper: TaskSystemSaveTempAnswersMapper = config.mapper;
  const mapped = mapper(input);
  if (!mapped) return;
  await writeCache(input.task.pk, input.answers);
  await TempAnswerSyncService.enqueueTempAnswers({
    stableKey: mapped.stableKey,
    variables: mapped.variables,
    document: mapped.document,
  });
}
```

**Proposed** (12 lines):

```typescript
// TempAnswerSyncService.ts
static async saveTempAnswers(input: {
  task: Task;
  activity: Activity;
  answers: Record<string, any>;
}): Promise<void> {
  await DataStore.save(
    new TaskTempAnswer({
      taskPk: input.task.pk,
      activityId: input.activity.pk ?? input.activity.id,
      answers: input.answers,
      localtime: new Date().toISOString(),
    })
  );
}
```

**Reduction**: 95 lines → 12 lines (87% less code)

### Loading Temp Answers

**Current** (75 lines):

```typescript
static async getTempAnswers(taskPk: string): Promise<Record<string, any> | null> {
  if (!config) return null;
  const netState = await NetInfo.fetch();
  const isOnline = netState.isInternetReachable === true || netState.isConnected === true;

  if (!isOnline) {
    const cachedAnswers = await readCache(taskPk);
    if (cachedAnswers) return cachedAnswers;
    return null;
  }

  const executor: TaskSystemGraphQLExecutor = config.executor;
  try {
    const result = await executor.execute({
      document: DEFAULT_GET_TEMP_ANSWERS_QUERY,
      variables: { taskPk },
    });

    if (hasGraphQLErrors(result)) return null;
    const items = (result as any)?.data?.getTempAnswers;
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    const mostRecent = items[0];
    const answersJson = mostRecent.answers;
    if (!answersJson) return null;

    const answers = typeof answersJson === "string" ? JSON.parse(answersJson) : answersJson;
    await writeCache(taskPk, answers);
    return answers;
  } catch (error) {
    return null;
  }
}
```

**Proposed** (11 lines):

```typescript
static async getTempAnswers(taskPk: string): Promise<Record<string, any> | null> {
  const results = await DataStore.query(
    TaskTempAnswer,
    (c) => c.taskPk.eq(taskPk),
    {
      sort: (s) => s.updatedAt(SortDirection.DESCENDING),
      limit: 1,
    }
  );

  return results.length > 0 ? results[0].answers : null;
}
```

**Reduction**: 75 lines → 11 lines (85% less code)

---

## Testing Strategy

### Unit Tests

```typescript
// TempAnswerSyncService.test.ts
import { DataStore } from "@aws-amplify/datastore";
import { TaskTempAnswer } from "@models";

jest.mock("@aws-amplify/datastore");

describe("TempAnswerSyncService with DataStore", () => {
  it("saves temp answers to DataStore", async () => {
    await TempAnswerSyncService.saveTempAnswers({
      task: mockTask,
      activity: mockActivity,
      answers: { q1: "a1", q2: "a2" },
    });

    expect(DataStore.save).toHaveBeenCalledWith(
      expect.objectContaining({
        taskPk: "TASK-PK-1",
        activityId: "ACTIVITY-1",
        answers: { q1: "a1", q2: "a2" },
      })
    );
  });

  it("loads most recent temp answers from DataStore", async () => {
    (DataStore.query as jest.Mock).mockResolvedValue([
      {
        taskPk: "TASK-PK-1",
        answers: { q1: "a1" },
        updatedAt: "2026-01-05T12:00:00Z",
      },
    ]);

    const result = await TempAnswerSyncService.getTempAnswers("TASK-PK-1");

    expect(result).toEqual({ q1: "a1" });
  });

  it("works offline (DataStore uses SQLite)", async () => {
    // DataStore.query reads from SQLite first
    (DataStore.query as jest.Mock).mockResolvedValue([
      { taskPk: "TASK-PK-1", answers: { q1: "offline" } },
    ]);

    const result = await TempAnswerSyncService.getTempAnswers("TASK-PK-1");

    expect(result).toEqual({ q1: "offline" });
    // No network calls needed!
  });
});
```

### Integration Tests

- Test save → offline → load (should work seamlessly)
- Test save on device A → sync → load on device B
- Test conflict resolution (DataStore handles this)

---

## Timeline

- **Day 1**: Add model to schema, deploy backend
- **Day 2**: Refactor TempAnswerSyncService to use DataStore
- **Day 3**: Update tests, verify offline behavior
- **Day 4**: Remove old implementation (Lambda, DynamoDB table)
- **Day 5**: Update documentation, create PR

---

## Rollback Plan

If issues arise:

1. Keep PR #57 (current Lambda implementation) as backup
2. Can quickly revert by merging PR #57 back
3. Both implementations use same public API (easy to swap)

---

## Success Criteria

✅ Temp answers save and load offline (no network required)  
✅ Temp answers sync automatically when online  
✅ Works on first app launch (no cache warm-up needed)  
✅ Consistent with other data models (Task, Activity, etc.)  
✅ Less code, easier to maintain  
✅ All existing tests pass  
✅ Performance equal or better than current implementation

---

## Next Steps

1. ✅ Create branch `kbanashek/refactor/temp-answers-datastore`
2. ⏳ Add `TaskTempAnswer` model to schema
3. ⏳ Deploy backend with `amplify push`
4. ⏳ Generate models with `amplify codegen models`
5. ⏳ Refactor `TempAnswerSyncService.ts`
6. ⏳ Update integration points
7. ⏳ Update tests
8. ⏳ Remove old implementation
9. ⏳ Create PR
10. ⏳ Merge and deploy

---

**Ready to start implementation!** 🚀
