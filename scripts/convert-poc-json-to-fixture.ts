/**
 * Script to convert POC JSON files to TaskSystemFixture format
 *
 * Usage:
 *   yarn convert:poc-json <studyId>
 *   # or
 *   tsx scripts/convert-poc-json-to-fixture.ts <studyId>
 *
 * Example:
 *   yarn convert:poc-json 9384dbad-2910-4a5b-928c-e004e06ed634
 *
 * This will:
 * 1. Read POC JSON files from ~/Downloads/POC_JSON_Files/{studyId}/
 * 2. Convert them to TaskSystemFixture format
 * 3. Save to src/fixtures/poc-fixture.{studyId}.json
 * 4. Optionally import directly into DataStore
 */

import * as fs from "fs";
import * as path from "path";
import { TaskSystemFixture } from "../packages/task-system/src/src/fixtures/TaskSystemFixture";
import { CreateActivityInput } from "../packages/task-system/src/src/types/Activity";
import {
  CreateTaskInput,
  TaskType,
  TaskStatus,
} from "../packages/task-system/src/src/types/Task";

const POC_BASE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  "Downloads",
  "POC_JSON_Files"
);

interface POCActivity {
  pk: string;
  sk: string;
  name?: string;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
  type?: string;
  activityGroups?: any[];
  layouts?: any[]; // Screen structure for multi-page activities
  introductionScreen?: any;
  summaryScreen?: any;
  completionScreen?: any;
  resumable?: boolean;
  transcribable?: boolean;
  displayHistoryDetail?: boolean;
}

interface POCTask {
  pk: string;
  sk: string;
  taskInstanceId?: string;
  title?: string;
  description?: string;
  taskType?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  actions?: string;
  activityAnswer?: string;
  anchorDayOffset?: number;
  anchors?: string;
  resumable?: string;
  transcribable?: string;
  displayHistoryDetail?: string;
}

interface POCTaskData {
  tasks?: Array<{
    date: string;
    tasks: POCTask[];
  }>;
  appointments?: any[];
}

/**
 * Convert string boolean values to actual booleans
 * Handles: "true", "false", "INCOMPLETE", "OPTIONAL", etc.
 */
function toBoolean(value: any): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    // Handle explicit boolean strings
    if (lower === "true" || lower === "1" || lower === "yes") return true;
    if (lower === "false" || lower === "0" || lower === "no") return false;
    // Handle POC-specific values
    // "INCOMPLETE" means activity can be resumed, so true
    if (lower === "incomplete") return true;
    // "OPTIONAL" means transcription is optional/enabled, so true
    if (lower === "optional") return true;
    // Default: any non-empty string is truthy
    return value.length > 0;
  }
  return Boolean(value);
}

/**
 * Convert POC activity JSON to CreateActivityInput
 */
function convertActivity(
  activityId: string,
  activityData: POCActivity
): CreateActivityInput {
  return {
    pk: activityData.pk,
    sk: activityData.sk,
    name: activityData.name || null,
    title: activityData.title || null,
    description: activityData.description || null,
    type: activityData.type || null,
    // Convert activityGroups to JSON string
    activityGroups: activityData.activityGroups
      ? JSON.stringify(activityData.activityGroups)
      : null,
    // Preserve layouts if they exist (contains screen structure)
    layouts: activityData.layouts ? JSON.stringify(activityData.layouts) : null,
    resumable: toBoolean(activityData.resumable),
    transcribable: toBoolean(activityData.transcribable),
    displayHistoryDetail: activityData.displayHistoryDetail
      ? String(activityData.displayHistoryDetail)
      : null,
  };
}

/**
 * Convert POC task JSON to CreateTaskInput
 */
