# Temp Answer Implementation - Complete

**Status**: ✅ Implemented and Tested  
**Date**: 2026-01-05  
**Components**: Lambda, AppSync, DynamoDB, Frontend

---

## Overview

Temp answers allow users to save their in-progress work on a task and resume later. This is a lightweight, offline-first solution that persists temporary answers to DynamoDB via AppSync.

## Architecture

### Backend Components

1. **DynamoDB Table**: `TaskTempAnswers-{env}`
   - **Partition Key**: `taskPk` (String) - The task's primary key
   - **Sort Key**: `updatedAt` (String) - ISO 8601 timestamp
   - **Attributes**:
     - `activityId` (String) - The activity's primary key
     - `answers` (String) - JSON-stringified answer data
     - `localtime` (String) - Client's local ISO 8601 timestamp

2. **AppSync Mutation**: `saveTaskTempAnswers`
   - **Input**: `SaveTaskTempAnswersInput` (taskPk, activityId, answers, localtime)
   - **Returns**: `SaveTaskTempAnswersResponse`
   - **Resolver**: Direct DynamoDB resolver (VTL)
   - **Operation**: `PutItem` - Upserts temp answers for a task

3. **AppSync Query**: `getTempAnswers`
   - **Input**: `taskPk` (String)
   - **Returns**: `[SaveTaskTempAnswersResponse!]` (array, may be empty)
   - **Resolver**: Lambda function (`getTempAnswersResolver-{env}`)
   - **Operation**: Queries DynamoDB, returns most recent 10 items sorted descending

4. **Lambda Function**: `getTempAnswersResolver-{env}`
   - **Runtime**: Node.js 16.x (includes AWS SDK v2)
   - **Handler**: `src/index.handler`
   - **Environment**: `TASK_TEMP_ANSWERS_TABLE` (DynamoDB table name)
   - **Key Behavior**: Parses `answers` JSON string to object before returning (AppSync `AWSJSON` handles serialization)

### Frontend Components

1. **TempAnswerSyncService**
   - Offline-first outbox pattern
   - Auto-flush on network reconnection
   - Deduplication by `stableKey` (task.pk)
   - AsyncStorage for persistence across app restarts

2. **Default Mapper** (`defaultTempAnswersMapper`)
   - Transforms app data to GraphQL variables
   - Stringifies `answers` object (AWSJSON requirement)
   - Uses `task.pk` as `stableKey` for deduplication

3. **Integration Points**
   - `useActivityData`: Loads temp answers when screen loads
   - `useQuestionsScreen`: Merges temp answers with submitted answers
   - `QuestionNavigationControls`: Saves temp answers on Next/Back

## Data Flow

### Save Flow

1. User enters answer → navigates away (Next/Back button)
2. `TempAnswerSyncService.saveTempAnswers()` called
3. Mapper transforms data: `answers` object → JSON string
4. If online: Immediate sync via `saveTaskTempAnswers` mutation
5. If offline: Queue in outbox (AsyncStorage), sync when network returns
6. Mutation stores: `taskPk`, `activityId`, `answers` (string), `localtime`, `updatedAt`

### Load Flow

1. User navigates to task screen
2. `useActivityData` calls `TempAnswerSyncService.getTempAnswers(taskPk)`
3. Lambda queries DynamoDB for `taskPk`, sorts by `updatedAt` DESC, limit 10
4. Lambda parses `answers` JSON string → object (prevents double-encoding)
5. AppSync serializes object as `AWSJSON` and returns to client
6. Frontend receives object, merges with submitted answers (temp takes precedence)
7. `useQuestionsScreen` initializes form with merged answers

## Key Design Decisions

### 1. Why Lambda for GET, not VTL?

**Problem**: VTL proved unreliable for complex data transformations:

- String interpolation issues with nested JSON
- Type conversion bugs (AWSDateTime, AWSJSON)
- Difficult to debug
- Over 20 failed attempts to get VTL working correctly

**Solution**: Lambda function with proper JavaScript/TypeScript handling:

- Reliable JSON parsing
- Easy to test and debug
- Clear error handling
- Production-ready in first attempt

### 2. Why Parse `answers` in Lambda?

**Problem**: Double JSON encoding

- DynamoDB stores: `{"mp_q1":"value"}` (string)
- AppSync AWSJSON type encodes: `"\"{\\\"mp_q1\\\":\\\"value\\\"}\""` (double-encoded)
- Frontend receives string with numeric indices: `["0", "1", "2"...]`

**Solution**: Lambda parses before returning

- Lambda: `JSON.parse(item.answers)` → object
- AppSync: Serializes object as AWSJSON (single encoding)
- Frontend: Receives correct object with question IDs as keys

### 3. Why Not Real-Time Sync?

Temp answers are **not** real-time synced between devices. This is intentional:

