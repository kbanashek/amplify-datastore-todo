/**
 * Minimal test seed - creates test data with E2E_TEST_MARKER from the start
 * This ensures test data is isolated and can be cleaned up separately
 */

import { ActivityService, TaskService } from "@orion/task-system";
import { TaskType, TaskStatus, CreateTaskInput } from "../../src/types/Task";
import { createTestDataPk } from "./test-data-marker";

/**
 * Create minimal test data for e2e tests
 * All data is marked with E2E_TEST_MARKER prefix
 */
export async function seedMinimalTestData(): Promise<{
  activitiesCount: number;
  tasksCount: number;
}> {
  console.log("🌱 [TestSeed] Creating minimal test data with markers...");

  // Create one simple activity for testing
  const activityPk = createTestDataPk("ACTIVITY");
  const activity = await ActivityService.createActivity({
    pk: activityPk,
    sk: `SK-${Date.now()}`,
    name: "E2E Test Activity",
    title: "E2E Test Health Survey",
    description: "Test activity for e2e tests",
    type: "QUESTIONNAIRE",
    activityGroups: JSON.stringify([
      {
        id: "group-1",
        questions: [
          {
            id: "q1",
            type: "text",
            text: "<p>What is your name?</p>",
            friendlyName: "Name",
            required: true,
            validations: [],
            choices: [],
            dataMappers: [],
          },
        ],
      },
    ]),
    layouts: JSON.stringify([
      {
        id: "layout-mobile",
        type: "MOBILE",
        screens: [
          {
            id: "screen-1",
            name: "Screen 1",
            order: 1,
            text: "Screen 1",
            elements: [
              {
                id: "q1",
                order: 1,
                displayProperties: [],
              },
            ],
            displayProperties: [],
          },
        ],
      },
    ]),
  });

  console.log("✅ [TestSeed] Activity created:", activity.id);

  // Create a few test tasks for today
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks: any[] = [];

  // Create 3 tasks for today at different times
  const times = [
    { hour: 9, minute: 0 },
    { hour: 14, minute: 30 },
    { hour: 18, minute: 0 },
  ];

  for (let i = 0; i < 3; i++) {
    const taskTime = new Date(today);
    taskTime.setHours(times[i].hour, times[i].minute, 0, 0);
    const expireTime = taskTime.getTime();

    const taskPk = createTestDataPk(`TASK-${i}-${Date.now()}`);
    const taskInput: CreateTaskInput = {
      pk: taskPk,
      sk: `SK-${Date.now()}-${i}`,
      title: `E2E Test Task ${i + 1}`,
      description: `Test task ${i + 1} for e2e testing`,
      taskType: TaskType.SCHEDULED,
      status: TaskStatus.OPEN,
      startTimeInMillSec: now,
      expireTimeInMillSec: expireTime,
      entityId: activity.pk,
      activityIndex: 0,
      showBeforeStart: true,
      allowEarlyCompletion: true,
      allowLateCompletion: true,
      allowLateEdits: false,
    };

    const task = await TaskService.createTask(taskInput);
    tasks.push(task);
    console.log(`✅ [TestSeed] Task ${i + 1} created:`, task.id);
  }

  // Wait for DataStore to sync
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log("✅ [TestSeed] Minimal test data created:", {
    activitiesCount: 1,
    tasksCount: tasks.length,
  });

  return {
    activitiesCount: 1,
    tasksCount: tasks.length,
  };
}

