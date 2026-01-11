import { useEffect, useRef } from "react";
import { ActivityService } from "@services/ActivityService";
import { dataSubscriptionLogger } from "@utils/logging/dataSubscriptionLogger";

/**
 * Startup hook that subscribes to activities on mount and logs them
 * This ensures activities are logged on app startup, not just when Activities screen is viewed
 */
export const useActivityStartup = (): void => {
  const lastActivityCountRef = useRef<number>(-1);
  const lastSyncedRef = useRef<boolean | null>(null);
  const hasSubscribedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only subscribe once
    if (hasSubscribedRef.current) return;
    hasSubscribedRef.current = true;

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
          "useActivityStartup"
        );
        lastActivityCountRef.current = items.length;
        lastSyncedRef.current = isSynced;
      }
    });

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);
};
