import { useState, useEffect, useCallback } from "react";
import { ActivityService } from "@orion/task-system";
import { Activity } from "../types/Activity";

interface UseActivityReturn {
  activity: Activity | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and reactively managing a single activity by ID
 * Provides reactive updates when the activity changes
 */
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

      console.log("[useActivity] Fetching activity", { activityId });
      const activities = await ActivityService.getActivities();
      const found = activities.find(
        a => a.pk === activityId || a.id === activityId
      );

      if (!found) {
        setError(`Activity not found: ${activityId}`);
        setActivity(null);
      } else {
        setActivity(found);
        console.log("[useActivity] Activity fetched successfully", {
          id: found.id,
          name: found.name,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch activity";
      console.error("[useActivity] Error fetching activity:", err);
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

      const found = items.find(a => a.pk === activityId || a.id === activityId);
      if (found) {
        setActivity(found);
        setLoading(false);
        console.log("[useActivity] Activity updated via subscription", {
          id: found.id,
          name: found.name,
        });
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
