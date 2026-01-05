/**
 * Default configuration for temp answer sync
 * Package-owned mutation document and mapper
 */

import type {
  BuildSaveTempAnswersVariablesInput,
  BuildSaveTempAnswersVariablesResult,
  TaskSystemSaveTempAnswersMapper,
} from "@task-types/tempAnswerSync";

/**
 * Default GraphQL mutation document for saving temp answers.
 * Uses AppSync native types (AWSJSON, AWSDateTime).
 *
 * This is package-owned - host apps don't need to provide this.
 */
export const DEFAULT_SAVE_TEMP_ANSWERS_MUTATION = `mutation SaveTaskTempAnswers(
  $taskPk: String!
  $activityId: String!
  $answers: AWSJSON!
  $localtime: AWSDateTime!
) {
  saveTaskTempAnswers(
    input: {
      taskPk: $taskPk
      activityId: $activityId
      answers: $answers
      localtime: $localtime
    }
  ) {
    taskPk
    activityId
    answers
    localtime
    updatedAt
  }
}`;

/**
 * Default GraphQL query document for retrieving saved temp answers.
 * Returns all temp answers for a given task, sorted by most recent first.
 *
 * This is package-owned - host apps don't need to provide this.
 */
export const DEFAULT_GET_TEMP_ANSWERS_QUERY = `query GetTempAnswers($taskPk: String!) {
  getTempAnswers(taskPk: $taskPk) {
    taskPk
    activityId
    answers
    localtime
    updatedAt
  }
}`;

/**
 * Default mapper for temp answer variables.
 * Package-owned - knows how to extract data from Task/Activity types.
 *
 * Host apps can override this if they need custom logic.
 */
export const defaultTempAnswersMapper: TaskSystemSaveTempAnswersMapper = ({
  task,
  activity,
  answers,
  localtime,
}: BuildSaveTempAnswersVariablesInput): BuildSaveTempAnswersVariablesResult => {
  // DEBUG: Log what we're about to send
  console.log("[TempAnswerMapper] Preparing to save:", {
    sampleKeys: Object.keys(answers).slice(0, 5),
    firstKey: Object.keys(answers)[0],
    firstValue: answers[Object.keys(answers)[0]],
  });

  return {
    stableKey: task.pk, // For outbox deduplication
    variables: {
      taskPk: task.pk,
      activityId: activity.pk ?? activity.id,
      answers: JSON.stringify(answers), // AWSJSON expects JSON string
      localtime, // Already ISO string format
    },
  };
};
