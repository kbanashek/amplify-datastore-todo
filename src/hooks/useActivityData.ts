import { useEffect, useState } from "react";
import { ActivityConfig } from "../types/ActivityConfig";
import {
  ParsedActivityData,
  parseActivityConfig,
} from "../utils/activityParser";
import { useActivity } from "./useActivity";
import { useTaskAnswer } from "./useTaskAnswer";

export interface UseActivityDataReturn {
  loading: boolean;
  error: string | null;
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
            console.error("Error parsing layouts:", e);
          }
        }

        // Parse activityGroups (if not already extracted)
        if (!activityConfig.activityGroups && activity.activityGroups) {
          try {
            activityConfig.activityGroups = JSON.parse(activity.activityGroups);
          } catch (e) {
            console.error("Error parsing activityGroups:", e);
          }
        }

        // Load existing answers from TaskAnswer
        const existingAnswers: Record<string, any> = {};
        if (taskId) {
          const taskAnswersForTask = getAnswersByTaskId(taskId);
          taskAnswersForTask.forEach((ta) => {
            if (ta.questionId && ta.answer) {
              try {
                existingAnswers[ta.questionId] = JSON.parse(ta.answer);
              } catch {
                existingAnswers[ta.questionId] = ta.answer;
              }
            }
          });
        }

        // Parse activity config
        const parsed = parseActivityConfig(activityConfig, existingAnswers);
        setActivityData(parsed);
        setActivityConfig(activityConfig);
        setInitialAnswers(existingAnswers);
      } catch (err: unknown) {
        console.error("Error fetching activity:", err);
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
    activityData,
    activityConfig,
    initialAnswers,
  };
};
