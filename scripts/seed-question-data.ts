/**
 * Seed script to create Activities and Tasks with question data
 *
 * This script creates:
 * 1. Activities with proper JSON structure (layouts, activityGroups, questions)
 * 2. Tasks that reference those Activities via entityId
 *
 * Usage:
 * - Import and run in your app, or
 * - Run via a test/development screen
 */

import { ActivityService, TaskService } from "@orion/task-system";
import { TaskType, TaskStatus } from "../src/types/Task";

// Logging helper
const log = (message: string, data?: any) => {
  console.log(`[SeedScript] ${message}`, data || "");
};

// Helper to create a complete Activity JSON structure
function createActivityConfig(questions: any[]) {
  const activityGroups = [
    {
      id: "group-1",
      questions: questions,
    },
  ];

  const layouts = [
    {
      type: "MOBILE",
      screens: [
        {
          id: "screen-1",
          order: 1,
          elements: questions.map((question, index) => ({
            id: question.id,
            order: index + 1,
            displayProperties: [
              { key: "fieldType", value: JSON.stringify(question.type) },
              { key: "width", value: JSON.stringify("100%") },
              { key: "marginLeft", value: "0" },
              { key: "marginRight", value: "0" },
              { key: "paddingLeft", value: "10" },
              { key: "paddingRight", value: "10" },
              { key: "fontSize", value: "16" },
              { key: "fontColor", value: "#000000" },
            ],
            question: question,
          })),
        },
      ],
    },
  ];

  return {
    layouts,
    activityGroups,
  };
}