function convertTask(taskData: POCTask): CreateTaskInput {
  // Parse startTime to milliseconds if provided
  let startTimeInMillSec: number | null = null;
  if (taskData.startTime && taskData.date) {
    const dateTime = `${taskData.date}T${taskData.startTime}`;
    startTimeInMillSec = new Date(dateTime).getTime();
  }

  // Parse endTime to milliseconds if provided
  let endTimeInMillSec: number | null = null;
  if (taskData.endTime && taskData.date) {
    const dateTime = `${taskData.date}T${taskData.endTime}`;
    endTimeInMillSec = new Date(dateTime).getTime();
  }

  // Extract entityId from actions if not directly available
  let entityId: string | null = null;
  if (taskData.actions) {
    try {
      const actions = JSON.parse(taskData.actions);
      if (Array.isArray(actions) && actions.length > 0) {
        const firstAction = actions[0];

        // Priority 1: Use ref.activityId if available (cleanest)
        if (firstAction?.ref?.activityId) {
          // Extract activity ID from "Activity.{id}" format
          entityId = firstAction.ref.activityId
            .replace(/^Activity\./, "")
            .split("#")[0];
        }
        // Priority 2: Parse from entityId string (ActivityRef#Arm...#Activity.{id})
        else if (firstAction?.entityId) {
          // Handle ActivityRef format: "ActivityRef#Arm...#Activity.{id}"
          const entityIdStr = firstAction.entityId;
          // Look for "Activity." in the string and extract the ID after it
          const activityMatch = entityIdStr.match(/Activity\.([^#]+)/);
          if (activityMatch) {
            entityId = activityMatch[1];
          } else {
            // Fallback: try simple extraction
            entityId = entityIdStr.replace(/^Activity\./, "").split("#")[0];
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  return {
    pk: taskData.pk,
    sk: taskData.sk,
    title: taskData.title || "Untitled Task",
    description: taskData.description || null,
    taskType: (taskData.taskType as TaskType) || TaskType.SCHEDULED,
    status: (taskData.status as TaskStatus) || TaskStatus.OPEN,
    taskInstanceId: taskData.taskInstanceId || null,
    startTime: taskData.startTime || null,
    startTimeInMillSec,
    endTime: taskData.endTime || null,
    endTimeInMillSec,
    actions: taskData.actions || null,
    anchors: taskData.anchors || null,
    anchorDayOffset: taskData.anchorDayOffset || null,
    entityId,
    activityAnswer: taskData.activityAnswer || null,
  };
}

/**
 * Main conversion function
 */
async function convertPOCToFixture(
  studyId: string
): Promise<TaskSystemFixture> {
  // Try both formats: Study.{studyId} and just {studyId}
  const studyDirName = `Study.${studyId}`;
  const pocPath1 = path.join(POC_BASE_PATH, studyDirName);
  const pocPath2 = path.join(POC_BASE_PATH, studyId);
  const pocPath = fs.existsSync(pocPath1) ? pocPath1 : pocPath2;

  const activitiesPath = path.join(pocPath, "activities");
  const translationsPath = path.join(pocPath, "translations");
  const taskDataPath = path.join(translationsPath, "taskData.json");

  console.log(`Reading POC JSON files from: ${pocPath}`);

  // Check if paths exist
  if (!fs.existsSync(pocPath)) {
    const triedPaths = [pocPath1, pocPath2].filter(p => p);
    throw new Error(
      `POC directory not found. Tried:\n` +
        triedPaths.map(p => `  - ${p}`).join("\n") +
        `\n\nPlease ensure POC JSON files are exported to one of:\n` +
        `  ~/Downloads/POC_JSON_Files/Study.{studyId}/\n` +
        `  ~/Downloads/POC_JSON_Files/{studyId}/\n` +
        `\nExpected structure:\n` +
        `  ~/Downloads/POC_JSON_Files/Study.${studyId}/\n` +
        `    ├── activities/\n` +
        `    │   ├── {activityId1}.json\n` +
        `    │   └── {activityId2}.json\n` +
        `    └── translations/\n` +
        `        └── taskData.json`
    );
  }
  if (!fs.existsSync(activitiesPath)) {
    throw new Error(
      `Activities directory not found: ${activitiesPath}\n` +
        `Expected: ~/Downloads/POC_JSON_Files/${studyId}/activities/`
    );
  }
  if (!fs.existsSync(taskDataPath)) {
    throw new Error(
      `Task data file not found: ${taskDataPath}\n` +
        `Expected: ~/Downloads/POC_JSON_Files/${studyId}/translations/taskData.json`
    );
  }

  // Read all activity files
  const activityFiles = fs
    .readdirSync(activitiesPath)
    .filter(file => file.endsWith(".json"));

  console.log(`Found ${activityFiles.length} activity files`);

  const activities: CreateActivityInput[] = [];
  for (const file of activityFiles) {
    const filePath = path.join(activitiesPath, file);
    const activityData: POCActivity = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );
    const activityId = file.replace(".json", "");
    activities.push(convertActivity(activityId, activityData));
  }

  // Read task data
  const taskDataFile: POCTaskData = JSON.parse(
    fs.readFileSync(taskDataPath, "utf-8")
  );

  // Convert tasks
  const tasks: CreateTaskInput[] = [];
  if (taskDataFile.tasks) {
    for (const dateGroup of taskDataFile.tasks) {
      for (const task of dateGroup.tasks) {
        tasks.push(convertTask(task));
      }
    }
  }

  console.log(
    `Converted ${activities.length} activities and ${tasks.length} tasks`
  );

  // Build fixture
  // Note: Appointments are Phase 2 - omitting for now
  // To add appointments later, ensure they match the AppointmentData type structure
  const fixture: TaskSystemFixture = {
    version: 1,
    fixtureId: `poc-${studyId}-${new Date().toISOString().split("T")[0]}`,
    activities,
    tasks,
    // Appointments will be handled in Phase 2
    // appointments: undefined,
  };

  return fixture;
}

/**
 * Main execution
 */
async function main() {
  const studyId = process.argv[2];

  if (!studyId) {
    console.error("Usage: yarn convert:poc-json <studyId>");
    console.error(
      "   or: tsx scripts/convert-poc-json-to-fixture.ts <studyId>"
    );
    console.error("");
    console.error("Example:");
    console.error(
      "  yarn convert:poc-json 9384dbad-2910-4a5b-928c-e004e06ed634"
    );
    console.error("");
    console.error(
      "Expected POC JSON files location: ~/Downloads/POC_JSON_Files/{studyId}/"
    );
    process.exit(1);
  }

  try {
    const fixture = await convertPOCToFixture(studyId);

    // Save to fixtures directory
    const outputPath = path.join(
      __dirname,
      "..",
      "src",
      "fixtures",
      `poc-fixture.${studyId}.json`
    );
    fs.writeFileSync(outputPath, JSON.stringify(fixture, null, 2));

    console.log(`\n✅ Successfully converted POC JSON to fixture format!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`\nTo import into DataStore, use:`);
    console.log(
      `  FixtureImportService.importTaskSystemFixture(fixture, { updateExisting: true })`
    );
    console.log(
      `\nOr use the DevOptions screen in the app to import this fixture.`
    );
  } catch (error) {
    console.error("Error converting POC JSON:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { convertPOCToFixture };
