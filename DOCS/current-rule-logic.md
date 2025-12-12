# Current Rule Logic in the Codebase

## Overview

This document explains the rule logic currently implemented in the codebase. The system has **rule fields defined** but **limited rule evaluation logic** implemented. Most rules are stored as data but not actively enforced yet.

## Rule Types Currently Defined

### 1. Task Completion Rules (Boolean Flags)

These are **stored** in the Task model but **not actively enforced** in the current implementation:

#### `showBeforeStart` (Boolean)
- **Purpose**: Allow task to be visible before its start time
- **Current Status**: Field exists, but no filtering logic implemented
- **Location**: `src/types/Task.ts`, `amplify/backend/api/lxtodoapp/schema.graphql`
- **Usage**: Set to `true` in seed scripts, but not checked when displaying tasks

#### `allowEarlyCompletion` (Boolean)
- **Purpose**: Allow task to be completed before its start time
- **Current Status**: Field exists, but no validation logic implemented
- **Location**: `src/types/Task.ts`
- **Usage**: Set to `true` in seed scripts, but not checked when completing tasks

#### `allowLateCompletion` (Boolean)
- **Purpose**: Allow task to be completed after its expiration time
- **Current Status**: Field exists, but no validation logic implemented
- **Location**: `src/types/Task.ts`
- **Usage**: Set to `true` in seed scripts, but not checked when completing tasks

#### `allowLateEdits` (Boolean)
- **Purpose**: Allow editing task answers after completion
- **Current Status**: Field exists, but no validation logic implemented
- **Location**: `src/types/Task.ts`
- **Usage**: Set to `false` in seed scripts, but not checked when editing tasks

### 2. Task Rules Field (JSON String)

#### `rules` (String - JSON)
- **Purpose**: Store complex rule definitions for task behavior
- **Current Status**: Field exists in schema, but **no rule engine implemented**
- **Location**: 
  - `src/types/Task.ts` (not in current Task interface, but in Activity)
  - `src/types/Activity.ts` (has `rules?: string | null`)
  - `amplify/backend/api/lxtodoapp/schema.graphql` (not in Task, but in Activity)
- **Expected Format** (from documentation):
  ```json
  [
    {
      "trigger": "ON_TASK_COMPLETION",
      "conditions": [...],
      "actions": [
        {
          "type": "START_TIMED_TASK",
          "params": { "taskDefId": "..." }
        }
      ]
    }
  ]
  ```
- **Current Usage**: Field exists but is **never parsed or evaluated**

### 3. Task Actions Field (JSON String)

#### `actions` (String - JSON)
- **Purpose**: Store actions to execute when task is completed
- **Current Status**: Field exists in schema, but **no action processing implemented**
- **Location**: 
  - `src/types/Task.ts` (has `actions?: string | null`)
  - `amplify/backend/api/lxtodoapp/schema.graphql` (has `actions: String`)
- **Expected Format** (from documentation):
  ```json
  [
    {
      "type": "START_TIMED_TASK",
      "params": { "taskDefId": "..." }
    }
  ]
  ```
- **Current Usage**: Field exists but is **never parsed or executed**

### 4. Anchors Field (JSON String)

#### `anchors` (String - JSON)
- **Purpose**: Store anchor references for task scheduling (e.g., appointment eventIds)
- **Current Status**: **Partially implemented** - stored and used for relationship tracking
- **Location**: 
  - `src/types/Task.ts` (has `anchors?: string | null`)
  - `scripts/seed-coordinated-data.ts` (creates anchors with appointment eventIds)
- **Current Format**:
  ```json
  {
    "type": "VISIT",
    "eventId": "Event.abc123",
    "anchorDate": "2025-12-12T09:00:00.000Z",
    "canMoveSeriesWithVisit": true
  }
  ```
- **Current Usage**: 
  - ✅ Created in coordinated seeding
  - ✅ Stored in database
  - ❌ Not yet used for rescheduling logic (future feature)

### 5. Anchor Day Offset

#### `anchorDayOffset` (Number)
- **Purpose**: Days offset from anchor date (e.g., appointment date)
- **Current Status**: **Partially implemented** - stored and used for scheduling
- **Location**: 
  - `src/types/Task.ts` (has `anchorDayOffset?: number | null`)
  - `scripts/seed-coordinated-data.ts` (sets -1, 0, 1, 3 for pre-visit, visit-day, post-visit)
- **Current Usage**: 
  - ✅ Set during task creation
  - ✅ Used to calculate task dates relative to appointments
  - ❌ Not yet used for rescheduling logic (future feature)

## Currently Implemented Rule Logic

### 1. Task Status Update Rules (Implemented)

**Location**: `src/hooks/useQuestionSubmission.ts`

**Logic**:
```typescript
// Determine task status based on answers
if (allQuestionsAnswered) {
  status = TaskStatus.COMPLETED
} else if (someQuestionsAnswered) {
  status = TaskStatus.INPROGRESS
}
```

**What it does**:
- When user submits answers, automatically updates task status
- If all questions answered → `COMPLETED`
- If some questions answered → `INPROGRESS`
- If no questions answered → status unchanged