**Reasons**:

- Performance: Real-time sync for every keystroke is expensive
- Use case: Single user, single device workflow
- Complexity: Real-time requires GraphQL subscriptions
- Cost: AppSync subscriptions are billed separately

**Behavior**:

- Device A: Saves temp answer → DynamoDB updated
- Device B (open on same screen): Does NOT auto-refresh
- Device B (navigates away, returns): Loads latest from DynamoDB ✅

Final answers (submitted tasks) DO sync in real-time via DataStore.

## Testing

### Unit Tests

**`tempAnswerDefaults.test.ts`** (10 tests):

- ✅ Correct variable structure
- ✅ JSON stringification (AWSJSON requirement)
- ✅ Question ID preservation (no numeric keys)
- ✅ Empty answers handling
- ✅ Complex nested structures
- ✅ Activity.pk fallback to activity.id
- ✅ Task.pk as stableKey
- ✅ Serialization round-trip without corruption
- ✅ No double-stringification

**`TempAnswerSyncService.test.ts`** (3 tests):

- ✅ Outbox upsert by stableKey
- ✅ Flush success/failure handling
- ✅ Auto-flush on network reconnection

### Manual Testing

✅ **iOS & Android**: Save/load temp answers works correctly  
✅ **Offline**: Answers queued and synced when network returns  
✅ **Cross-device**: Latest answer loads when returning to screen  
✅ **Data integrity**: Question IDs preserved, no corruption

## Deployment

### Lambda Function

```bash
# Function: getTempAnswersResolver-dev
# Runtime: Node.js 16.x
# Handler: src/index.handler
# Timeout: 25 seconds
# Memory: 128 MB
```

### IAM Roles

1. **getTempAnswersResolverLambdaRole-dev**
   - DynamoDB: Query, GetItem on `TaskTempAnswers-dev`
   - CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents

2. **AppSyncGetTempAnswersLambdaRole-dev**
   - Lambda: InvokeFunction on `getTempAnswersResolver-dev`

3. **TaskTempAnswersTableRole**
   - DynamoDB: PutItem, Query on `TaskTempAnswers-dev`

### CloudFormation Resources

**`CustomResources.json`**:

- `TaskTempAnswersTable` (DynamoDB)
- `TaskTempAnswersTableRole` (IAM)
- `TaskTempAnswersDataSource` (AppSync → DynamoDB)
- `SaveTaskTempAnswersResolver` (AppSync → DynamoDB, VTL)
- `GetTempAnswersLambdaDataSource` (AppSync → Lambda)
- `GetTempAnswersResolver` (AppSync → Lambda)

## Known Limitations

1. **No Real-Time Sync**: Temp answers don't auto-refresh on open screens
2. **No Conflict Resolution**: Last-write-wins (overwrites previous temp answers)
3. **No History**: Only most recent answer saved per task
4. **Single Activity**: One set of temp answers per task (not per activity)

These are intentional design choices for simplicity and performance.

## Future Enhancements (Optional)

- **Real-time sync**: Add GraphQL subscription for live updates
- **Conflict resolution**: Implement last-write-wins with timestamps
- **History**: Keep multiple versions with pagination
- **Analytics**: Track how often users resume vs. complete in one session

## Files Modified

### Backend

- `amplify/backend/api/oriontasksystem/schema.graphql`
- `amplify/backend/api/oriontasksystem/stacks/CustomResources.json`
- `amplify/backend/function/getTempAnswersResolver/src/index.js` (new)
- `amplify/backend/function/getTempAnswersResolver/src/package.json` (new)

### Frontend

- `packages/task-system/src/services/TempAnswerSyncService.ts`
- `packages/task-system/src/services/tempAnswerDefaults.ts`
- `packages/task-system/src/hooks/useActivityData.ts`
- `packages/task-system/src/hooks/useQuestionsScreen.ts`

### Tests

- `packages/task-system/src/services/__tests__/tempAnswerDefaults.test.ts`
- `packages/task-system/src/services/__tests__/TempAnswerSyncService.test.ts`

## Commit Message

```
feat: implement temp answer persistence with Lambda resolver

- Add saveTaskTempAnswers mutation (DynamoDB direct resolver)
- Add getTempAnswers query (Lambda resolver for reliable JSON handling)
- Create getTempAnswersResolver Lambda function (Node.js 16.x)
- Implement offline-first outbox pattern in TempAnswerSyncService
- Add temp answer loading in useActivityData hook
- Fix double JSON encoding issue (Lambda parses before AppSync serialization)
- Add comprehensive unit tests (13 tests, all passing)
- Update IAM policies for Lambda and AppSync integration

Users can now save in-progress work and resume tasks later.
Temp answers sync when network is available and persist across app restarts.

Tested on iOS and Android.
```
