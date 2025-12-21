# Testing POC JSON Loading

This guide explains how to test loading POC JSON files that LX exports from the Orion Mobile app.

## Overview

POC JSON files are exported from Orion Mobile app and saved to:

```
~/Downloads/POC_JSON_Files/{studyId}/
  ├── activities/
  │   ├── {activityId1}.json
  │   ├── {activityId2}.json
  │   └── ...
  └── translations/
      ├── Activity.{id}_MOBILE.json
      ├── tasks.json
      └── taskData.json
```

These files need to be converted to `TaskSystemFixture` format before loading into DataStore.

## Step 1: Convert POC JSON to Fixture Format

### Option A: Using the Conversion Script (Recommended)

1. **Run the conversion script**:

   ```bash
   # From project root
   npx ts-node scripts/convert-poc-json-to-fixture.ts <studyId>

   # Example:
   npx ts-node scripts/convert-poc-json-to-fixture.ts 9384dbad-2910-4a5b-928c-e004e06ed634
   ```

2. **The script will**:
   - Read all activity files from `~/Downloads/POC_JSON_Files/{studyId}/activities/`
   - Read task data from `~/Downloads/POC_JSON_Files/{studyId}/translations/taskData.json`
   - Convert to `TaskSystemFixture` format
   - Save to `src/fixtures/poc-fixture.{studyId}.json`

### Option B: Manual Conversion

If you prefer to convert manually, create a fixture file with this structure:

```json
{
  "version": 1,
  "fixtureId": "poc-{studyId}",
  "activities": [
    {
      "pk": "Study.{studyId}",
      "sk": "Activity#Activity.{activityId}",
      "name": "Activity Name",
      "title": "Activity Title",
      "type": "QUESTIONNAIRE",
      "activityGroups": "[{\"id\":\"group-1\",\"questions\":[...]}]",
      "resumable": true,
      "transcribable": true
    }
  ],
  "tasks": [
    {
      "pk": "task-pk",
      "sk": "task-sk",
      "title": "Task Title",
      "taskType": "SCHEDULED",
      "status": "OPEN",
      "actions": "[{\"entityId\":\"Activity.{activityId}\",\"entityType\":\"ACTIVITY\"}]",
      "entityId": "{activityId}",
      "startTimeInMillSec": 1234567890000
    }
  ]
}
```

**Key points**:

- `activityGroups` must be a **JSON string** (not an object)
- `actions` must be a **JSON string** (not an object)
- Extract `entityId` from `actions[0].entityId` and strip "Activity." prefix
- Convert `startTime` + `date` to `startTimeInMillSec` (milliseconds)

## Step 2: Import Fixture into DataStore

### Option A: Using DevOptions Screen (Easiest)

1. **Open the app** and navigate to the DevOptions screen
2. **Import the fixture**:
   - If you saved it as `src/fixtures/poc-fixture.{studyId}.json`, you can import it directly
   - Or use the "Import Fixture from Repo" option if you've added it to the fixtures directory

### Option B: Programmatic Import

```typescript
import { FixtureImportService } from "@orion/task-system";
import pocFixture from "../fixtures/poc-fixture.{studyId}.json";

// Import with options
const result = await FixtureImportService.importTaskSystemFixture(pocFixture, {
  updateExisting: true, // Update existing records
  pruneNonFixture: true, // Remove non-fixture records
  pruneDerivedModels: true, // Remove TaskAnswer, TaskResult, etc. (for clean slate)
});

console.log("Import result:", result);
// {
//   activities: { created: 5, updated: 0, skipped: 0 },
//   tasks: { created: 10, updated: 0, skipped: 0 },
//   questions: { created: 0, updated: 0, skipped: 0 },
//   appointments: { saved: true }
// }
```

### Option C: Using useDevOptions Hook

```typescript
import { useDevOptions } from "../hooks/useDevOptions";

const MyComponent = () => {
  const { importFixtureFromRepo, isImportingFixture } = useDevOptions();

  const handleImport = async () => {
    await importFixtureFromRepo();
  };

  return (
    <Button onPress={handleImport} disabled={isImportingFixture}>
      Import POC Fixture
    </Button>
  );
};
```

## Step 3: Verify Data Loaded

After importing, verify the data:

1. **Check tasks list** - Should show tasks from POC data
2. **Open a task** - Should display questions from `activityGroups`
3. **Verify question rendering**:
   - Questions should render in order from `activityGroups[].questions[]`
   - `multiselect` questions should respect `questionProperties.multipleselect`
   - Question text should display (using `question.text` directly)

## Step 4: Test Activity Rendering

1. **Tap a task** to open questions screen
2. **Verify**:
   - Questions render in correct order
   - Question types render correctly (multiselect, numericScale, etc.)
   - Single vs multiple selection works for multiselect questions
   - Required fields are marked
   - Validation messages display

## Troubleshooting

### "Activity not found" error

- Check that `entityId` is correctly extracted from task `actions`
- Verify activity `pk` matches what's in DataStore
- Check that activity was imported successfully

### Questions not rendering

- Verify `activityGroups` is present in Activity model
- Check that `activityGroups` is a valid JSON string
- Verify parser is detecting `activityGroups` (check logs)

### Wrong question order

- Verify questions are in correct order in `activityGroups[].questions[]` array
- Check that parser is using `activityGroups` (not `layouts`)

### Multiselect not working correctly

- Check `questionProperties` array is present
- Verify `multipleselect` property value ("true" or "false")
- Check QuestionRenderer is parsing `questionProperties` correctly

## Example: Complete Test Flow

```typescript
// 1. Convert POC JSON (run script)
// npx ts-node scripts/convert-poc-json-to-fixture.ts {studyId}

// 2. Import fixture
import { FixtureImportService } from "@orion/task-system";
import pocFixture from "../fixtures/poc-fixture.{studyId}.json";

const result = await FixtureImportService.importTaskSystemFixture(pocFixture, {
  updateExisting: true,
  pruneNonFixture: true,
  pruneDerivedModels: true, // Clean slate for testing
});

console.log("Imported:", result);

// 3. Verify in UI
// - Open app
// - Check task list shows POC tasks
// - Open a task and verify questions render correctly
```

## Quick Test Checklist

- [ ] POC JSON files exist in `~/Downloads/POC_JSON_Files/{studyId}/`
- [ ] Conversion script runs successfully
- [ ] Fixture file created in `src/fixtures/poc-fixture.{studyId}.json`
- [ ] Fixture imports without errors
- [ ] Tasks appear in task list
- [ ] Tasks can be opened (questions screen loads)
- [ ] Questions render in correct order
- [ ] Question types render correctly
- [ ] Multiselect questions work (single vs multiple)
- [ ] Required fields are marked
- [ ] Validation works

## Notes

- **ActivityGroups take priority**: If `activityGroups` exists, it's used instead of `layouts`
- **Translations deferred**: Currently using `question.text` directly (translation lookup deferred)
- **Appointments**: Can be loaded from `taskData.json` appointments array (Phase 2)
- **Task dates**: For appointment-anchored tasks, dates are calculated from appointments + `anchorDayOffset` (Phase 2)