**Status**: ✅ **Fully implemented and working**

### 2. Conflict Resolution Rules (Implemented)

**Location**: `src/services/ConflictResolution.ts`, `src/services/TaskService.ts`

**Logic**:
```typescript
// For Task UPDATE conflicts:
- Prefer local status changes
- Prefer remote timing updates
- Prefer local activity answers/responses
```

**What it does**:
- Handles DataStore sync conflicts
- Merges local and remote changes intelligently
- Preserves user's work (answers, status) while accepting server updates (timing)

**Status**: ✅ **Fully implemented and working**

### 3. Task Filtering (Basic - Not Rule-Based)

**Location**: `src/services/TaskService.ts` (getTasks method)

**Current Logic**:
- Filters by status (if provided)
- Filters by taskType (if provided)
- Filters by date range (if provided)
- Filters by search text (if provided)

**What it doesn't do**:
- ❌ Doesn't check `showBeforeStart` to filter tasks
- ❌ Doesn't check `expireTimeInMillSec` to filter expired tasks
- ❌ Doesn't check `allowEarlyCompletion` or `allowLateCompletion`
- ❌ Doesn't enforce time-based rules

**Status**: ⚠️ **Basic filtering only, no rule enforcement**

## Missing Rule Evaluation Logic

### 1. Task Visibility Rules

**Should check**:
- `showBeforeStart`: If `false`, don't show task before `startTimeInMillSec`
- `expireTimeInMillSec`: Don't show expired tasks (unless in recall window)
- Current time vs task timing

**Current Status**: ❌ **Not implemented**

### 2. Task Completion Validation Rules

**Should check**:
- `allowEarlyCompletion`: If `false`, prevent completion before `startTimeInMillSec`
- `allowLateCompletion`: If `false`, prevent completion after `expireTimeInMillSec`
- `allowLateEdits`: If `false`, prevent editing after completion

**Current Status**: ❌ **Not implemented**

### 3. Task Rule Engine

**Should do**:
- Parse `rules` JSON field
- Evaluate rule conditions
- Execute rule actions (e.g., `START_TIMED_TASK`)
- Handle triggers (`ON_TASK_COMPLETION`, `ON_TASK_START`, `ON_ANSWER_VALUE`)

**Current Status**: ❌ **Not implemented**

**Expected Implementation** (from documentation):
- Use `json-rules-engine` library
- Parse rules from JSON string
- Evaluate conditions
- Execute actions

### 4. Task Actions Processing

**Should do**:
- Parse `actions` JSON field
- Execute actions when task is completed
- Create new tasks (for timed tasks)
- Trigger other workflows

**Current Status**: ❌ **Not implemented**

### 5. Anchor-Based Rescheduling

**Should do**:
- Monitor appointment date changes
- Find tasks with matching `eventId` in `anchors`
- Recalculate task dates based on new anchor date + `anchorDayOffset`
- Update task `expireTimeInMillSec`

**Current Status**: ❌ **Not implemented** (prepared for future)

## Summary

### ✅ Implemented
1. **Task Status Updates**: Automatic status changes based on answer completion
2. **Conflict Resolution**: Smart merging of local/remote changes
3. **Basic Filtering**: Status, type, date, text filtering
4. **Anchors Storage**: Storing appointment relationships in anchors field

### ⚠️ Partially Implemented
1. **Anchors**: Stored but not used for rescheduling yet
2. **Anchor Day Offset**: Set but not used for dynamic rescheduling yet

### ❌ Not Implemented
1. **Completion Rules Enforcement**: `showBeforeStart`, `allowEarlyCompletion`, `allowLateCompletion`, `allowLateEdits`
2. **Rule Engine**: No parsing or evaluation of `rules` field
3. **Actions Processing**: No execution of `actions` field
4. **Time-Based Filtering**: No enforcement of task timing rules
5. **Anchor-Based Rescheduling**: No automatic task rescheduling when appointments change

## Next Steps for Rule Implementation

1. **Add Time-Based Validation**:
   - Check `startTimeInMillSec` and `expireTimeInMillSec` when displaying tasks
   - Enforce `showBeforeStart`, `allowEarlyCompletion`, `allowLateCompletion`

2. **Implement Rule Engine**:
   - Add `json-rules-engine` dependency
   - Create `RuleEngine` service to parse and evaluate rules
   - Process `rules` field when tasks are completed

3. **Implement Actions Processing**:
   - Parse `actions` JSON field
   - Execute actions (e.g., create timed tasks)
   - Handle different action types

4. **Implement Anchor-Based Rescheduling**:
   - Monitor appointment updates
   - Find linked tasks via `anchors.eventId`
   - Recalculate and update task dates

## Code Locations

- **Task Types**: `src/types/Task.ts`
- **Activity Types**: `src/types/Activity.ts`
- **Task Service**: `src/services/TaskService.ts`
- **Conflict Resolution**: `src/services/ConflictResolution.ts`
- **Question Submission**: `src/hooks/useQuestionSubmission.ts`
- **Coordinated Seeding**: `scripts/seed-coordinated-data.ts`
- **GraphQL Schema**: `amplify/backend/api/lxtodoapp/schema.graphql`

