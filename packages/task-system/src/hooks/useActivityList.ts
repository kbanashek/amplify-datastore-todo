import { useState, useEffect, useRef } from "react";
import { ActivityService } from "../services/ActivityService";
import { Activity } from "../types/Activity";
import { logErrorWithPlatform } from "../utils/platformLogger";
import { dataSubscriptionLogger } from "../utils/dataSubscriptionLogger";

interface UseActivityListReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  handleDeleteActivity: (id: string) => Promise<void>;
  refreshActivities: () => Promise<void>;
}

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
