/**
 * Centralized mock data exports for testing and UI development.
 *
 * Import all mocks from a single location for convenience.
 *
 * @example
 * ```typescript
 * import { createMockTask, createMockAppointment } from "@orion/task-system/src/__mocks__";
 * ```
 */

// Data factories
export { createMockTask } from "./Task.mock";
export { createMockAppointment } from "./Appointment.mock";
export { createMockGroupedTask } from "./GroupedTask.mock";

// Translation mocks
export {
  createMockI18n,
  createMockTFunction,
  createMockTranslationContext,
  mockTranslationMemory,
  snapshotTestData,
  mockAsyncStorage,
  createMockI18nManager,
} from "./translationMocks";
