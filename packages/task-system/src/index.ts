export { TaskActivityModule } from "./TaskActivityModule";

// Optional: expose internal building blocks for LX teams if they want to compose.
export { TaskContainer } from "./src/components/TaskContainer";
export { GroupedTasksView } from "./src/components/GroupedTasksView";

// Question flow + question components
export * from "./src/components/questions";

// Reusable UI building blocks
export * from "./src/components/ui";

// Export all services - single source of truth
export { TaskService } from "./src/services/TaskService";
export { ActivityService } from "./src/services/ActivityService";
export { QuestionService } from "./src/services/QuestionService";
export { DataPointService } from "./src/services/DataPointService";
export { TaskAnswerService } from "./src/services/TaskAnswerService";
export { TaskResultService } from "./src/services/TaskResultService";
export { TaskHistoryService } from "./src/services/TaskHistoryService";
export { AppointmentService } from "./src/services/AppointmentService";
export { SeededDataCleanupService } from "./src/services/SeededDataCleanupService";
export {
  TranslationService,
  getTranslationService,
} from "./src/services/TranslationService";
export { TranslationMemoryService } from "./src/services/TranslationMemoryService";
export { ConflictResolution } from "./src/services/ConflictResolution";
export * from "./src/services/translationTypes";

// Export all hooks - single source of truth
export { useActivity } from "./src/hooks/useActivity";
export { useActivityData } from "./src/hooks/useActivityData";
export { useActivityList } from "./src/hooks/useActivityList";
export {
  useAmplifyState,
  NetworkStatus,
  SyncState,
  DataStoreEventType,
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
export { useQuestionsScreen } from "./src/hooks/useQuestionsScreen";
export { useQuestionSubmission } from "./src/hooks/useQuestionSubmission";
export { useQuestionValidation } from "./src/hooks/useQuestionValidation";
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
export type {
  TaskFilters,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from "./src/types/Task";
export { TaskStatus, TaskType } from "./src/types/Task";
export type { Activity } from "./src/types/Activity";
export type { Question } from "./src/types/Question";
export type {
  Appointment,
  GroupedAppointment,
  AppointmentData,
} from "./src/types/Appointment";
export { AppointmentStatus, AppointmentType } from "./src/types/Appointment";
export type { DataPoint } from "./src/types/DataPoint";
export type { TaskAnswer } from "./src/types/TaskAnswer";
export type { TaskResult } from "./src/types/TaskResult";
export type { TaskHistory } from "./src/types/TaskHistory";
export type {
  ActivityConfig,
  ParsedElement,
  ParsedScreen,
} from "./src/types/ActivityConfig";
export {
  QuestionType,
  ValidationType,
} from "./src/types/activity-config-enums";

// Activity parsing types/utils
export type { ParsedActivityData } from "./src/utils/activityParser";
export {
  parseActivityConfig,
  getDisplayProperty,
} from "./src/utils/activityParser";

// Export utils commonly used by host apps
export {
  formatTime,
  formatTimeRange,
  getTimezoneAbbreviation,
  parseAppointmentData,
  groupAppointmentsByDate,
  formatDateLabel,
} from "./src/utils/appointmentParser";

// Export constants
export { ModelName } from "./src/constants/modelNames";
export type { ModelNameType } from "./src/constants/modelNames";
export { OperationSource } from "./src/constants/operationSource";
export type { OperationSourceType } from "./src/constants/operationSource";
export { AWSErrorName } from "./src/constants/awsErrors";
export type { AWSErrorNameType } from "./src/constants/awsErrors";

// Export contexts
export { AmplifyProvider, useAmplify } from "./src/contexts/AmplifyContext";
export {
  TranslationProvider,
  useTranslation,
} from "./src/contexts/TranslationContext";
