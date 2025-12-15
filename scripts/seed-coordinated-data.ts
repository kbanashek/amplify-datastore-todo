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

import { ActivityService, TaskService, AppointmentService } from "@orion/task-system";
import {
  Appointment,
  AppointmentData,
  AppointmentType,
  AppointmentStatus,
} from "../src/types/Appointment";
import { TaskType, TaskStatus, CreateTaskInput } from "../src/types/Task";
import {
  createHealthSurveyActivity,
  createPainAssessmentActivity,
  createMedicalHistoryActivity,
  createMultiPageHealthAssessmentActivity,
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
 * Create tasks linked to an appointment (pre-visit, visit-day, post-visit)
 */
async function createAppointmentWithTasks(
  appointment: Appointment,
  activities: any[]
): Promise<any[]> {
  const tasks: any[] = [];
  const appointmentDate = new Date(appointment.startAt);

  // Select an activity for linked tasks (use first available)
  const activity = activities.length > 0 ? activities[0] : null;
  const activityPk = activity?.pk || null;

  // Pre-Visit Tasks (1 day before appointment)
  const preVisitDate = addDays(appointmentDate, -1);
  const preVisitTime = setTime(preVisitDate, 8, 0); // 8 AM
  const preVisitTaskId = generateId("Task");

  tasks.push(
    await createAnchoredTask(
      `Pre-Visit Questionnaire: ${appointment.title} (${preVisitTaskId.substring(0, 8)})`,
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
  const beforeVisitTaskId = generateId("Task");

  tasks.push(
    await createAnchoredTask(
      `Prepare for Visit: ${appointment.title} (${beforeVisitTaskId.substring(0, 8)})`,
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
  const afterVisitTaskId = generateId("Task");

  tasks.push(
    await createAnchoredTask(
      `Post-Visit Survey: ${appointment.title} (${afterVisitTaskId.substring(0, 8)})`,
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
  const postVisitTaskId = generateId("Task");

  tasks.push(
    await createAnchoredTask(
      `Follow-up Survey: ${appointment.title} (${postVisitTaskId.substring(0, 8)})`,
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
  const postVisit3DaysTaskId = generateId("Task");

  tasks.push(
    await createAnchoredTask(
      `Medication Adherence Check: ${appointment.title} (${postVisit3DaysTaskId.substring(0, 8)})`,
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
  daysToCreate: number = 6
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
      const uniqueTaskId = generateId("Task").substring(0, 8);
      const taskTitle = `${activity.title || activity.name} - Day ${dayOffset + 1} (${uniqueTaskId})`;

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
function generateAppointments(): Appointment[] {
  const appointments: Appointment[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  log("Generating appointments", {
    today: today.toISOString(),
    todayDateString: today.toDateString(),
    note: "Appointments are created dynamically for the current date",
  });

  // Today's appointments
  const today9am = new Date(today);
  today9am.setHours(9, 0, 0, 0);

  const today2pm = new Date(today);
  today2pm.setHours(14, 0, 0, 0);

  appointments.push(
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
    )
  );

  // Tomorrow's appointments
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

  // Next week appointments
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

  return appointments;
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

/**
 * Main coordinated seed function
 */
export async function seedCoordinatedData(): Promise<CoordinatedSeedResult> {
  log("========================================");
  log("Starting coordinated seed (Appointments + Tasks)...");
  log("========================================");

  try {
    // Step 1: Create activities
    log("Step 1: Creating activities");
    const multiPageHealth = await createMultiPageHealthAssessmentActivity();
    const healthSurvey = await createHealthSurveyActivity();
    const painAssessment = await createPainAssessmentActivity();
    const medicalHistory = await createMedicalHistoryActivity();

    const activities = [
      multiPageHealth,
      healthSurvey,
      painAssessment,
      medicalHistory,
    ];
    log("All activities created", {
      count: activities.length,
      ids: activities.map(a => a.id),
    });

    // Step 2: Generate appointments
    log("Step 2: Generating appointments");
    const appointments = generateAppointments();
    log("Appointments generated", {
      count: appointments.length,
      eventIds: appointments.map(a => a.eventId),
    });

    // Step 3: Create tasks linked to appointments
    log("Step 3: Creating tasks linked to appointments");
    const linkedTasks: any[] = [];
    const relationships: AppointmentTaskRelationship[] = [];

    for (const appointment of appointments) {
      // Only create linked tasks for SCHEDULED appointments
      if (appointment.status === AppointmentStatus.SCHEDULED) {
        const appointmentTasks = await createAppointmentWithTasks(
          appointment,
          activities
        );
        linkedTasks.push(...appointmentTasks);

        // Track relationships
        const appointmentDate = new Date(appointment.startAt);
        const preVisitTasks = appointmentTasks.filter(
          (t: any, i: number) => i === 0
        );
        const visitDayTasks = appointmentTasks.filter(
          (t: any, i: number) => i === 1 || i === 2
        );
        const postVisitTasks = appointmentTasks.filter(
          (t: any, i: number) => i === 3 || i === 4
        );

        relationships.push({
          appointmentId: appointment.appointmentId,
          eventId: appointment.eventId,
          appointmentDate,
          linkedTaskIds: appointmentTasks.map((t: any) => t.id),
          taskTypes: {
            preVisit: preVisitTasks.map((t: any) => t.id),
            visitDay: visitDayTasks.map((t: any) => t.id),
            postVisit: postVisitTasks.map((t: any) => t.id),
          },
        });
      }
    }

    log("Linked tasks created", {
      count: linkedTasks.length,
      relationshipsCount: relationships.length,
    });

    // Step 4: Create standalone tasks
    log("Step 4: Creating standalone tasks");
    const standaloneTasks = await createStandaloneTasks(activities, 6);
    log("Standalone tasks created", {
      count: standaloneTasks.length,
    });

    // Step 5: Combine all tasks
    const allTasks = [...linkedTasks, ...standaloneTasks];

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
