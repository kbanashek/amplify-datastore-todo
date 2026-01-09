import { useEffect, useState, useRef } from "react";
import { DataStore } from "aws-amplify/datastore";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { ParsedActivityData, parseActivityConfig } from "@utils/activityParser";
import { getServiceLogger } from "@utils/serviceLogger";
import { useActivity } from "@hooks/useActivity";
import { useTaskAnswer } from "@hooks/useTaskAnswer";
import { TaskService } from "@services/TaskService";
import { TaskTempAnswer } from "../models";
import type { Activity } from "@task-types/Activity";

const logger = getServiceLogger("useActivityData");

/**
 * Return type for the useActivityData hook.
 */
export interface UseActivityDataReturn {
  loading: boolean;
  error: string | null;
  activity: Activity | null;
  activityData: ParsedActivityData | null;
  activityConfig: ActivityConfig | null;
  initialAnswers: Record<string, any>;
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
  const [initialAnswers, setInitialAnswers] = useState<Record<string, any>>({});

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
        setError(
          "This task does not have an associated activity. Please ensure the task has an entityId that links to an Activity."
        );
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
        let activityConfig: ActivityConfig = {};

        // Parse layouts - check if it contains the full JSON structure
        if (activity.layouts) {
          try {
            const parsedLayouts = JSON.parse(activity.layouts);

            // Check if this is the full JSON structure
            if (
              typeof parsedLayouts === "object" &&
              !Array.isArray(parsedLayouts) &&
              (parsedLayouts.activityGroups ||
                parsedLayouts.introductionScreen ||
                parsedLayouts.summaryScreen ||
                parsedLayouts.completionScreen)
            ) {
              // Full JSON structure - extract all parts
              activityConfig.activityGroups = parsedLayouts.activityGroups;
              activityConfig.layouts = parsedLayouts.layouts || [];
              activityConfig.introductionScreen =
                parsedLayouts.introductionScreen;
              activityConfig.summaryScreen = parsedLayouts.summaryScreen;
              activityConfig.completionScreen = parsedLayouts.completionScreen;
            } else if (Array.isArray(parsedLayouts)) {
              activityConfig.layouts = parsedLayouts;
            } else {
              activityConfig.layouts = parsedLayouts;
            }
          } catch (e) {
            logger.error("Error parsing layouts", e);
          }
        }

        // Parse activityGroups (if not already extracted)
        if (!activityConfig.activityGroups && activity.activityGroups) {
          try {
            activityConfig.activityGroups = JSON.parse(activity.activityGroups);
          } catch (e) {
            logger.error("Error parsing activityGroups", e);
          }
        }

        // Load existing answers from TaskAnswer (final submitted answers)
        const existingAnswers: Record<string, any> = {};
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
          "🔄 Setting initialAnswers (temp answers will load via subscription)",
          {
            existingCount: Object.keys(existingAnswers).length,
            mergedCount: Object.keys(initialMergedAnswers).length,
            sampleKeys: Object.keys(initialMergedAnswers).slice(0, 3),
          }
        );

        // Parse activity config
        const parsed = parseActivityConfig(
          activityConfig,
          initialMergedAnswers
        );
        setActivityData(parsed);
        setActivityConfig(activityConfig);
        setInitialAnswers(initialMergedAnswers);
      } catch (err: unknown) {
        logger.error("Error fetching activity", err);
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

    let subscription: any = null;
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

            logger.info(`🔔 [TaskTempAnswer] Subscription fired`, {
              totalItems: items.length,
              taskPk,
              isSynced,
            });

            // Process immediately if synced, or if we have items locally
            // This handles offline scenarios where isSynced might stay false
            const shouldProcess =
              isSynced || (items.length > 0 && !hasProcessedInitialLoad);

            if (!shouldProcess) {
              logger.info(`⏳ [TaskTempAnswer] Waiting for DataStore sync...`, {
                taskPk,
                itemsBeforeSync: items.length,
                hasProcessedInitialLoad,
              });
              return;
            }

            hasProcessedInitialLoad = true;

            if (!isSynced && items.length > 0) {
              logger.warn(
                `⚠️ [TaskTempAnswer] Processing local data (not yet synced)`,
                {
                  taskPk,
                  itemsCount: items.length,
                }
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

            logger.info(`🔍 [TaskTempAnswer] Filtered items for task`, {
              taskPk,
              filteredCount: taskItems.length,
              allTaskPks: items
                .map(i => i.taskPk)
                .filter((v, i, a) => a.indexOf(v) === i),
            });

            if (taskItems.length > 0) {
              const latestTempAnswer = taskItems[0];
              logger.info(`📦 [TaskTempAnswer] Latest temp answer found`, {
                id: latestTempAnswer.id,
                taskPk: latestTempAnswer.taskPk,
                localtime: latestTempAnswer.localtime,
              });

              // Parse the answers JSON string
              let tempAnswers: Record<string, any> = {};
              if (latestTempAnswer.answers) {
                try {
                  if (typeof latestTempAnswer.answers === "string") {
                    tempAnswers = JSON.parse(latestTempAnswer.answers);
                  } else if (
                    typeof latestTempAnswer.answers === "object" &&
                    latestTempAnswer.answers !== null
                  ) {
                    // Already an object - use as-is
                    tempAnswers = latestTempAnswer.answers as Record<
                      string,
                      any
                    >;
                  } else {
                    logger.warn(
                      "Unexpected answers data type in subscription",
                      {
                        type: typeof latestTempAnswer.answers,
                      }
                    );
                  }
                } catch (error) {
                  logger.error("Error parsing temp answers from subscription", {
                    error,
                    answersPreview:
                      typeof latestTempAnswer.answers === "string"
                        ? latestTempAnswer.answers.substring(0, 100)
                        : String(latestTempAnswer.answers).substring(0, 100),
                  });
                }
              }

              // Load existing TaskAnswers
              // Use ref to get latest taskAnswers without causing subscription recreation
              const existingAnswers: Record<string, any> = {};
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

              logger.info(
                "🔄 [Real-time] Updated initialAnswers from DataStore subscription",
                {
                  taskPk,
                  existingCount: Object.keys(existingAnswers).length,
                  tempCount: Object.keys(tempAnswers).length,
                  mergedCount: Object.keys(mergedAnswers).length,
                  sampleKeys: Object.keys(mergedAnswers).slice(0, 3),
                  isSynced,
                }
              );

              // Update initialAnswers - this will trigger useEffect in useQuestionsScreen
              setInitialAnswers(mergedAnswers);

              logger.info(
                "✅ [Real-time] setInitialAnswers called with updated data"
              );
            } else {
              logger.info(
                `📭 [TaskTempAnswer] No temp answers found for task ${taskPk}`,
                {
                  totalItems: items.length,
                  taskItems: taskItems.length,
                }
              );
            }
          },
          error: err => {
            logger.error("❌ [TaskTempAnswer] Subscription error", err);
          },
        });

        logger.info("✅ Subscribed to TaskTempAnswer updates", { taskPk });
      } catch (error) {
        logger.error("Error setting up TaskTempAnswer subscription", error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        logger.info("🔌 Unsubscribed from TaskTempAnswer updates", { taskPk });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