// Sample questions for different types
const sampleQuestions = {
  // Text field question
  textField: {
    id: "Question.text-name",
    type: "text",
    text: "<p>What is your name?</p>",
    i18nKey: "name_question_key",
    friendlyName: "Name",
    dataPointKey: "patient.name",
    required: true,
    validations: [
      {
        type: "required",
        text: "Name is required",
        i18nKey: "name_required_key",
        warningOnly: false,
      },
    ],
    choices: [],
    dataMappers: [],
  },

  // Textarea question
  textarea: {
    id: "Question.textarea-notes",
    type: "textarea-field",
    text: "<p>Please provide any additional notes or comments.</p>",
    i18nKey: "notes_question_key",
    friendlyName: "Notes",
    dataPointKey: "patient.notes",
    required: false,
    validations: [],
    choices: [],
    dataMappers: [],
  },

  // Single select question
  singleSelect: {
    id: "Question.singleselect-pain-level",
    type: "singleselect",
    text: "<p>How would you rate your pain level today?</p>",
    i18nKey: "pain_level_question_key",
    friendlyName: "Pain Level",
    dataPointKey: "patient.painLevel",
    required: true,
    validations: [
      {
        type: "required",
        text: "Please select a pain level",
        i18nKey: "pain_level_required_key",
        warningOnly: false,
      },
    ],
    choices: [
      {
        id: "Choice.no-pain",
        order: 1,
        text: "No pain",
        i18nKey: "no_pain_key",
        value: "0",
        imageS3Key: null,
      },
      {
        id: "Choice.mild-pain",
        order: 2,
        text: "Mild pain",
        i18nKey: "mild_pain_key",
        value: "1",
        imageS3Key: null,
      },
      {
        id: "Choice.moderate-pain",
        order: 3,
        text: "Moderate pain",
        i18nKey: "moderate_pain_key",
        value: "2",
        imageS3Key: null,
      },
      {
        id: "Choice.severe-pain",
        order: 4,
        text: "Severe pain",
        i18nKey: "severe_pain_key",
        value: "3",
        imageS3Key: null,
      },
    ],
    dataMappers: [],
  },

  // Multi-select question
  multiSelect: {
    id: "Question.multiselect-symptoms",
    type: "multiselect",
    text: "<p>Select all symptoms you are experiencing:</p>",
    i18nKey: "symptoms_question_key",
    friendlyName: "Symptoms",
    dataPointKey: "patient.symptoms",
    required: true,
    validations: [
      {
        type: "required",
        text: "Please select at least one symptom",
        i18nKey: "symptoms_required_key",
        warningOnly: false,
      },
    ],
    choices: [
      {
        id: "Choice.headache",
        order: 1,
        text: "Headache",
        i18nKey: "headache_key",
        value: "headache",
        imageS3Key: null,
      },
      {
        id: "Choice.fever",
        order: 2,
        text: "Fever",
        i18nKey: "fever_key",
        value: "fever",
        imageS3Key: null,
      },
      {
        id: "Choice.nausea",
        order: 3,
        text: "Nausea",
        i18nKey: "nausea_key",
        value: "nausea",
        imageS3Key: null,
      },
      {
        id: "Choice.fatigue",
        order: 4,
        text: "Fatigue",
        i18nKey: "fatigue_key",
        value: "fatigue",
        imageS3Key: null,
      },
    ],
    dataMappers: [],
  },

  // Number question
  numberField: {
    id: "Question.number-weight",
    type: "number-field",
    text: "<p>What is your current weight?</p>",
    i18nKey: "weight_question_key",
    friendlyName: "Weight",
    dataPointKey: "patient.weight",
    required: true,
    validations: [
      {
        type: "required",
        text: "Weight is required",
        i18nKey: "weight_required_key",
        warningOnly: false,
      },
      {
        type: "min",
        value: "50",
        text: "Weight must be at least 50",
        i18nKey: "weight_min_key",
        warningOnly: false,
      },
      {
        type: "max",
        value: "500",
        text: "Weight must be at most 500",
        i18nKey: "weight_max_key",
        warningOnly: false,
      },
    ],
    choices: [],
    dataMappers: [],
  },

  // Numeric scale question
  numericScale: {
    id: "Question.numeric-scale-satisfaction",
    type: "numericScale",
    text: "<p>On a scale of 1-10, how satisfied are you with your treatment?</p>",
    i18nKey: "satisfaction_question_key",
    friendlyName: "Satisfaction",
    dataPointKey: "patient.satisfaction",
    required: true,
    validations: [
      {
        type: "required",
        text: "Please select a satisfaction level",
        i18nKey: "satisfaction_required_key",
        warningOnly: false,
      },
      {
        type: "min",
        value: "1",
        text: "Minimum value is 1",
        i18nKey: "satisfaction_min_key",
        warningOnly: false,
      },
      {
        type: "max",
        value: "10",
        text: "Maximum value is 10",
        i18nKey: "satisfaction_max_key",
        warningOnly: false,
      },
    ],
    choices: [],
    dataMappers: [],
  },

  // Date question
  dateField: {
    id: "Question.date-birthdate",
    type: "date-field",
    text: "<p>What is your date of birth?</p>",
    i18nKey: "birthdate_question_key",
    friendlyName: "Date of Birth",
    dataPointKey: "patient.birthdate",
    required: true,
    validations: [
      {
        type: "required",
        text: "Date of birth is required",
        i18nKey: "birthdate_required_key",
        warningOnly: false,
      },
    ],
    choices: [],
    dataMappers: [],
  },

  // Date-time question
  dateTimeField: {
    id: "Question.datetime-appointment",
    type: "date-time-field",
    text: "<p>When is your next appointment?</p>",
    i18nKey: "appointment_question_key",
    friendlyName: "Next Appointment",
    dataPointKey: "patient.nextAppointment",
    required: false,
    validations: [],
    choices: [],
    dataMappers: [],
  },
};

/**
 * Create a simple health survey activity
 */
export async function createHealthSurveyActivity() {
  const questions = [
    sampleQuestions.textField,
    sampleQuestions.singleSelect,
    sampleQuestions.multiSelect,
    sampleQuestions.numberField,
  ];

  const config = createActivityConfig(questions);
  const timestamp = Date.now();

  log("Creating Health Survey Activity", {
    questionsCount: questions.length,
    questionTypes: questions.map(q => q.type),
  });

  const activity = await ActivityService.createActivity({
    pk: `ACTIVITY-HEALTH-SURVEY-${timestamp}`,
    sk: `SK-${timestamp}`,
    name: "Health Survey",
    title: "Daily Health Survey",
    description: "A comprehensive health survey with multiple question types",
    type: "SURVEY",
    activityGroups: JSON.stringify(config.activityGroups),
    layouts: JSON.stringify(config.layouts),
    resumable: true,
    progressBar: true,
  });

  log("Health Survey Activity created successfully", {
    activityId: activity.id,
    pk: activity.pk,
    hasLayouts: !!activity.layouts,
    hasActivityGroups: !!activity.activityGroups,
  });
  return activity;
}

