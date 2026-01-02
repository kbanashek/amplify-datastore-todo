/**
 * DataStore model name constants
 * Use these constants instead of string literals when comparing model names
 * to prevent typos and enable refactoring
 *
 * @example
 * ```typescript
 * if (modelConstructor.name === ModelName.Task) {
 *   // Handle Task model
 * }
 * ```
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
} as const;

/**
 * Union type of all model name values
 * Derived from the ModelName constant object
 */
export type ModelNameType = (typeof ModelName)[keyof typeof ModelName];
