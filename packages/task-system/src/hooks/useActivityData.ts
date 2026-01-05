import { useEffect, useState } from "react";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { ParsedActivityData, parseActivityConfig } from "@utils/activityParser";
import { getServiceLogger } from "@utils/serviceLogger";
import { useActivity } from "@hooks/useActivity";
import { useTaskAnswer } from "@hooks/useTaskAnswer";
import type { Activity } from "@task-types/Activity";
import type { Task } from "@task-types/Task";
import { TempAnswerSyncService } from "@services/TempAnswerSyncService";
import { TaskService } from "@services/TaskService";

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

        // Fetch the task to get its pk for temp answers
        let currentTask: Task | null = null;
        if (taskId) {
          currentTask = await TaskService.getTaskById(taskId);
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

        // Load temp answers from DynamoDB (in-progress answers)
        let tempAnswers: Record<string, any> | null = null;
        if (currentTask?.pk) {
          tempAnswers = await TempAnswerSyncService.getTempAnswers(
            currentTask.pk
          );
          if (tempAnswers) {
            logger.info("🔄 Loaded temp answers", {
              count: Object.keys(tempAnswers).length,
              sampleKeys: Object.keys(tempAnswers).slice(0, 3),
            });
          }
        }

        // Merge answers: temp answers take precedence over existing (submitted) answers
        // This ensures that if a user resumes, their in-progress work is shown
        const mergedAnswers = { ...existingAnswers, ...(tempAnswers || {}) };

        // Parse activity config with merged answers
        const parsed = parseActivityConfig(activityConfig, mergedAnswers);
        setActivityData(parsed);
        setActivityConfig(activityConfig);
        setInitialAnswers(mergedAnswers);
        logger.info("🔄 Setting initialAnswers", {
          existingCount: Object.keys(existingAnswers).length,
          tempCount: Object.keys(tempAnswers || {}).length,
          mergedCount: Object.keys(mergedAnswers).length,
          sampleKeys: Object.keys(mergedAnswers).slice(0, 3),
        });
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

  return {
    loading,
    error,
    activity,
    activityData,
    activityConfig,
    initialAnswers,
  };
};
