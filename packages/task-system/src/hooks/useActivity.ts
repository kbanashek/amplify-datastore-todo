import { useCallback, useEffect, useState } from "react";
import { ActivityService } from "@services/ActivityService";
import { Activity } from "@task-types/Activity";
import { selectBestActivityMatch } from "@utils/activities/selectBestActivityMatch";
import {
  logErrorWithPlatform,
  logWithPlatform,
} from "@utils/logging/platformLogger";

/**
 * Return type for the useActivity hook.
 */
interface UseActivityReturn {
  /** The fetched activity, or null if not found/loading */
  activity: Activity | null;
  /** Whether the activity is still loading */
  loading: boolean;
  /** Error message from the fetch operation, or null */
  error: string | null;
  /** Manually refresh the activity data */
  refresh: () => Promise<void>;
}

/** React hook for fetching and reactively managing a single activity by ID. @param activityId - The activity ID (pk or id) to fetch, or null to skip fetching. @returns Activity, loading state, error, and refresh function. */
export const useActivity = (activityId: string | null): UseActivityReturn => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async (): Promise<void> => {
    if (!activityId) {
      setActivity(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logWithPlatform("📋", "", "useActivity", "Fetching activity", {
        activityId,
      });
      const activities = await ActivityService.getActivities();
      // Format activities as readable list instead of JSON blob
      const activityList = activities
        .map(a => {
          const name = a.name || a.title || "unnamed";
          const createdDate = a.createdAt
            ? new Date(a.createdAt).toISOString().split("T")[0]
            : "no date";
          return `  • ${name} (created: ${createdDate})`;
        })
        .join("\n");

      logWithPlatform(
        "📋",
        "",
        "useActivity",
        `Found ${activities.length} activities\n${activityList}`,
        {}
      );

      // Prefer hydrated/config-bearing activities when multiple match (common in LX integrations).
      const found = selectBestActivityMatch(activities, activityId);

      if (!found) {
        logWithPlatform(
          "📋",
          "",
          "useActivity",
          `Activity not found: ${activityId}`,
          {
            searchedIn: activities.length,
            samplePks: activities.slice(0, 3).map(a => a.pk),
            sampleSks: activities.slice(0, 3).map(a => a.sk),
          }
        );
        setError(`Activity not found: ${activityId}`);
        setActivity(null);
      } else {
        setActivity(found);
        logWithPlatform(
          "📋",
          "",
          "useActivity",
          "Activity fetched successfully",
          {
            id: found.id,
            name: found.name,
          }
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch activity";
      logErrorWithPlatform("", "useActivity", "Error fetching activity", err);
      setError(errorMessage);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  // Subscribe to activity changes
  useEffect(() => {
    fetchActivity();

    const sub = ActivityService.subscribeActivities((items, isSynced) => {
      if (!activityId) return;

      // Match by pk, id, or activity ID in sk (format: "Activity#Activity.{activityId}")
      const found = selectBestActivityMatch(items, activityId);
      if (found) {
        setActivity(found);
        setLoading(false);
        logWithPlatform(
          "📋",
          "",
          "useActivity",
          "Activity updated via subscription",
          {
            id: found.id,
            name: found.name,
          }
        );
      }
    });

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [activityId, fetchActivity]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchActivity();
  }, [fetchActivity]);

  return {
    activity,
    loading,
    error,
    refresh,
  };
};
