import { useActivity } from "@hooks/useActivity";
import { useTaskAnswer } from "@hooks/useTaskAnswer";
import { TaskService } from "@services/TaskService";
import type { Activity } from "@task-types/Activity";
import type {
  ActivityConfig,
  ActivityGroup,
  Layout,
} from "@task-types/ActivityConfig";
import type { AnswerValue } from "@task-types/AnswerValue";
import { getServiceLogger } from "@utils/logging/serviceLogger";
import {
  ParsedActivityData,
  parseActivityConfig,
} from "@utils/parsers/activityParser";
import { DataStore } from "@aws-amplify/datastore";
import { useEffect, useRef, useState } from "react";
import { TaskTempAnswer } from "../models";
import { safeJsonParseDeep } from "@utils/parsers/safeJsonParse";

const logger = getServiceLogger("useActivityData");

/**
 * Interface representing a map of question IDs to answer values.
 * Answer values can be strings, numbers, booleans, arrays, or objects as defined by AnswerValue.
 */
interface AnswersMap {
  [key: string]: AnswerValue;
}

/**
 * Return type for the useActivityData hook.
 */
export interface UseActivityDataReturn {
  loading: boolean;
  error: string | null;
  activity: Activity | null;
  activityData: ParsedActivityData | null;
  activityConfig: ActivityConfig | null;
  initialAnswers: AnswersMap;
}

/**
 * Options for the useActivityData hook.
 */
export interface UseActivityDataOptions {
  entityId: string | undefined;
  taskId: string | undefined;
}

/**
 * Hook for fetching and parsing activity data
 * Handles activity loading, config parsing, and initial answer loading
 */