/**
 * Create a pain assessment activity
 */
export async function createPainAssessmentActivity() {
  const questions = [
    sampleQuestions.singleSelect, // Pain level
    sampleQuestions.numericScale, // Satisfaction
    sampleQuestions.textarea, // Notes
  ];

  const config = createActivityConfig(questions);
  const timestamp = Date.now();

  log("Creating Pain Assessment Activity", {
    questionsCount: questions.length,
    questionTypes: questions.map(q => q.type),
  });

  const activity = await ActivityService.createActivity({
    pk: `ACTIVITY-PAIN-ASSESSMENT-${timestamp}`,
    sk: `SK-${timestamp}`,
    name: "Pain Assessment",
    title: "Pain Assessment",
    description: "Assess pain levels and treatment satisfaction",
    type: "ASSESSMENT",
    activityGroups: JSON.stringify(config.activityGroups),
    layouts: JSON.stringify(config.layouts),
    resumable: true,
    progressBar: true,
  });

  log("Pain Assessment Activity created successfully", {
    activityId: activity.id,
    pk: activity.pk,
  });
  return activity;
}

/**
 * Create a comprehensive medical history activity
 */
export async function createMedicalHistoryActivity() {
  const questions = [
    sampleQuestions.textField, // Name
    sampleQuestions.dateField, // Birthdate
    sampleQuestions.numberField, // Weight
    sampleQuestions.multiSelect, // Symptoms
    sampleQuestions.textarea, // Notes
  ];

  const config = createActivityConfig(questions);
  const timestamp = Date.now();

  log("Creating Medical History Activity", {
    questionsCount: questions.length,
    questionTypes: questions.map(q => q.type),
  });

  const activity = await ActivityService.createActivity({
    pk: `ACTIVITY-MEDICAL-HISTORY-${timestamp}`,
    sk: `SK-${timestamp}`,
    name: "Medical History",
    title: "Medical History Form",
    description: "Comprehensive medical history collection",
    type: "FORM",
    activityGroups: JSON.stringify(config.activityGroups),
    layouts: JSON.stringify(config.layouts),
    resumable: true,
    progressBar: true,
  });

  log("Medical History Activity created successfully", {
    activityId: activity.id,
    pk: activity.pk,
  });
  return activity;
}

/**
 * Create tasks linked to activities and standalone tasks
 * Creates tasks for today + 5 days with a mix of types
 */
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

export async function createTasksForActivities(activities: any[]): Promise<{
  tasks: any[];
  taskCounter: { scheduled: number; timed: number; episodic: number };
}> {
  const now = Date.now();
  const tasks: any[] = [];
  const taskTypes = [TaskType.SCHEDULED, TaskType.TIMED, TaskType.EPISODIC];
  // Initialize task counter for numbering tasks by type
  const taskCounter = { scheduled: 0, timed: 0, episodic: 0 };
  const times = [
    { hour: 8, minute: 0 }, // 8:00 AM
    { hour: 11, minute: 45 }, // 11:45 AM
    { hour: 14, minute: 30 }, // 2:30 PM
    { hour: 17, minute: 0 }, // 5:00 PM
    { hour: 20, minute: 0 }, // 8:00 PM
  ];

  log("Creating tasks for activities", {
    activitiesCount: activities.length,
    activities: activities.map(a => ({
      id: a.id,
      pk: a.pk,
      title: a.title || a.name,
    })),
    daysToCreate: 6,
  });

  // Create tasks for today + 5 days (6 days total)
  for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
    const taskDate = new Date();
    taskDate.setDate(taskDate.getDate() + dayOffset);
    taskDate.setHours(0, 0, 0, 0);

    // Create 2-3 tasks per day
    const tasksPerDay = dayOffset === 0 ? 3 : 2; // More tasks today

    for (let i = 0; i < tasksPerDay; i++) {
      const timeIndex = i % times.length;
      const time = times[timeIndex];
      const taskDateTime = new Date(taskDate);
      taskDateTime.setHours(time.hour, time.minute, 0, 0);
      const expireTime = taskDateTime.getTime();

      const taskType = taskTypes[i % taskTypes.length];
      const taskTimestamp = Date.now() + dayOffset * 1000 + i;

      // Only create tasks with questions - always link to an activity
      if (activities.length === 0) {
        log("Skipping task creation - no activities available", {
          dayOffset,
          taskIndex: i,
        });
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

      log("Creating task with questions", {
        dayOffset,
        taskIndex: i,
        taskType,
        activityTitle: activity.title || activity.name,
        activityPk: activity.pk,
        expireTime: new Date(expireTime).toISOString(),
      });

      const task = await TaskService.createTask({
        pk: `TASK-${dayOffset}-${i}-${taskTimestamp}`,
        sk: `SK-${taskTimestamp}`,
        title: taskTitle,
        description:
          activity.description || `Complete ${activity.title || activity.name}`,
        taskType: taskType,
        status: TaskStatus.OPEN,
        startTimeInMillSec: now,
        expireTimeInMillSec: expireTime,
        entityId: activity.pk, // Always link to activity
        activityIndex: 0,
        showBeforeStart: true,
        allowEarlyCompletion: true,
        allowLateCompletion: true,
        allowLateEdits: false,
      });

      log("Task created successfully", {
        taskId: task.id,
        taskTitle: task.title,
        taskType: task.taskType,
        entityId: task.entityId,
        hasQuestions: !!task.entityId,
        dayOffset,
        expireTime: new Date(task.expireTimeInMillSec || 0).toISOString(),
      });

      tasks.push(task);
    }
  }

  log("All tasks created", {
    tasksCount: tasks.length,
    tasksWithQuestions: tasks.filter(t => t.entityId).length,
    taskIds: tasks.map(t => t.id),
    allTasksHaveQuestions: tasks.every(t => t.entityId),
  });

  return { tasks, taskCounter };
}

