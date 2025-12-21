import { useState, useEffect } from "react";
import { ActivityService } from "../services/ActivityService";
import { Activity } from "../types/Activity";
import { getServiceLogger } from "../utils/serviceLogger";

const logger = getServiceLogger("useActivityList");

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

  useEffect(() => {
    const sub = ActivityService.subscribeActivities((items, isSynced) => {
      setActivities(items);
      setLoading(false);
      logger.debug("Activities updated", {
        count: items.length,
        synced: isSynced,
      });
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
      logger.error("Error deleting activity", err);
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
      logger.error("Error refreshing activities", err);
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