export const useActivityData = ({
  entityId,
  taskId,
}: UseActivityDataOptions): UseActivityDataReturn => {
  const {
    activity,
    loading: activityLoading,
    error: activityError,
  } = useActivity(entityId || null);
  const { taskAnswers, getAnswersByTaskId } = useTaskAnswer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ParsedActivityData | null>(
    null
  );
  const [activityConfig, setActivityConfig] = useState<ActivityConfig | null>(
    null
  );
  const [initialAnswers, setInitialAnswers] = useState<AnswersMap>({});

  // Use ref to avoid recreating subscription when taskAnswers changes
  const taskAnswersRef = useRef(taskAnswers);
  taskAnswersRef.current = taskAnswers;

  useEffect(() => {
    const fetchActivity = async () => {
      // Wait for activity to load
      if (activityLoading) {
        return;
      }

      if (!entityId) {
        const errorMsg =
          "This task does not have an associated activity. Please ensure the task has an entityId that links to an Activity.";
        logger.error("❌ No entityId provided to useActivityData", {
          taskId,
          error: errorMsg,
        });
        setError(errorMsg);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!activity) {
          if (activityError) {
            setError(activityError);
          } else {
            setError(`Activity not found: ${entityId}`);
          }
          setLoading(false);
          return;
        }

        // Reconstruct the full JSON structure matching the provided format
        const parsedConfig: ActivityConfig = {};

        // Parse layouts - supports double-encoded JSON strings (common when host stores JSON as string)
        if (activity.layouts) {
          const parsedLayouts = safeJsonParseDeep(activity.layouts, 3);

          if (parsedLayouts === null) {
            logger.error(
              "Error parsing layouts (invalid JSON)",
              undefined,
              "ActivityConfig",
              "❌"
            );
          } else if (
            typeof parsedLayouts === "object" &&
            parsedLayouts !== null &&
            !Array.isArray(parsedLayouts) &&
            ("activityGroups" in parsedLayouts ||
              "layouts" in parsedLayouts ||
              "screens" in parsedLayouts ||
              "introductionScreen" in parsedLayouts ||
              "summaryScreen" in parsedLayouts ||
              "completionScreen" in parsedLayouts)
          ) {
            // Full JSON structure - extract all parts
            const full = parsedLayouts as Record<string, unknown>;
            const fullActivityGroups = safeJsonParseDeep(
              full.activityGroups,
              2
            );
            if (Array.isArray(fullActivityGroups)) {
              parsedConfig.activityGroups =
                fullActivityGroups as unknown as ActivityGroup[];
            } else if (
              fullActivityGroups &&
              typeof fullActivityGroups === "object"
            ) {
              parsedConfig.activityGroups = [
                fullActivityGroups as unknown as ActivityGroup,
              ];
            }

            const fullLayouts = safeJsonParseDeep(full.layouts, 2);
            if (Array.isArray(fullLayouts)) {
              parsedConfig.layouts = fullLayouts as unknown as Layout[];
            } else if (fullLayouts && typeof fullLayouts === "object") {
              parsedConfig.layouts = [fullLayouts as unknown as Layout];
            } else {
              parsedConfig.layouts = [];
            }

            // Some sources provide `screens` directly at the top level (LX-style)
            const fullScreens = safeJsonParseDeep(full.screens, 2);
            if (Array.isArray(fullScreens)) {
              parsedConfig.screens =
                fullScreens as unknown as ActivityConfig["screens"];
            }
            parsedConfig.introductionScreen =
              full.introductionScreen as ActivityConfig["introductionScreen"];
            parsedConfig.summaryScreen =
              full.summaryScreen as ActivityConfig["summaryScreen"];
            parsedConfig.completionScreen =
              full.completionScreen as ActivityConfig["completionScreen"];
          } else if (Array.isArray(parsedLayouts)) {
            parsedConfig.layouts = parsedLayouts as unknown as Layout[];
          } else if (
            typeof parsedLayouts === "object" &&
            parsedLayouts !== null
          ) {
            // This may be either:
            // 1) A single layout object, or
            // 2) A container object that includes `layouts` and/or `screens`.
            const container = parsedLayouts as Record<string, unknown>;

            const containerLayouts = safeJsonParseDeep(container.layouts, 2);
            if (Array.isArray(containerLayouts)) {
              parsedConfig.layouts = containerLayouts as unknown as Layout[];
            } else if (
              containerLayouts &&
              typeof containerLayouts === "object"
            ) {
              parsedConfig.layouts = [containerLayouts as unknown as Layout];
            } else {
              // Fallback: treat the object itself as a single layout.
              parsedConfig.layouts = [parsedLayouts as unknown as Layout];
            }

            const containerScreens = safeJsonParseDeep(container.screens, 2);
            if (Array.isArray(containerScreens)) {
              parsedConfig.screens =
                containerScreens as unknown as ActivityConfig["screens"];
            }
          } else {
            // If it's still a string/primitive after parsing attempts, treat as unusable.
            parsedConfig.layouts = [];
          }
        }

        // Parse activityGroups (if not already extracted)
        if (!parsedConfig.activityGroups && activity.activityGroups) {
          const parsedGroups = safeJsonParseDeep(activity.activityGroups, 3);
          if (parsedGroups === null) {
            logger.error(
              "Error parsing activityGroups (invalid JSON)",
              undefined,
              "ActivityConfig",
              "❌"
            );
          } else {
            if (Array.isArray(parsedGroups)) {
              parsedConfig.activityGroups =
                parsedGroups as unknown as ActivityGroup[];
            } else if (parsedGroups && typeof parsedGroups === "object") {
              parsedConfig.activityGroups = [
                parsedGroups as unknown as ActivityGroup,
              ];
            }
          }
        }

        // Load existing answers from TaskAnswer (final submitted answers)
        const existingAnswers: AnswersMap = {};
        if (taskId) {
          const taskAnswersForTask = getAnswersByTaskId(taskId);
          taskAnswersForTask.forEach(ta => {
            if (ta.questionId && ta.answer) {
              try {
                existingAnswers[ta.questionId] = JSON.parse(ta.answer);
              } catch {
                existingAnswers[ta.questionId] = ta.answer;
              }
            }
          });
        }

        // Don't load temp answers here - the subscription will handle it
        // This avoids race conditions where we load stale data before DataStore syncs

        // Start with just final submitted answers
        const initialMergedAnswers = { ...existingAnswers };

        logger.info(
          "Setting initialAnswers (temp answers will load via subscription)",
          {
            existingCount: Object.keys(existingAnswers).length,
            mergedCount: Object.keys(initialMergedAnswers).length,
            sampleKeys: Object.keys(initialMergedAnswers).slice(0, 3),
          },
          "InitialLoad",
          "🔄"
        );

        // Parse activity config
        const parsed = parseActivityConfig(parsedConfig, initialMergedAnswers);
        setActivityData(parsed);
        setActivityConfig(parsedConfig);
        setInitialAnswers(initialMergedAnswers);
      } catch (err: unknown) {
        logger.error("Error fetching activity", err, "ActivityFetch", "❌");
        setError(
          err instanceof Error ? err.message : "Failed to load activity"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, taskId, activity, activityLoading, activityError]);

  // Subscribe to real-time temp answer updates from DataStore
  useEffect(() => {
    if (!taskId) {
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;
    let taskPk: string | null = null;

    const setupSubscription = async () => {
      try {
        const task = await TaskService.getTaskById(taskId);
        if (!task?.pk) {
          return;
        }

        taskPk = task.pk;

        // Track if we've processed the initial load
        let hasProcessedInitialLoad = false;

        // Subscribe to TaskTempAnswer changes for this task
        subscription = DataStore.observeQuery(TaskTempAnswer).subscribe({
          next: async snapshot => {
            const { items, isSynced } = snapshot;

            logger.info(
              "Subscription fired - RECEIVED FROM DATASTORE",
              {
                totalItems: items.length,
                taskPk,
                isSynced,
              },
              "TaskTempAnswer",
              "🔔"
            );

            // Process immediately if synced, or if we have items locally
            // This handles offline scenarios where isSynced might stay false
            const shouldProcess =
              isSynced || (items.length > 0 && !hasProcessedInitialLoad);

            if (!shouldProcess) {
              logger.info(
                "Waiting for DataStore sync...",
                {
                  taskPk,
                  itemsBeforeSync: items.length,
                  hasProcessedInitialLoad,
                },
                "TaskTempAnswer",
                "⏳"
              );
              return;
            }

            hasProcessedInitialLoad = true;

            if (!isSynced && items.length > 0) {
              logger.warn(
                "Processing local data (not yet synced)",
                {
                  taskPk,
                  itemsCount: items.length,
                },
                "TaskTempAnswer",
                "⚠️"
              );
            }

            // Filter items for this specific task and sort by localtime descending
            const taskItems = items
              .filter(item => item.taskPk === taskPk)
              .sort((a, b) => {
                const timeA = a.localtime ? new Date(a.localtime).getTime() : 0;
                const timeB = b.localtime ? new Date(b.localtime).getTime() : 0;
                return timeB - timeA; // Descending order (most recent first)
              });

            logger.info(
              "Filtered items for task",
              {
                taskPk,
                filteredCount: taskItems.length,
              },
              "TaskTempAnswer",
              "🔍"
            );

            if (taskItems.length > 0) {
              const latestTempAnswer = taskItems[0];
              logger.info(
                "Latest temp answer found",
                {
                  id: latestTempAnswer.id,
                  taskPk: latestTempAnswer.taskPk,
                  localtime: latestTempAnswer.localtime,
                },
                "TaskTempAnswer",
                "📦"
              );

              // Parse the answers JSON string
              let tempAnswers: AnswersMap = {};
              if (latestTempAnswer.answers) {
                try {
                  if (typeof latestTempAnswer.answers === "string") {
                    tempAnswers = JSON.parse(
                      latestTempAnswer.answers
                    ) as AnswersMap;
                  } else if (
                    typeof latestTempAnswer.answers === "object" &&
                    latestTempAnswer.answers !== null
                  ) {
                    // Already an object - use as-is
                    tempAnswers = latestTempAnswer.answers as AnswersMap;
                  } else {
                    logger.warn(
                      "Unexpected answers data type in subscription",
                      {
                        type: typeof latestTempAnswer.answers,
                      },
                      "TaskTempAnswer",
                      "⚠️"
                    );
                  }

                  // Log parsed temp answers with actual values
                  const tempKeys = Object.keys(tempAnswers);
                  const tempPreview = tempKeys
                    .slice(0, 3)
                    .map(
                      key =>
                        `${key}=${JSON.stringify(tempAnswers[key]).substring(0, 50)}`
                    )
                    .join(", ");
                  logger.info(
                    "PARSED temp answers from subscription",
                    {
                      tempAnswersCount: tempKeys.length,
                      tempKeys: tempKeys.join(", "),
                      tempPreview,
                    },
                    "TaskTempAnswer",
                    "📝"
                  );
                } catch (error) {
                  logger.error(
                    "Error parsing temp answers from subscription",
                    error,
                    "TaskTempAnswer",
                    "❌"
                  );
                  // Log the context separately for debugging
                  logger.debug(
                    "Temp answer parsing context",
                    {
                      answersPreview:
                        typeof latestTempAnswer.answers === "string"
                          ? latestTempAnswer.answers.substring(0, 100)
                          : String(latestTempAnswer.answers).substring(0, 100),
                    },
                    "TaskTempAnswer",
                    "🔍"
                  );
                }
              }

              // Load existing TaskAnswers
              // Use ref to get latest taskAnswers without causing subscription recreation
              const existingAnswers: AnswersMap = {};
              const taskAnswersForTask = taskAnswersRef.current.filter(
                ta => ta.taskInstanceId === taskId
              );
              taskAnswersForTask.forEach(ta => {
                if (ta.questionId && ta.answer) {
                  try {
                    existingAnswers[ta.questionId] = JSON.parse(ta.answer);
                  } catch {
                    existingAnswers[ta.questionId] = ta.answer;
                  }
                }
              });

              // Merge: temp answers override existing answers
              const mergedAnswers = { ...existingAnswers, ...tempAnswers };

              const mergedKeys = Object.keys(mergedAnswers);
              const mergedPreview = mergedKeys
                .slice(0, 3)
                .map(
                  key =>
                    `${key}=${JSON.stringify(mergedAnswers[key]).substring(0, 50)}`
                )
                .join(", ");

              logger.info(
                "MERGED answers from DataStore subscription",
                {
                  taskPk,
                  existingCount: Object.keys(existingAnswers).length,
                  tempCount: Object.keys(tempAnswers).length,
                  mergedCount: mergedKeys.length,
                  mergedKeys: mergedKeys.join(", "),
                  mergedPreview,
                  isSynced,
                },
                "Real-time",
                "🔄"
              );

              // Update initialAnswers - this will trigger useEffect in useQuestionsScreen
              setInitialAnswers(mergedAnswers);

              logger.info(
                "setInitialAnswers CALLED - this should trigger useQuestionsScreen",
                {
                  mergedCount: mergedKeys.length,
                  mergedKeys: mergedKeys.join(", "),
                  willTriggerReRender:
                    "yes - useEffect in useQuestionsScreen should fire",
                },
                "Real-time",
                "✅"
              );
            } else {
              logger.info(
                `No temp answers found for task ${taskPk}`,
                {
                  totalItems: items.length,
                  taskItems: taskItems.length,
                },
                "TaskTempAnswer",
                "📭"
              );
            }
          },
          error: err => {
            logger.error("Subscription error", err, "TaskTempAnswer", "❌");
          },
        });

        logger.info(
          "Subscribed to TaskTempAnswer updates",
          { taskPk },
          "Setup",
          "✅"
        );
      } catch (error) {
        logger.error(
          "Error setting up TaskTempAnswer subscription",
          error,
          "Setup",
          "❌"
        );
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        logger.info(
          "Unsubscribed from TaskTempAnswer updates",
          { taskPk },
          "Cleanup",
          "🔌"
        );
      }
    };
  }, [taskId]); // Only taskId - taskAnswers accessed via ref to prevent subscription recreation

  return {
    loading,
    error,
    activity,
    activityData,
    activityConfig,
    initialAnswers,
  };
};
