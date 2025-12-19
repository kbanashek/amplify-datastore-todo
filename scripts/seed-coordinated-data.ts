/**
 * Coordinated seed script to create Appointments and Tasks together
 *
 * This script creates:
 * 1. Activities (reuses existing activity creation)
 * 2. Appointments with unique eventIds
 * 3. Tasks linked to appointments via anchors field
 * 4. Tasks scheduled relative to appointment dates
 * 5. Standalone tasks (not linked to appointments)
 *
 * Usage:
 * - Import and run in your app, or
 * - Run via a test/development screen
 *
 * IMPORTANT: This function creates appointments and tasks dynamically based on the current date.
 * Each time it's called, it uses the current date/time, so appointments and tasks will always
 * be created for "today" relative to when the seed function is executed.
 */

import { AppointmentService, TaskService } from "@orion/task-system";
import {
  Appointment,
  AppointmentData,
  AppointmentStatus,
  AppointmentType,
} from "../src/types/Appointment";
import { CreateTaskInput, TaskStatus, TaskType } from "../src/types/Task";
import {
  createAllQuestionTypesActivity,
  createClinicalVitalsActivity,
  createHealthSurveyActivity,
  createMedicalHistoryActivity,
  createMultiPageHealthAssessmentActivity,
  createPainAssessmentActivity,
  createTasksForActivities,
} from "./seed-question-data";

// Logging helper
const log = (message: string, data?: any) => {
  console.log(`[SeedCoordinatedScript] ${message}`, data || "");
};

// Helper to generate UUID-like IDs
function generateId(prefix: string): string {
  const random =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return `${prefix}.${random}`;
}

// Helper to format date as ISO string
function formatDate(date: Date): string {
  return date.toISOString();
}

// Helper to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper to set time on a date
function setTime(date: Date, hours: number, minutes: number = 0): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Generate task anchors JSON structure for appointment-linked tasks
 */
function generateTaskAnchors(
  eventId: string,
  anchorDate: Date,
  canMoveSeriesWithVisit: boolean = true
): string {
  const anchors = {
    type: "VISIT",
    eventId: eventId,
    anchorDate: anchorDate.toISOString(),
    canMoveSeriesWithVisit: canMoveSeriesWithVisit,
  };
  return JSON.stringify(anchors);
}

/**
 * Create a sample appointment
 */
function createAppointment(
  title: string,
  description: string,
  appointmentType: AppointmentType,
  status: AppointmentStatus,
  startDate: Date,
  durationMinutes: number = 60,
  instructions?: string,
  telehealthMeetingId?: string | null
): Appointment {
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  const now = new Date();

  return {
    appointmentId: generateId("Appointment"),
    eventId: generateId("Event"),
    patientId: generateId("Patient"),
    siteId: generateId("Site"),
    title,
    description,
    appointmentType,
    status,
    startAt: formatDate(startDate),
    endAt: formatDate(endDate),
    instructions: instructions || null,
    telehealthMeetingId: telehealthMeetingId || null,
    data: "{}",
    isDeleted: 0,
    rescheduled: 0,
    createdAt: formatDate(now),
    updatedAt: formatDate(now),
    version: 1,
    __typename: "SubjectStudyInstanceAppointment",
  };
}

/**
 * Create an anchored task linked to an appointment
 */
async function createAnchoredTask(
  title: string,
  description: string,
  appointment: Appointment,
  anchorDayOffset: number,
  taskTime: Date,
  activityPk: string | null,
  taskType: TaskType = TaskType.SCHEDULED
): Promise<any> {
  const now = Date.now();
  const taskTimestamp = Date.now();

  // Calculate task date based on appointment date and offset
  const appointmentDate = new Date(appointment.startAt);
  const taskDate = new Date(appointmentDate);
  taskDate.setDate(taskDate.getDate() + anchorDayOffset);
  taskDate.setHours(taskTime.getHours(), taskTime.getMinutes(), 0, 0);

  const expireTime = taskDate.getTime();

  // Generate anchors JSON with appointment eventId
  const anchors = generateTaskAnchors(
    appointment.eventId,
    appointmentDate,
    true // canMoveSeriesWithVisit
  );

  const taskInput: CreateTaskInput = {
    pk: `TASK-ANCHORED-${appointment.appointmentId}-${taskTimestamp}`,
    sk: `SK-${taskTimestamp}`,
    title,
    description,
    taskType,
    status: TaskStatus.OPEN,
    startTimeInMillSec: now,
    expireTimeInMillSec: expireTime,
    entityId: activityPk,
    activityIndex: activityPk ? 0 : null,
    showBeforeStart: true,
    allowEarlyCompletion: true,
    allowLateCompletion: true,
    allowLateEdits: false,
    anchors: anchors,
    anchorDayOffset: anchorDayOffset,
  };

  log("Creating anchored task", {
    title,
    appointmentId: appointment.appointmentId,
    eventId: appointment.eventId,
    anchorDayOffset,
    taskDate: taskDate.toISOString(),
    hasActivity: !!activityPk,
  });

  return await TaskService.createTask(taskInput);
}

