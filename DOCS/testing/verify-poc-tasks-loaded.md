# Verifying POC Tasks Are Loaded

If you're not seeing tasks after importing the POC fixture, follow these steps:

## Step 1: Verify Fixture Was Imported

Check if tasks are actually in DataStore:

### Option A: Check DevOptions Screen

1. Open the app
2. Navigate to DevOptions screen
3. Look for import result showing:
   - `activities: { created: X, updated: Y, skipped: Z }`
   - `tasks: { created: X, updated: Y, skipped: Z }`

### Option B: Check Logs

Look for logs showing:

- `📋 [DATA-1] useTaskList: Received X tasks`
- Task count should be 2 (or however many tasks are in your fixture)

### Option C: Programmatic Check

```typescript
import { DataStore } from "@aws-amplify/datastore";
import { Task } from "../models";

const tasks = await DataStore.query(Task);
console.log("Tasks in DataStore:", tasks.length);
tasks.forEach(task => {
  console.log("-", task.title, task.status, task.entityId);
});
```

## Step 2: Re-import the Fixture

If tasks aren't in DataStore, re-import:

```typescript
import { FixtureImportService } from "@orion/task-system";
import pocFixture from "../fixtures/poc-fixture.9384dbad-2910-4a5b-928c-e004e06ed634.json";

const result = await FixtureImportService.importTaskSystemFixture(pocFixture, {
  updateExisting: true,
  pruneNonFixture: true,
  pruneDerivedModels: true, // Clean slate
});

console.log("Import result:", result);
// Should show: tasks: { created: 2, updated: 0, skipped: 0 }
```

## Step 3: Verify Task Properties

Check that tasks have correct properties:

```typescript
const tasks = await DataStore.query(Task);
tasks.forEach(task => {
  console.log({
    id: task.id,
    title: task.title,
    status: task.status,
    entityId: task.entityId, // Should be activity ID, not "ActivityRef"
    startTimeInMillSec: task.startTimeInMillSec,
    expireTimeInMillSec: task.expireTimeInMillSec,
  });
});
```

**Expected:**

- `entityId` should be an activity ID (e.g., `8c482118-0040-44a4-8cda-60405ec08726`)
- `status` should be `OPEN`
- `startTimeInMillSec` can be `null` (tasks without dates show under "Today")

## Step 4: Check Task List Hook

Verify `useTaskList` is receiving tasks:

```typescript
const { tasks, loading, error } = useTaskList();
console.log("Tasks from hook:", tasks.length);
console.log("Loading:", loading);
console.log("Error:", error);
```

## Step 5: Check Task Grouping

Tasks without `expireTimeInMillSec` should appear under "Today":

```typescript
const { tasks } = useTaskList();
const grouped = useGroupedTasks(tasks);

console.log("Grouped tasks:", grouped);
// Should show tasks in "Today" section if they have no expireTimeInMillSec
```

## Common Issues

### Issue 1: Tasks Not Imported

**Symptom:** `tasks: { created: 0, updated: 0, skipped: 0 }`
**Solution:**

- Check fixture file path is correct
- Verify fixture JSON is valid
- Check DataStore is started

### Issue 2: Wrong entityId

**Symptom:** `entityId: "ActivityRef"` instead of activity ID
**Solution:**

- Regenerate fixture: `yarn convert:poc-json {studyId}`
- Re-import fixture

### Issue 3: Tasks Filtered Out

**Symptom:** Tasks in DataStore but not in UI
**Solution:**

- Check if date filters are applied
- Verify `useGroupedTasks` logic (tasks without `expireTimeInMillSec` should show)
- Check task status (OPEN tasks should show)

### Issue 4: DataStore Not Synced

**Symptom:** Tasks show locally but not on other devices
**Solution:**

- Wait for DataStore sync
- Check network connection
- Verify Amplify configuration

## Quick Debug Checklist

- [ ] Fixture file exists at `src/fixtures/poc-fixture.{studyId}.json`
- [ ] Fixture was imported (check import result)
- [ ] Tasks exist in DataStore (query DataStore directly)
- [ ] Tasks have correct `entityId` (not "ActivityRef")
- [ ] Tasks have `status: "OPEN"`
- [ ] `useTaskList` returns tasks (check hook return value)
- [ ] `useGroupedTasks` groups tasks correctly
- [ ] No date filters excluding tasks
- [ ] DataStore is synced (check sync status)

## Test Import Script

Create a test file to verify import:

```typescript
// test-import-poc.ts
import { FixtureImportService } from "@orion/task-system";
import { DataStore } from "@aws-amplify/datastore";
import { Task } from "../models";
import pocFixture from "../fixtures/poc-fixture.9384dbad-2910-4a5b-928c-e004e06ed634.json";

async function testImport() {
  console.log("Importing fixture...");
  const result = await FixtureImportService.importTaskSystemFixture(
    pocFixture,
    {
      updateExisting: true,
      pruneNonFixture: true,
      pruneDerivedModels: true,
    }
  );

  console.log("Import result:", result);

  console.log("\nVerifying tasks in DataStore...");
  const tasks = await DataStore.query(Task);
  console.log(`Found ${tasks.length} tasks`);

  tasks.forEach((task, i) => {
    console.log(`\nTask ${i + 1}:`);
    console.log(`  Title: ${task.title}`);
    console.log(`  Status: ${task.status}`);
    console.log(`  EntityId: ${task.entityId}`);
    console.log(`  StartTime: ${task.startTimeInMillSec}`);
    console.log(`  ExpireTime: ${task.expireTimeInMillSec}`);
  });
}

testImport().catch(console.error);
```