/**
 * Create a multi-page health assessment activity (like the example JSON)
 */
export async function createMultiPageHealthAssessmentActivity() {
  const timestamp = Date.now();
  const activityPk = `ACTIVITY-MULTI-PAGE-${timestamp}`;

  // Define all questions (from activityGroups)
  const questions = [
    {
      id: "Question.page1-name",
      type: "text",
      text: "<p>What is your full name?</p>",
      i18nKey: "question_name_key",
      friendlyName: "Full Name",
      dataPointKey: "patient.name",
      required: true,
      validations: [
        {
          name: "required",
          type: "required",
          value: null,
          text: "Name is required",
          i18nKey: "name_required_key",
          warningOnly: false,
        },
      ],
      choices: [],
      dataMappers: [],
    },
    {
      id: "Question.page1-age",
      type: "numericScale",
      text: "<p>What is your age?</p>",
      i18nKey: "question_age_key",
      friendlyName: "Age",
      dataPointKey: "patient.age",
      required: true,
      validations: [
        {
          name: "min",
          type: "min",
          value: "18",
          text: "Age must be at least 18",
          i18nKey: "age_min_key",
          warningOnly: false,
        },
        {
          name: "max",
          type: "max",
          value: "120",
          text: "Age must be less than 120",
          i18nKey: "age_max_key",
          warningOnly: false,
        },
      ],
      choices: [],
      dataMappers: [],
    },
    {
      id: "Question.page2-symptoms",
      type: "multiselect",
      text: "<p>Which symptoms are you currently experiencing? (Select all that apply)</p>",
      i18nKey: "question_symptoms_key",
      friendlyName: "Current Symptoms",
      dataPointKey: "patient.symptoms",
      required: false,
      validations: [],
      choices: [
        {
          id: "Choice.headache",
          order: 1,
          text: "Headache",
          i18nKey: "choice_headache_key",
          value: "headache",
          imageS3Key: null,
        },
        {
          id: "Choice.fever",
          order: 2,
          text: "Fever",
          i18nKey: "choice_fever_key",
          value: "fever",
          imageS3Key: null,
        },
        {
          id: "Choice.cough",
          order: 3,
          text: "Cough",
          i18nKey: "choice_cough_key",
          value: "cough",
          imageS3Key: null,
        },
        {
          id: "Choice.fatigue",
          order: 4,
          text: "Fatigue",
          i18nKey: "choice_fatigue_key",
          value: "fatigue",
          imageS3Key: null,
        },
      ],
      dataMappers: [],
    },
    {
      id: "Question.page2-pain-level",
      type: "horizontalvas",
      text: "<p>On a scale of 0 to 10, how would you rate your current pain level?</p>",
      i18nKey: "question_pain_level_key",
      friendlyName: "Pain Level",
      dataPointKey: "patient.painLevel",
      required: true,
      validations: [],
      choices: [],
      dataMappers: [],
    },
    {
      id: "Question.page3-medications",
      type: "text",
      text: "<p>List any medications you are currently taking:</p>",
      i18nKey: "question_medications_key",
      friendlyName: "Current Medications",
      dataPointKey: "patient.medications",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    },
    {
      id: "Question.page3-allergies",
      type: "multiselect",
      text: "<p>Do you have any allergies? (Select all that apply)</p>",
      i18nKey: "question_allergies_key",
      friendlyName: "Allergies",
      dataPointKey: "patient.allergies",
      required: false,
      validations: [],
      choices: [
        {
          id: "Choice.allergy-none",
          order: 1,
          text: "No known allergies",
          i18nKey: "choice_no_allergies_key",
          value: "none",
          imageS3Key: null,
        },
        {
          id: "Choice.allergy-penicillin",
          order: 2,
          text: "Penicillin",
          i18nKey: "choice_penicillin_key",
          value: "penicillin",
          imageS3Key: null,
        },
        {
          id: "Choice.allergy-latex",
          order: 3,
          text: "Latex",
          i18nKey: "choice_latex_key",
          value: "latex",
          imageS3Key: null,
        },
        {
          id: "Choice.allergy-other",
          order: 4,
          text: "Other",
          i18nKey: "choice_other_allergy_key",
          value: "other",
          imageS3Key: null,
        },
      ],
      dataMappers: [],
    },
    {
      id: "Question.page4-vitals",
      type: "bloodPressure",
      text: "<p>Please enter your blood pressure reading:</p>",
      i18nKey: "question_blood_pressure_key",
      friendlyName: "Blood Pressure",
      dataPointKey: "patient.bloodPressure",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    },
    {
      id: "Question.page4-weight",
      type: "weight",
      text: "<p>What is your current weight?</p>",
      i18nKey: "question_weight_key",
      friendlyName: "Weight",
      dataPointKey: "patient.weight",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    },
    {
      id: "Question.page4-vitals-date",
      type: "date",
      text: "<p>When were these vitals measured?</p>",
      i18nKey: "question_vitals_date_key",
      friendlyName: "Vitals Date",
      dataPointKey: "patient.vitalsMeasuredAtDate",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    },
    {
      id: "Question.page4-followup-datetime",
      type: "date-time-field",
      text: "<p>Select a follow-up appointment date and time:</p>",
      i18nKey: "question_followup_datetime_key",
      friendlyName: "Follow-up Date/Time",
      dataPointKey: "patient.followupDateTime",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    },
  ];

  // Create activityGroups structure
  const activityGroups = [
    {
      id: "group-health-assessment",
      questions: questions,
    },
  ];

  // Create layouts with multiple screens
  const layouts = [
    {
      id: "layout-mobile",
      type: "MOBILE",
      useGesture: null,
      pageButtons: null,
      titleAlignment: "center",
      viewportWidth: 360,
      screens: [
        {
          id: "screen-page-1",
          name: "Personal Information",
          order: 1,
          text: "Personal Information",
          i18nKey: "screen_personal_info_key",
          displayProperties: [
            { key: "paddingTop", value: "20" },
            { key: "paddingBottom", value: "20" },
            { key: "paddingLeft", value: "15" },
            { key: "paddingRight", value: "15" },
          ],
          elements: [
            {
              id: "Question.page1-name",
              order: 1,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("text") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
                { key: "paddingLeft", value: "0" },
                { key: "paddingRight", value: "0" },
                { key: "fontSize", value: "16" },
                { key: "fontFamily", value: "Arial" },
              ],
            },
            {
              id: "Question.page1-age",
              order: 2,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("numericScale") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
                { key: "scaleMin", value: "0" },
                { key: "scaleMax", value: "120" },
                { key: "scaleIncrements", value: "1" },
              ],
            },
          ],
        },
        {
          id: "screen-page-2",
          name: "Symptoms Assessment",
          order: 2,
          text: "Symptoms Assessment",
          i18nKey: "screen_symptoms_key",
          displayProperties: [
            { key: "paddingTop", value: "20" },
            { key: "paddingBottom", value: "20" },
            { key: "paddingLeft", value: "15" },
            { key: "paddingRight", value: "15" },
          ],
          elements: [
            {
              id: "Question.page2-symptoms",
              order: 1,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("multiselect") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
                { key: "optionPlacement", value: JSON.stringify("below") },
              ],
            },
            {
              id: "Question.page2-pain-level",
              order: 2,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("horizontalvas") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "20" },
                { key: "marginBottom", value: "10" },
                { key: "scaleMin", value: "0" },
                { key: "scaleMax", value: "10" },
                { key: "lowerRangei18nKey", value: "pain_scale_low_key" },
                { key: "upperRangei18nKey", value: "pain_scale_high_key" },
              ],
            },
          ],
        },
        {
          id: "screen-page-3",
          name: "Medical History",
          order: 3,
          text: "Medical History",
          i18nKey: "screen_medical_history_key",
          displayProperties: [
            { key: "paddingTop", value: "20" },
            { key: "paddingBottom", value: "20" },
            { key: "paddingLeft", value: "15" },
            { key: "paddingRight", value: "15" },
          ],
          elements: [
            {
              id: "Question.page3-medications",
              order: 1,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("text") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
              ],
            },
            {
              id: "Question.page3-allergies",
              order: 2,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("multiselect") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
                { key: "optionPlacement", value: JSON.stringify("below") },
              ],
            },
          ],
        },
        {
          id: "screen-page-4",
          name: "Vitals & Documentation",
          order: 4,
          text: "Vitals & Documentation",
          i18nKey: "screen_vitals_key",
          displayProperties: [
            { key: "paddingTop", value: "20" },
            { key: "paddingBottom", value: "20" },
            { key: "paddingLeft", value: "15" },
            { key: "paddingRight", value: "15" },
          ],
          elements: [
            {
              id: "Question.page4-vitals",
              order: 1,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("bloodpressure") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
                { key: "uniti18nKey", value: "unit_mmhg_key" },
              ],
            },
            {
              id: "Question.page4-weight",
              order: 2,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("weight") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
                { key: "uniti18nKey", value: "unit_lbs_key" },
              ],
            },
            {
              id: "Question.page4-vitals-date",
              order: 3,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("date") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
              ],
            },
            {
              id: "Question.page4-followup-datetime",
              order: 4,
              type: null,
              displayProperties: [
                { key: "fieldType", value: JSON.stringify("date-time") },
                { key: "width", value: JSON.stringify("100%") },
                { key: "marginTop", value: "10" },
                { key: "marginBottom", value: "10" },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Introduction, summary, and completion screens
  const introductionScreen = {
    showScreen: true,
    title: "Welcome to the Health Assessment",
    titleI18nKey: "intro_title_key",
    description:
      "This assessment will take approximately 5 minutes to complete. Please answer all questions to the best of your ability.",
    descriptionI18nKey: "intro_description_key",
    buttonText: "Begin Assessment",
    buttonTextI18nKey: "begin_button_key",
  };

  const summaryScreen = {
    showScreen: true,
    title: "Review Your Answers",
    titleI18nKey: "summary_title_key",
    description: "Please review your answers before submitting.",
    descriptionI18nKey: "summary_description_key",
  };

  const completionScreen = {
    showScreen: true,
    title: "Thank You!",
    titleI18nKey: "completion_title_key",
    description: "Your assessment has been submitted successfully.",
    descriptionI18nKey: "completion_description_key",
  };

  const activityConfig = {
    layouts,
    activityGroups,
    introductionScreen,
    summaryScreen,
    completionScreen,
  };

  log("Creating Multi-Page Health Assessment Activity", {
    screensCount: layouts[0].screens.length,
    questionsCount: questions.length,
    hasIntroduction: introductionScreen.showScreen,
    hasSummary: summaryScreen.showScreen,
    hasCompletion: completionScreen.showScreen,
  });

  const activity = await ActivityService.createActivity({
    pk: activityPk,
    sk: `SK-${timestamp}`,
    name: "Multi-Page Health Questionnaire",
    title: "Health Assessment",
    description: "Please complete all pages of this health assessment",
    type: "QUESTIONNAIRE",
    activityGroups: JSON.stringify(activityGroups),
    layouts: JSON.stringify(layouts),
    resumable: true,
    progressBar: true,
  });

  // Create the full JSON structure matching the provided format
  // Structure: { pk, sk, version, name, title, activityGroups, layouts, introductionScreen, summaryScreen, completionScreen, ... }
  const fullActivityJson = {
    pk: activityPk,
    sk: `SK-${timestamp}`,
    version: 1,
    name: "Multi-Page Health Questionnaire",
    title: "Health Assessment",
    titleI18nKey: "health_assessment_title_key",
    description: "Please complete all pages of this health assessment",
    descriptionI18nKey: "health_assessment_description_key",
    type: "QUESTIONNAIRE",
    isDeleted: 0,
    fontFamily: "Arial",
    fontWeight: "normal",
    fontColor: "#000000",
    fontSize: "16",
    activityType: "EPRO",
    layoutType: "MOBILE",
    resumable: true,
    activityGroups,
    layouts,
    introductionScreen,
    summaryScreen,
    completionScreen,
    calculatedValues: [],
    crossForms: [],
  };

  // Update the activity with the full JSON structure in layouts field
  await ActivityService.updateActivity(activity.id, {
    layouts: JSON.stringify(fullActivityJson),
  });

  log("Multi-Page Health Assessment Activity created successfully", {
    activityId: activity.id,
    pk: activity.pk,
    screensCount: layouts[0].screens.length,
  });

  return activity;
}

/**
 * Main seed function - creates all activities and tasks
 */
export async function seedQuestionData() {
  log("========================================");
  log("Starting to seed question data...");
  log("========================================");

  try {
    // Create activities
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

    // Create tasks linked to activities
    log("Step 2: Creating tasks linked to activities");

    // Include multi-page activity in the list so it gets tasks created for multiple days
    const allActivities = [
      multiPageHealth,
      healthSurvey,
      painAssessment,
      medicalHistory,
    ];
    const { tasks, taskCounter } =
      await createTasksForActivities(allActivities);

    // Ensure at least one multi-page task per day for the first 3 days
    const now = Date.now();
    const times = [
      { hour: 8, minute: 0 },
      { hour: 11, minute: 45 },
      { hour: 14, minute: 30 },
    ];

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + dayOffset);
      taskDate.setHours(0, 0, 0, 0);

      const time = times[dayOffset % times.length];
      const taskDateTime = new Date(taskDate);
      taskDateTime.setHours(time.hour, time.minute, 0, 0);
      const expireTime = taskDateTime.getTime();

      // Check if we already have a multi-page task for this day
      const existingMultiPageTask = tasks.find(
        t =>
          t.entityId === multiPageHealth.pk &&
          t.expireTimeInMillSec &&
          Math.abs(t.expireTimeInMillSec - expireTime) < 86400000 // Within same day
      );

      if (!existingMultiPageTask) {
        const taskTimestamp = Date.now() + dayOffset * 1000;
        taskCounter.scheduled++;
        const task = await TaskService.createTask({
          pk: `TASK-MULTI-PAGE-${dayOffset}-${taskTimestamp}`,
          sk: `SK-${taskTimestamp}`,
          title: `${getTaskTypeName(TaskType.SCHEDULED)} Task ${taskCounter.scheduled}`,
          description: "Complete the multi-page health questionnaire",
          taskType: TaskType.SCHEDULED,
          status: TaskStatus.OPEN,
          entityId: multiPageHealth.pk,
          activityIndex: 0,
          startTimeInMillSec: now,
          expireTimeInMillSec: expireTime,
          showBeforeStart: true,
          allowEarlyCompletion: true,
          allowLateCompletion: true,
          allowLateEdits: false,
        });

        log("Created multi-page task", {
          taskId: task.id,
          dayOffset,
          expireTime: new Date(expireTime).toISOString(),
        });

        tasks.push(task);
      }
    }

    log("========================================");
    log("Seeding complete!");
    log("========================================");
    log("Summary:", {
      activities: {
        count: activities.length,
        ids: activities.map(a => a.id),
        pks: activities.map(a => a.pk),
      },
      tasks: {
        count: tasks.length,
        ids: tasks.map(t => t.id),
        entityIds: tasks.map(t => t.entityId),
      },
    });

    return {
      activities,
      tasks,
    };
  } catch (error: any) {
    log("ERROR: Seeding failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error("[SeedScript] Full error:", error);
    throw error;
  }
}

// Export sample questions for reference
export { sampleQuestions };
