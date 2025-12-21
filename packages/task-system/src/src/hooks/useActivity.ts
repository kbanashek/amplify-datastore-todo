import { useState, useEffect, useCallback } from "react";
import { ActivityService } from "../services/ActivityService";
import { Activity } from "../types/Activity";
import { logWithPlatform, logErrorWithPlatform } from "../utils/platformLogger";

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

      logWithPlatform("📋", "", "useActivity", "Fetching activity", {
        activityId,
      });
      const activities = await ActivityService.getActivities();
      logWithPlatform(
        "📋",
        "",
        "useActivity",
        `Found ${activities.length} activities in DataStore`,
        {
          activityIds: activities.map(a => ({ pk: a.pk, sk: a.sk, id: a.id })),
        }
      );

      // Match by pk, id, or activity ID in sk (format: "Activity#Activity.{activityId}")
      const found = activities.find(a => {
        // Direct match on pk or id
        if (a.pk === activityId || a.id === activityId) {
          logWithPlatform("📋", "", "useActivity", "Matched by pk/id", {
            pk: a.pk,
            id: a.id,
          });
          return true;
        }
        // Check if activityId matches the activity ID in sk
        // sk format: "Activity#Activity.{activityId}"
        if (a.sk) {
          // Match "Activity.{activityId}" pattern
          if (a.sk.includes(`Activity.${activityId}`)) {
            logWithPlatform(
              "📋",
              "",
              "useActivity",
              "Matched by sk (Activity.{id})",
              { sk: a.sk }
            );
            return true;
          }
          // Match if sk ends with the activityId (UUID only)
          if (a.sk.endsWith(activityId)) {
            logWithPlatform(
              "📋",
              "",
              "useActivity",
              "Matched by sk (endsWith)",
              { sk: a.sk }
            );
            return true;
          }
          // Extract activity ID from sk and compare
          // sk format: "Activity#Activity.{activityId}" or just "{activityId}"
          const skMatch =
            a.sk.match(/Activity\.([^#]+)$/) || a.sk.match(/([a-f0-9-]{36})$/i);
          if (skMatch && skMatch[1] === activityId) {
            logWithPlatform(
              "📋",
              "",
              "useActivity",
              "Matched by sk (extracted)",
              { sk: a.sk, extracted: skMatch[1] }
            );
            return true;
          }
        }
        return false;
      });

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
      const found = items.find(a => {
        // Direct match on pk or id
        if (a.pk === activityId || a.id === activityId) {
          return true;
        }
        // Check if activityId matches the activity ID in sk
        if (a.sk) {
          // Match "Activity.{activityId}" pattern
          if (a.sk.includes(`Activity.${activityId}`)) {
            return true;
          }
          // Match if sk ends with the activityId (UUID only)
          if (a.sk.endsWith(activityId)) {
            return true;
          }
          // Extract activity ID from sk and compare
          const skMatch =
            a.sk.match(/Activity\.([^#]+)$/) || a.sk.match(/([a-f0-9-]{36})$/i);
          if (skMatch && skMatch[1] === activityId) {
            return true;
          }
        }
        return false;
      });
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
