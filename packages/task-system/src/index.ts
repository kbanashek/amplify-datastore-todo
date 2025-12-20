export { TaskActivityModule } from "./TaskActivityModule";

// Optional: expose internal building blocks for LX teams if they want to compose.
export { GroupedTasksView } from "./src/components/GroupedTasksView";
export { TaskContainer } from "./src/components/TaskContainer";

// Runtime initialization (LX-style: host owns Amplify.configure)
export { initTaskSystem } from "./src/runtime/taskSystem";
export type { TaskSystemInitOptions } from "./src/runtime/taskSystem";

// Fixture import (LX-owned disk data -> DataStore/AsyncStorage materialization)
export type {
  ImportTaskSystemFixtureOptions,
  ImportTaskSystemFixtureResult,
  TaskSystemFixture,
  TaskSystemFixtureVersion,
} from "./src/fixtures/TaskSystemFixture";
export { FixtureImportService } from "./src/services/FixtureImportService";

// Question flow + question components
export * from "./src/components/questions";

// Reusable UI building blocks
export * from "./src/components/ui";

// Export all services - single source of truth
export { ActivityService } from "./src/services/ActivityService";
export { AppointmentService } from "./src/services/AppointmentService";
export { ConflictResolution } from "./src/services/ConflictResolution";
export { DataPointService } from "./src/services/DataPointService";
export { QuestionService } from "./src/services/QuestionService";
export { SeededDataCleanupService } from "./src/services/SeededDataCleanupService";
export { TaskAnswerService } from "./src/services/TaskAnswerService";
export { TaskHistoryService } from "./src/services/TaskHistoryService";
export { TaskResultService } from "./src/services/TaskResultService";
export { TaskService } from "./src/services/TaskService";
export { TempAnswerSyncService } from "./src/services/TempAnswerSyncService";
export { TranslationMemoryService } from "./src/services/TranslationMemoryService";
export {
  TranslationService,
  getTranslationService,
} from "./src/services/TranslationService";
export * from "./src/services/translationTypes";

// Export all hooks - single source of truth
export { useActivity } from "./src/hooks/useActivity";
export { useActivityData } from "./src/hooks/useActivityData";
export { useActivityList } from "./src/hooks/useActivityList";
export {
  DataStoreEventType,
  NetworkStatus,
  SyncState,
  useAmplifyState,
} from "./src/hooks/useAmplifyState";
export type { AmplifyState } from "./src/hooks/useAmplifyState";
export { useAnswerManagement } from "./src/hooks/useAnswerManagement";
export { useAppointmentList } from "./src/hooks/useAppointmentList";
export { useColorScheme } from "./src/hooks/useColorScheme";
export { useDataPointInstance } from "./src/hooks/useDataPointInstance";
export { useDataPointList } from "./src/hooks/useDataPointList";
export { useGroupedTasks } from "./src/hooks/useGroupedTasks";
export { useNetworkStatus } from "./src/hooks/useNetworkStatus";
export { useQuestionList } from "./src/hooks/useQuestionList";
export { useQuestionNavigation } from "./src/hooks/useQuestionNavigation";
export { useQuestionScreenButtons } from "./src/hooks/useQuestionScreenButtons";
export { useQuestionSubmission } from "./src/hooks/useQuestionSubmission";
export { useQuestionValidation } from "./src/hooks/useQuestionValidation";
export { useQuestionsScreen } from "./src/hooks/useQuestionsScreen";
export { useRTL } from "./src/hooks/useRTL";
export { useTaskAnswer } from "./src/hooks/useTaskAnswer";
export { useTaskAnswerList } from "./src/hooks/useTaskAnswerList";
export { useTaskContainer } from "./src/hooks/useTaskContainer";
export { useTaskFilters } from "./src/hooks/useTaskFilters";
export { useTaskForm } from "./src/hooks/useTaskForm";
export { useTaskHistoryList } from "./src/hooks/useTaskHistoryList";
export { useTaskList } from "./src/hooks/useTaskList";
export { useTaskResultList } from "./src/hooks/useTaskResultList";
export { useTaskUpdate } from "./src/hooks/useTaskUpdate";
export { useThemeColor } from "./src/hooks/useThemeColor";
export { useTranslatedText } from "./src/hooks/useTranslatedText";

// Export types
export type { GroupedTask } from "./src/hooks/useGroupedTasks";
export type { Activity } from "./src/types/Activity";
export type {
  ActivityConfig,
  ParsedElement,
  ParsedScreen,
} from "./src/types/ActivityConfig";
export { AppointmentStatus, AppointmentType } from "./src/types/Appointment";
export type {
  Appointment,
  AppointmentData,
  GroupedAppointment,
} from "./src/types/Appointment";
export type { DataPoint } from "./src/types/DataPoint";
export type { Question } from "./src/types/Question";
export { TaskStatus, TaskType } from "./src/types/Task";
export type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from "./src/types/Task";
export type { TaskAnswer } from "./src/types/TaskAnswer";
export type { TaskHistory } from "./src/types/TaskHistory";
export type { TaskResult } from "./src/types/TaskResult";
export {
  QuestionType,
  ValidationType,
} from "./src/types/activity-config-enums";

// Temp answer (LX-integrated) types
export type {
  BuildSaveTempAnswersVariablesInput,
  BuildSaveTempAnswersVariablesResult,
  TaskSystemGraphQLExecutor,
  TaskSystemGraphQLExecutorRequest,
  TaskSystemGraphQLExecutorResponse,
  TaskSystemSaveTempAnswersMapper,
  TempAnswerSyncConfig,
} from "./src/types/tempAnswerSync";

// Activity parsing types/utils
export {
  getDisplayProperty,
  parseActivityConfig,
} from "./src/utils/activityParser";
export type { ParsedActivityData } from "./src/utils/activityParser";

// Export utils commonly used by host apps
export {
  formatDateLabel,
  formatTime,
  formatTimeRange,
  getTimezoneAbbreviation,
  groupAppointmentsByDate,
  parseAppointmentData,
} from "./src/utils/appointmentParser";

// Export constants
export { AWSErrorName } from "./src/constants/awsErrors";
export type { AWSErrorNameType } from "./src/constants/awsErrors";
export { ModelName } from "./src/constants/modelNames";
export type { ModelNameType } from "./src/constants/modelNames";
export { OperationSource } from "./src/constants/operationSource";
export type { OperationSourceType } from "./src/constants/operationSource";

// Export contexts
export { AmplifyProvider, useAmplify } from "./src/contexts/AmplifyContext";
export {
  TranslationProvider,
  useTranslation,
} from "./src/contexts/TranslationContext";
