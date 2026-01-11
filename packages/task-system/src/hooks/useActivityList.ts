import { useState, useEffect, useRef } from "react";
import { ActivityService } from "@services/ActivityService";
import { Activity } from "@task-types/Activity";
import { logErrorWithPlatform } from "@utils/logging/platformLogger";
import { dataSubscriptionLogger } from "@utils/logging/dataSubscriptionLogger";

/**
 * Return type for the useActivityList hook.
 */
interface UseActivityListReturn {
  /** List of all activities */
  activities: Activity[];
  /** Whether initial data is still loading */
  loading: boolean;
  /** Error message from the most recent operation, or null */
  error: string | null;
  /** Deletes an activity by ID */
  handleDeleteActivity: (id: string) => Promise<void>;
  /** Manually refreshes the activity list */
  refreshActivities: () => Promise<void>;
}

/**
 * React hook for managing activities with real-time synchronization.
 *
 * Provides reactive activity data via DataStore subscriptions and
 * activity management operations. Activities are automatically updated
 * when changes occur in the DataStore.
 *
 * @returns Object containing activity data, loading states, and management operations
 *
 * @example
 * ```tsx
 * const {
 *   activities,
 *   loading,
 *   error,
 *   handleDeleteActivity,
 * } = useActivityList();
 *
 * // Display activities
 * activities.map(activity => <ActivityCard key={activity.id} activity={activity} />);
 *
 * // Delete an activity
 * await handleDeleteActivity("activity-123");
 * ```
 */
export const useActivityList = (): UseActivityListReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);
  const lastActivityCountRef = useRef<number>(-1);
  const lastSyncedRef = useRef<boolean | null>(null);
  const lastLoggedStateRef = useRef<string>("");

  useEffect(() => {
    const sub = ActivityService.subscribeActivities((items, isSynced) => {
      // Only log if activity count or sync status actually changed
      const countChanged = items.length !== lastActivityCountRef.current;
      const syncChanged = isSynced !== lastSyncedRef.current;

      if (countChanged || syncChanged) {
        // Use centralized logger to prevent duplicates across hook instances
        dataSubscriptionLogger.logActivities(
          items.map(a => ({
            name: a.name,
            title: a.title,
            createdAt: a.createdAt,
          })),
          isSynced,
          "useActivityList"
        );
        lastActivityCountRef.current = items.length;
        lastSyncedRef.current = isSynced;
      }

      setActivities(items);
      setLoading(false);
    });
    setSubscription(() => sub.unsubscribe);

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  const handleDeleteActivity = async (id: string): Promise<void> => {
    try {
      await ActivityService.deleteActivity(id);
    } catch (err) {
      logErrorWithPlatform(
        "",
        "useActivityList",
        "Error deleting activity",
        err
      );
      setError("Failed to delete activity.");
    }
  };

  const refreshActivities = async (): Promise<void> => {
    try {
      setLoading(true);
      const allActivities = await ActivityService.getActivities();
      setActivities(allActivities);
      setLoading(false);
    } catch (err) {
      logErrorWithPlatform(
        "",
        "useActivityList",
        "Error refreshing activities",
        err
      );
      setError("Failed to refresh activities.");
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    error,
    handleDeleteActivity,
    refreshActivities,
  };
};
