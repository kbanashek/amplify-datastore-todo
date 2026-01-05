import { useEffect, useState } from "react";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { ParsedActivityData, parseActivityConfig } from "@utils/activityParser";
import { getServiceLogger } from "@utils/serviceLogger";
import { useActivity } from "@hooks/useActivity";
import { useTaskAnswer } from "@hooks/useTaskAnswer";
import { TaskService } from "@services/TaskService";
import { TempAnswerSyncService } from "@services/TempAnswerSyncService";
import type { Activity } from "@task-types/Activity";

const logger = getServiceLogger("useActivityData");

export interface UseActivityDataReturn {
  loading: boolean;
  error: string | null;
  activity: Activity | null;
  activityData: ParsedActivityData | null;
  activityConfig: ActivityConfig | null;
  initialAnswers: Record<string, any>;
}

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

        // Load temp answers (in-progress answers saved during the task)
        // Temp answers take precedence over final submitted answers since they're more recent
        let tempAnswers: Record<string, any> | null = null;
        if (taskId) {
          try {
            const task = await TaskService.getTaskById(taskId);
            if (task?.pk) {
              tempAnswers = await TempAnswerSyncService.getTempAnswers(task.pk);
            }
          } catch (error) {
            logger.debug("Could not fetch temp answers", error);
            // Continue without temp answers
          }
        }

        // Merge: start with final answers, then overlay temp answers
        const mergedAnswers = { ...existingAnswers, ...(tempAnswers || {}) };

        logger.info("🔄 Setting initialAnswers", {
          existingCount: Object.keys(existingAnswers).length,
          tempCount: Object.keys(tempAnswers || {}).length,
          mergedCount: Object.keys(mergedAnswers).length,
          sampleKeys: Object.keys(mergedAnswers).slice(0, 3),
        });

        // Parse activity config
        const parsed = parseActivityConfig(activityConfig, mergedAnswers);
        setActivityData(parsed);
        setActivityConfig(activityConfig);
        setInitialAnswers(mergedAnswers);
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
