/**
 * DataStore model name constants
 * Use these constants instead of string literals when comparing model names
 * to prevent typos and enable refactoring
 */
export const ModelName = {
  Activity: "Activity",
  Appointment: "Appointment",
  DataPoint: "DataPoint",
  DataPointInstance: "DataPointInstance",
  Question: "Question",
  Task: "Task",
  TaskAnswer: "TaskAnswer",
  TaskHistory: "TaskHistory",
  TaskResult: "TaskResult",
  Todo: "Todo",
} as const;

export type ModelNameType = (typeof ModelName)[keyof typeof ModelName];