/**
 * Helper to get task type name for title
 */
function getTaskTypeName(taskType: TaskType): string {
  switch (taskType) {
    case TaskType.SCHEDULED:
      return "Scheduled";
    case TaskType.TIMED:
      return "Timed";
    case TaskType.EPISODIC:
      return "Episodic";
    default:
      return "Task";
  }
}

/**
 * Create tasks linked to an appointment (pre-visit, visit-day, post-visit)
 */
async function createAppointmentWithTasks(
  appointment: Appointment,
  activities: any[],
  taskCounter: { scheduled: number; timed: number; episodic: number }
): Promise<any[]> {
  const tasks: any[] = [];
  const appointmentDate = new Date(appointment.startAt);

  // Select an activity for linked tasks (use first available)
  const activity = activities.length > 0 ? activities[0] : null;
  const activityPk = activity?.pk || null;

  // Pre-Visit Tasks (1 day before appointment)
  const preVisitDate = addDays(appointmentDate, -1);
  const preVisitTime = setTime(preVisitDate, 8, 0); // 8 AM
  taskCounter.scheduled++;
  const preVisitTitle = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;

  tasks.push(
    await createAnchoredTask(
      preVisitTitle,
      `Complete this questionnaire before your ${appointment.title} appointment`,
      appointment,
      -1, // anchorDayOffset: 1 day before
      preVisitTime,
      activityPk,
      TaskType.SCHEDULED
    )
  );

  // Visit-Day Tasks (on appointment day)
  // Task before appointment (1 hour before)
  const beforeVisitTime = new Date(appointmentDate);
  beforeVisitTime.setHours(beforeVisitTime.getHours() - 1);
  beforeVisitTime.setMinutes(0);
  taskCounter.scheduled++;
  const beforeVisitTitle = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;

  tasks.push(
    await createAnchoredTask(
      beforeVisitTitle,
      `Prepare for your ${appointment.title} appointment`,
      appointment,
      0, // anchorDayOffset: same day
      beforeVisitTime,
      activityPk,
      TaskType.SCHEDULED
    )
  );

  // Task after appointment (1 hour after)
  const afterVisitTime = new Date(appointmentDate);
  afterVisitTime.setHours(afterVisitTime.getHours() + 1);
  afterVisitTime.setMinutes(0);
  taskCounter.scheduled++;
  const afterVisitTitle = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;

  tasks.push(
    await createAnchoredTask(
      afterVisitTitle,
      `Complete this survey after your ${appointment.title} appointment`,
      appointment,
      0, // anchorDayOffset: same day
      afterVisitTime,
      activityPk,
      TaskType.SCHEDULED
    )
  );

  // Post-Visit Tasks (1 day after appointment)
  const postVisitDate = addDays(appointmentDate, 1);
  const postVisitTime = setTime(postVisitDate, 18, 0); // 6 PM
  taskCounter.scheduled++;
  const postVisitTitle = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;

  tasks.push(
    await createAnchoredTask(
      postVisitTitle,
      `Follow-up survey for your ${appointment.title} appointment`,
      appointment,
      1, // anchorDayOffset: 1 day after
      postVisitTime,
      activityPk,
      TaskType.SCHEDULED
    )
  );

  // Post-Visit Task (3 days after appointment)
  const postVisit3DaysDate = addDays(appointmentDate, 3);
  const postVisit3DaysTime = setTime(postVisit3DaysDate, 18, 0); // 6 PM
  taskCounter.scheduled++;
  const postVisit3DaysTitle = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;

  tasks.push(
    await createAnchoredTask(
      postVisit3DaysTitle,
      `Check your medication adherence after your ${appointment.title} appointment`,
      appointment,
      3, // anchorDayOffset: 3 days after
      postVisit3DaysTime,
      activityPk,
      TaskType.SCHEDULED
    )
  );

  return tasks;
}

