import type { Activity } from "@task-types/Activity";
import type { Task } from "@task-types/Task";

export type TaskSystemGraphQLExecutorRequest = {
  document: string;
  variables: Record<string, unknown>;
};

export type TaskSystemGraphQLExecutorResponse = {
  data?: unknown;
  errors?: unknown;
};

/**
 * Host-provided GraphQL executor.
 *
 * The task-system package does not own Apollo/Amplify API clients for LX. The host
 * provides a simple "execute" function that can run a GraphQL document with variables.
 */
export type TaskSystemGraphQLExecutor = {
  execute: (
    request: TaskSystemGraphQLExecutorRequest
  ) => Promise<TaskSystemGraphQLExecutorResponse>;
};

export type BuildSaveTempAnswersVariablesInput = {
  task: Task;
  activity: Activity;
  answers: Record<string, unknown>;
  localtime: string;
};

export type BuildSaveTempAnswersVariablesResult = {
  /**
   * Stable idempotency key for deduplication.
   *
   * Contract: use `task.pk`.
   */
  stableKey: string;
  variables: Record<string, unknown>;
  /**
   * Optional document override for this payload. If not provided, the configured
   * default document is used.
   */
  document?: string;
};

/**
 * Host-provided mapper to shape the exact variables payload required by LX.
 *
 * Returns null if a temp-save should not be attempted for the given input.
 */
export type TaskSystemSaveTempAnswersMapper = (
  input: BuildSaveTempAnswersVariablesInput
) => BuildSaveTempAnswersVariablesResult | null;

export type TempAnswerSyncConfig = {
  executor: TaskSystemGraphQLExecutor;
  mapper: TaskSystemSaveTempAnswersMapper;
  /**
   * Default GraphQL document used for temp save calls. Can be overridden per-call
   * by the mapper returning `document`.
   */
  document: string;
  /**
   * AsyncStorage key for the outbox.
   *
   * Default: "@task-system/temp-answers-outbox"
   */
  storageKey?: string;
};
