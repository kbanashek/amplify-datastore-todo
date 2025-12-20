import type { TaskSystemFixture } from "../../packages/task-system/src/src/fixtures/TaskSystemFixture";

export type BuildTaskSystemFixtureOptions = {
  /**
   * Used to build deterministic PKs and to label the fixture for humans.
   */
  fixtureId: string;

  /**
   * Base date used to generate absolute timestamps (ms).
   * Pass “today at midnight local” to generate today’s tasks.
   */
  baseDate: Date;

  /**
   * Hour for the primary “All Question Types” task (local time).
   * Default: 8 (8:00 AM).
   */
  allTypesHour?: number;

  /**
   * Total number of tasks to generate for the day (including the All Types task).
   * Default: 10
   */
  taskCount?: number;

  /**
   * Number of sample appointments to generate for today (stored in AsyncStorage).
   * Default: 2
   */
  appointmentCount?: number;
};

const toDayStartLocal = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const atLocalTime = (date: Date, hour: number, minute: number): Date => {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
};

/**
 * Build a deterministic fixture that renders all supported question types on a single screen.
 *
 * This is intended to be:
 * - committed to source control (source-of-truth content)
 * - imported by the host app using FixtureImportService to populate DataStore offline
 */
export const buildTaskSystemFixtureV1 = (
  options: BuildTaskSystemFixtureOptions
): TaskSystemFixture => {
  const base = toDayStartLocal(options.baseDate);
  const fixtureId = options.fixtureId;
  const allTypesHour = options.allTypesHour ?? 8;
  const taskCount = options.taskCount ?? 10;
  const appointmentCount = options.appointmentCount ?? 2;

  const activityAllTypesPk = "ACTIVITY-ALL-TYPES-FIXTURE-1";
  const activityAllTypesSk = "SK-ACTIVITY-ALL-TYPES-FIXTURE-1";

  const activityMultiPagePk = "ACTIVITY-MULTI-PAGE-FIXTURE-1";
  const activityMultiPageSk = "SK-ACTIVITY-MULTI-PAGE-FIXTURE-1";

  const activityGroupsAllTypes = JSON.stringify([
    {
      id: "group-1",
      questions: [
        {
          id: "q_text",
          type: "textField",
          text: "What is your name?",
          friendlyName: "Name",
          required: true,
        },
        {
          id: "q_single",
          type: "singleSelect",
          text: "Pick one option",
          friendlyName: "Single Select",
          required: true,
          choices: [
            { id: "c1", order: 1, text: "Option A", value: "A" },
            { id: "c2", order: 2, text: "Option B", value: "B" },
          ],
        },
        {
          id: "q_multi",
          type: "multiSelect",
          text: "Pick multiple options",
          friendlyName: "Multi Select",
          required: false,
          choices: [
            { id: "m1", order: 1, text: "Red", value: "red" },
            { id: "m2", order: 2, text: "Blue", value: "blue" },
            { id: "m3", order: 3, text: "Green", value: "green" },
          ],
        },
        {
          id: "q_number",
          type: "numberField",
          text: "Enter a number",
          friendlyName: "Number",
          required: false,
        },
        {
          id: "q_date",
          type: "dateField",
          text: "Select a date",
          friendlyName: "Date",
          required: false,
        },
        {
          id: "q_bp",
          type: "bloodPressure",
          text: "Blood pressure",
          friendlyName: "Blood Pressure",
          required: false,
        },
        {
          id: "q_temp",
          type: "temperature",
          text: "Temperature",
          friendlyName: "Temperature",
          required: false,
        },
        {
          id: "q_pulse",
          type: "pulse",
          text: "Pulse",
          friendlyName: "Pulse",
          required: false,
        },
        {
          id: "q_weight_height",
          type: "weightHeight",
          text: "Weight & Height",
          friendlyName: "Weight & Height",
          required: false,
        },
        {
          id: "q_vas",
          type: "horizontalVAS",
          text: "Pain level",
          friendlyName: "Pain",
          required: false,
        },
        {
          id: "q_image",
          type: "imageCapture",
          text: "Capture an image",
          friendlyName: "Image",
          required: false,
        },
      ],
    },
  ]);

  const layoutsAllTypes = JSON.stringify([
    {
      type: "MOBILE",
      screens: [
        {
          id: "screen-1",
          name: "All Types",
          order: 0,
          elements: [
            {
              id: "q_text",
              order: 1,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_single",
              order: 2,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_multi",
              order: 3,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_number",
              order: 4,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_date",
              order: 5,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_bp",
              order: 6,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_temp",
              order: 7,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_pulse",
              order: 8,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_weight_height",
              order: 9,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_vas",
              order: 10,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
            {
              id: "q_image",
              order: 11,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
          ],
        },
      ],
    },
  ]);

  // Multi-page activity: 3 screens, 1 question per screen
  const activityGroupsMultiPage = JSON.stringify([
    {
      id: "group-1",
      questions: [
        {
          id: "mp_q1",
          type: "textField",
          text: "Multi-page: enter some text",
          friendlyName: "Multi Text",
          required: true,
        },
        {
          id: "mp_q2",
          type: "numberField",
          text: "Multi-page: enter a number",
          friendlyName: "Multi Number",
          required: false,
        },
        {
          id: "mp_q3",
          type: "dateField",
          text: "Multi-page: pick a date",
          friendlyName: "Multi Date",
          required: false,
        },
      ],
    },
  ]);

  const layoutsMultiPage = JSON.stringify([
    {
      type: "MOBILE",
      screens: [
        {
          id: "mp-screen-1",
          name: "Step 1",
          order: 0,
          elements: [
            {
              id: "mp_q1",
              order: 1,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
          ],
        },
        {
          id: "mp-screen-2",
          name: "Step 2",
          order: 1,
          elements: [
            {
              id: "mp_q2",
              order: 1,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
          ],
        },
        {
          id: "mp-screen-3",
          name: "Step 3",
          order: 2,
          elements: [
            {
              id: "mp_q3",
              order: 1,
              displayProperties: [{ key: "width", value: '"100%"' }],
            },
          ],
        },
      ],
    },
  ]);

  const buildTaskTimes = (
    index: number
  ): { startMs: number; expireMs: number } => {
    // Put tasks in increasing "due by" time so the All Types task is always first for today.
    const hour = allTypesHour + index;
    const startMs = atLocalTime(base, hour, 0).getTime();
    const expireMs = atLocalTime(base, hour, 30).getTime();
    return { startMs, expireMs };
  };

  const taskTypeByIndex = (
    index: number
  ): "SCHEDULED" | "TIMED" | "EPISODIC" => {
    const types = ["SCHEDULED", "TIMED", "EPISODIC"] as const;
    return types[index % types.length];
  };

  const tasks = Array.from({ length: Math.max(1, taskCount) }).map((_, i) => {
    const { startMs, expireMs } = buildTaskTimes(i);

    if (i === 0) {
      return {
        pk: "TASK-ALL-TYPES-FIXTURE-1",
        sk: "SK-TASK-ALL-TYPES-FIXTURE-1",
        title: "All Question Types Test (Fixture)",
        description:
          "Loaded from disk fixture: references the All Question Types activity",
        taskType: "SCHEDULED",
        status: "OPEN",
        startTimeInMillSec: startMs,
        expireTimeInMillSec: expireMs,
        entityId: activityAllTypesPk,
        activityIndex: 0,
        showBeforeStart: true,
        allowEarlyCompletion: true,
        allowLateCompletion: true,
        allowLateEdits: false,
      } as any;
    }

    if (i === 1) {
      return {
        pk: "TASK-MULTI-PAGE-FIXTURE-1",
        sk: "SK-TASK-MULTI-PAGE-FIXTURE-1",
        title: "Multi Page (3 screens) Test (Fixture)",
        description:
          "Loaded from disk fixture: references the Multi Page activity (3 screens, 1 question each)",
        taskType: "SCHEDULED",
        status: "OPEN",
        startTimeInMillSec: startMs,
        expireTimeInMillSec: expireMs,
        entityId: activityMultiPagePk,
        activityIndex: 1,
        showBeforeStart: true,
        allowEarlyCompletion: true,
        allowLateCompletion: true,
        allowLateEdits: false,
      } as any;
    }

    const n = i + 1;
    const useMultiPage = i % 2 === 1; // alternate after the two primary tasks
    const entityId = useMultiPage ? activityMultiPagePk : activityAllTypesPk;
    const activityIndex = useMultiPage ? 1 : 0;
    return {
      pk: `TASK-FIXTURE-${n}`,
      sk: `SK-TASK-FIXTURE-${n}`,
      title: `Sample Task ${n} (Fixture)`,
      description: `Loaded from disk fixture (${fixtureId}): sample task #${n}`,
      taskType: taskTypeByIndex(i),
      status: "OPEN",
      startTimeInMillSec: startMs,
      expireTimeInMillSec: expireMs,
      entityId,
      activityIndex,
      showBeforeStart: true,
      allowEarlyCompletion: true,
      allowLateCompletion: true,
      allowLateEdits: false,
    } as any;
  });

  const nowIso = new Date().toISOString();

  const appointments =
    appointmentCount > 0
      ? ({
          clinicPatientAppointments: {
            clinicAppointments: {
              items: Array.from({ length: appointmentCount }).map((_, i) => {
                const startAt = atLocalTime(base, 9 + i, 0).toISOString();
                const endAt = atLocalTime(base, 9 + i, 30).toISOString();

                return {
                  telehealthMeetingId: i % 2 === 0 ? `meeting-${i + 1}` : null,
                  appointmentType: i % 2 === 0 ? "TELEVISIT" : "ONSITE",
                  title:
                    i % 2 === 0
                      ? `Telehealth Visit ${i + 1} (Fixture)`
                      : `Onsite Visit ${i + 1} (Fixture)`,
                  siteId: "Site.FIXTURE-1",
                  data: "{}",
                  isDeleted: 0,
                  patientId: "Patient.FIXTURE-1",
                  status: "SCHEDULED",
                  description: `Loaded from disk fixture (${fixtureId})`,
                  startAt,
                  endAt,
                  instructions: "Fixture appointment - safe to delete",
                  appointmentId: `Appointment.FIXTURE-${i + 1}`,
                  eventId: `Event.FIXTURE-${i + 1}`,
                  createdAt: nowIso,
                  updatedAt: nowIso,
                  version: 1,
                  rescheduled: 0,
                  __typename: "SubjectStudyInstanceAppointment",
                };
              }),
            },
          },
          siteTimezoneId: "America/New_York",
        } as any)
      : undefined;

  return {
    version: 1,
    fixtureId,
    activities: [
      {
        pk: activityAllTypesPk,
        sk: activityAllTypesSk,
        name: "All Question Types",
        title: "All Question Types Test",
        description: `Fixture activity (${fixtureId}) with many question types on one screen`,
        type: "SURVEY",
        activityGroups: activityGroupsAllTypes,
        layouts: layoutsAllTypes,
        resumable: true,
        progressBar: true,
      } as any,
      {
        pk: activityMultiPagePk,
        sk: activityMultiPageSk,
        name: "Multi Page (3 screens)",
        title: "Multi Page Test",
        description: `Fixture activity (${fixtureId}) with 3 screens (1 question per screen)`,
        type: "SURVEY",
        activityGroups: activityGroupsMultiPage,
        layouts: layoutsMultiPage,
        resumable: true,
        progressBar: true,
      } as any,
    ],
    tasks,
    appointments,
  };
};