/**
 * Create standalone tasks (not linked to appointments)
 */
async function createStandaloneTasks(
  activities: any[],
  daysToCreate: number = 6,
  taskCounter: { scheduled: number; timed: number; episodic: number }
): Promise<any[]> {
  const tasks: any[] = [];
  const now = Date.now();
  const times = [
    { hour: 8, minute: 0 },
    { hour: 11, minute: 45 },
    { hour: 14, minute: 30 },
    { hour: 17, minute: 0 },
    { hour: 20, minute: 0 },
  ];
  const taskTypes = [TaskType.SCHEDULED, TaskType.TIMED, TaskType.EPISODIC];

  // Create tasks for today + N days
  for (let dayOffset = 0; dayOffset < daysToCreate; dayOffset++) {
    const taskDate = new Date();
    taskDate.setDate(taskDate.getDate() + dayOffset);
    taskDate.setHours(0, 0, 0, 0);

    // Create 2-3 tasks per day
    const tasksPerDay = dayOffset === 0 ? 3 : 2;

    for (let i = 0; i < tasksPerDay; i++) {
      const timeIndex = i % times.length;
      const time = times[timeIndex];
      const taskDateTime = new Date(taskDate);
      taskDateTime.setHours(time.hour, time.minute, 0, 0);
      const expireTime = taskDateTime.getTime();

      const taskType = taskTypes[i % taskTypes.length];
      const taskTimestamp = Date.now() + dayOffset * 1000 + i;

      if (activities.length === 0) {
        continue;
      }

      // Select an activity for this task
      const activity =
        activities[Math.floor(Math.random() * activities.length)];

      // Increment counter for this task type and create title
      let taskTitle: string;
      if (taskType === TaskType.SCHEDULED) {
        taskCounter.scheduled++;
        taskTitle = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;
      } else if (taskType === TaskType.TIMED) {
        taskCounter.timed++;
        taskTitle = `${getTaskTypeName(TaskType.TIMED)} Task ${taskCounter.timed}`;
      } else {
        taskCounter.episodic++;
        taskTitle = `${getTaskTypeName(TaskType.EPISODIC)} Task ${taskCounter.episodic}`;
      }

      const taskInput: CreateTaskInput = {
        pk: `TASK-STANDALONE-${dayOffset}-${i}-${taskTimestamp}`,
        sk: `SK-${taskTimestamp}`,
        title: taskTitle,
        description:
          activity.description || `Complete ${activity.title || activity.name}`,
        taskType: taskType,
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
    }
  }

  return tasks;
}

/**
 * Generate appointments for multiple days (reuses logic from seed-appointment-data)
 */
function generateAppointments(options?: { count?: number }): Appointment[] {
  const appointments: Appointment[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  log("Generating appointments", {
    today: today.toISOString(),
    todayDateString: today.toDateString(),
    note: "Appointments are created dynamically for the current date",
  });

  const count = options?.count ?? 2;

  // Today's appointments (always create 2 first)
  const today9am = new Date(today);
  today9am.setHours(9, 0, 0, 0);

  const today2pm = new Date(today);
  today2pm.setHours(14, 0, 0, 0);

  const baseToday = [
    createAppointment(
      "Morning Check-up",
      "Regular health check-up with primary care physician",
      AppointmentType.ONSITE,
      AppointmentStatus.SCHEDULED,
      today9am,
      30,
      "Please bring your insurance card and ID",
      null
    ),
    createAppointment(
      "Telehealth Consultation",
      "Follow-up consultation via video call",
      AppointmentType.TELEVISIT,
      AppointmentStatus.SCHEDULED,
      today2pm,
      45,
      "Please join the meeting 5 minutes early",
      "meeting-telehealth-001"
    ),
  ];
  appointments.push(...baseToday.slice(0, Math.min(count, baseToday.length)));

  if (appointments.length < count) {
    const tomorrow = addDays(today, 1);
    appointments.push(
      createAppointment(
        "Specialist Consultation",
        "Consultation with cardiologist",
        AppointmentType.ONSITE,
        AppointmentStatus.SCHEDULED,
        setTime(tomorrow, 10, 0),
        60,
        "Please bring all previous test results",
        null
      )
    );
  }

  if (appointments.length < count) {
    const nextWeek = addDays(today, 7);
    appointments.push(
      createAppointment(
        "Annual Physical Exam",
        "Comprehensive annual physical examination",
        AppointmentType.ONSITE,
        AppointmentStatus.SCHEDULED,
        setTime(nextWeek, 9, 0),
        90,
        "Please bring a list of all current medications",
        null
      )
    );
  }

  // Hard cap
  return appointments.slice(0, count);
}

/**
 * Relationship tracking interface
 */
interface AppointmentTaskRelationship {
  appointmentId: string;
  eventId: string;
  appointmentDate: Date;
  linkedTaskIds: string[];
  taskTypes: {
    preVisit: string[];
    visitDay: string[];
    postVisit: string[];
  };
}

/**
 * Coordinated seed result interface
 */
export interface CoordinatedSeedResult {
  appointments: Appointment[];
  tasks: any[];
  activities: any[];
  relationships: AppointmentTaskRelationship[];
  summary: {
    appointmentsCount: number;
    tasksCount: number;
    linkedTasksCount: number;
    standaloneTasksCount: number;
    activitiesCount: number;
  };
}

export type SeedCoordinatedOptions = {
  /**
   * Total number of tasks to create (standalone + appointment-linked).
   * Default: 10
   */
  maxTasks?: number;
  /**
   * Number of appointments to create.
   * Default: 2
   */
  appointmentCount?: number;
  /**
   * Number of appointment-linked tasks to create per appointment.
   * Default: 2
   */
  linkedTasksPerAppointment?: number;
};

async function createLinkedTasksForAppointment(
  appointment: Appointment,
  activities: any[],
  taskCounter: { scheduled: number; timed: number; episodic: number },
  limit: number
): Promise<any[]> {
  if (limit <= 0) return [];

  const tasks: any[] = [];

  const healthSurvey =
    activities.find(a => a.name === "Health Survey") ?? activities[0];
  const clinicalVitals =
    activities.find(a => a.name === "Clinical Vitals") ?? healthSurvey;

  const start = new Date(appointment.startAt);

  // Task 1: due at the appointment hour (keeps "All Question Types" at 8:00 AM as the first bucket)
  if (tasks.length < limit) {
    taskCounter.scheduled++;
    const title = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;
    const dueAt = setTime(start, start.getHours(), 0);
    tasks.push(
      await createAnchoredTask(
        title,
        `Pre-visit survey for ${appointment.title}`,
        appointment,
        0,
        dueAt,
        healthSurvey.pk,
        TaskType.SCHEDULED
      )
    );
  }

  // Task 2: due 3 hours after appointment start (same day)
  if (tasks.length < limit) {
    taskCounter.scheduled++;
    const title = `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`;
    const dueAt = new Date(start);
    dueAt.setHours(start.getHours() + 3, 0, 0, 0);
    tasks.push(
      await createAnchoredTask(
        title,
        `Post-visit check-in after ${appointment.title}`,
        appointment,
        0,
        dueAt,
        clinicalVitals.pk,
        TaskType.SCHEDULED
      )
    );
  }

  return tasks;
}

/**
 * Main coordinated seed function
 */
export async function seedCoordinatedData(
  options?: SeedCoordinatedOptions
): Promise<CoordinatedSeedResult> {
  log("========================================");
  log("Starting coordinated seed (Appointments + Tasks)...");
  log("========================================");

  try {
    const maxTasks = options?.maxTasks ?? 10;
    const appointmentCount = options?.appointmentCount ?? 2;
    const linkedTasksPerAppointment = options?.linkedTasksPerAppointment ?? 2;

    // Step 1: Create activities
    log("Step 1: Creating activities");
    const multiPageHealth = await createMultiPageHealthAssessmentActivity();
    const healthSurvey = await createHealthSurveyActivity();
    const painAssessment = await createPainAssessmentActivity();
    const medicalHistory = await createMedicalHistoryActivity();
    const clinicalVitals = await createClinicalVitalsActivity();
    const allQuestionTypes = await createAllQuestionTypesActivity();

    const activities = [
      multiPageHealth,
      healthSurvey,
      painAssessment,
      medicalHistory,
      clinicalVitals,
      allQuestionTypes,
    ];
    log("All activities created", {
      count: activities.length,
      ids: activities.map(a => a.id),
    });

    // Step 2: Generate appointments
    log("Step 2: Generating appointments");
    const appointments = generateAppointments({ count: appointmentCount });
    log("Appointments generated", {
      count: appointments.length,
      eventIds: appointments.map(a => a.eventId),
    });

    // Step 3: Create tasks linked to appointments
    log("Step 3: Creating tasks linked to appointments");
    const linkedTasks: any[] = [];
    const relationships: AppointmentTaskRelationship[] = [];

    // Initialize task counter for numbering tasks by type
    const taskCounter = { scheduled: 0, timed: 0, episodic: 0 };

    // Budget: keep total tasks at maxTasks while still creating appointment-linked tasks.
    const linkedBudget = Math.min(
      Math.max(maxTasks - 1, 0),
      appointmentCount * linkedTasksPerAppointment
    );

    let remainingLinked = linkedBudget;
    for (const appointment of appointments) {
      if (remainingLinked <= 0) break;
      if (appointment.status !== AppointmentStatus.SCHEDULED) continue;

      const perApptLimit = Math.min(linkedTasksPerAppointment, remainingLinked);
      const appointmentTasks = await createLinkedTasksForAppointment(
        appointment,
        activities,
        taskCounter,
        perApptLimit
      );

      if (appointmentTasks.length > 0) {
        linkedTasks.push(...appointmentTasks);
        remainingLinked -= appointmentTasks.length;

        relationships.push({
          appointmentId: appointment.appointmentId,
          eventId: appointment.eventId,
          appointmentDate: new Date(appointment.startAt),
          linkedTaskIds: appointmentTasks.map((t: any) => t.id),
          taskTypes: {
            preVisit: appointmentTasks.slice(0, 1).map((t: any) => t.id),
            visitDay: [],
            postVisit: appointmentTasks.slice(1).map((t: any) => t.id),
          },
        });
      }
    }

    log("Linked tasks created", {
      count: linkedTasks.length,
      relationshipsCount: relationships.length,
    });

    // Step 4: Create standalone tasks (fills remaining budget, and always includes "All Question Types Test" first)
    log("Step 4: Creating standalone tasks");
    const standaloneBudget = Math.max(maxTasks - linkedTasks.length, 0);
    const { tasks: standaloneTasks } = await createTasksForActivities(
      activities,
      {
        maxTasks: standaloneBudget,
      }
    );
    log("Standalone tasks created", {
      count: standaloneTasks.length,
    });

    // Step 5: Combine tasks (All Question Types should already be first due-time bucket)
    const allTasks = [...standaloneTasks, ...linkedTasks].slice(0, maxTasks);

    // Step 6: Save appointments
    log("Step 5: Saving appointments");
    const appointmentData: AppointmentData = {
      clinicPatientAppointments: {
        clinicAppointments: {
          items: appointments,
        },
      },
      siteTimezoneId: "America/New_York",
    };
    await AppointmentService.saveAppointments(appointmentData);
    log("Appointments saved");

    // Summary
    const summary = {
      appointmentsCount: appointments.length,
      tasksCount: allTasks.length,
      linkedTasksCount: linkedTasks.length,
      standaloneTasksCount: standaloneTasks.length,
      activitiesCount: activities.length,
    };

    log("========================================");
    log("Coordinated seeding complete!");
    log("========================================");
    log("Summary:", summary);
    log(
      "Relationships:",
      relationships.map(r => ({
        appointmentId: r.appointmentId,
        eventId: r.eventId,
        linkedTasksCount: r.linkedTaskIds.length,
      }))
    );

    return {
      appointments,
      tasks: allTasks,
      activities,
      relationships,
      summary,
    };
  } catch (error) {
    log("ERROR: Coordinated seeding failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error("[SeedCoordinatedScript] Full error:", error);
    throw error;
  }
}

// Export for use in React Native
export default seedCoordinatedData;
