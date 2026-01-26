import { Hub } from "@aws-amplify/core";
import { DataStore, OpType } from "@aws-amplify/datastore";
// @ts-ignore - Activity is exported from models/index.js at runtime
import { OperationSource } from "@constants/operationSource";
import { Activity } from "@models/index";
import { CreateActivityInput, UpdateActivityInput } from "@task-types/Activity";
import { resetDataStore } from "@utils/datastore/dataStoreReset";
import { dataSubscriptionLogger } from "@utils/logging/dataSubscriptionLogger";
import { logWithDevice } from "@utils/logging/deviceLogger";
import { getServiceLogger } from "@utils/logging/serviceLogger";

type ActivityUpdateData = Omit<UpdateActivityInput, "id" | "_version">;
interface LogMetadata {
  [key: string]: unknown;
}
interface ObserveElement {
  id?: string;
  name?: string;
  title?: string;
  _deleted?: boolean;
}

/** Service for managing Activity entities via AWS Amplify DataStore. */
export class ActivityService {
  /**
   * Create a new Activity in DataStore.
   *
   * @param input - Activity creation payload
   * @returns The created Activity model
   */
  static async createActivity(input: CreateActivityInput): Promise<Activity> {
    try {
      logWithDevice(
        "ActivityService",
        "Creating activity with DataStore",
        input as unknown as LogMetadata
      );
      const activity = await DataStore.save(
        new Activity({
          ...input,
        })
      );

      logWithDevice("ActivityService", "Activity created successfully", {
        id: activity.id,
      });
      return activity;
    } catch (error) {
      getServiceLogger("ActivityService").error(
        "Error creating activity",
        error
      );
      throw error;
    }
  }

  /**
   * Get all Activities from DataStore.
   *
   * @returns List of all activities
   */
  static async getActivities(): Promise<Activity[]> {
    try {
      return await DataStore.query(Activity);
    } catch (error) {
      getServiceLogger("ActivityService").error(
        "Error fetching activities",
        error
      );
      throw error;
    }
  }

  /**
   * Get an Activity by its DataStore `id`.
   *
   * @param id - Activity DataStore id
   * @returns The Activity if found, otherwise null
   */
  static async getActivity(id: string): Promise<Activity | null> {
    try {
      const activity = await DataStore.query(Activity, id);
      return activity || null;
    } catch (error) {
      getServiceLogger("ActivityService").error(
        "Error fetching activity",
        error
      );
      throw error;
    }
  }

  static async updateActivity(
    id: string,
    data: ActivityUpdateData
  ): Promise<Activity> {
    try {
      const original = await DataStore.query(Activity, id);
      if (!original) {
        throw new Error(`Activity with id ${id} not found`);
      }

      const updated = await DataStore.save(
        Activity.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      getServiceLogger("ActivityService").error(
        "Error updating activity",
        error
      );
      throw error;
    }
  }

  static async deleteActivity(id: string): Promise<void> {
    const logger = getServiceLogger("ActivityService");
    try {
      const toDelete = await DataStore.query(Activity, id);
      if (!toDelete) {
        // In multi-device sync scenarios, activities may be deleted by other devices
        // This is expected behavior, not an error
        logger.info(
          "Activity not found for deletion (likely already deleted by another device)",
          { id },
          "DATA",
          "🔄"
        );
        return; // Gracefully handle - activity already gone
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      // Check if this is a ConditionalCheckFailedException (activity already deleted)
      if (
        error instanceof Error &&
        error.message.includes("ConditionalCheckFailedException")
      ) {
        logger.info(
          "Activity deletion conflict - activity already deleted by another device/process",
          { id, errorType: "ConditionalCheckFailedException" },
          "DATA",
          "🔄"
        );
        return; // Expected in multi-device sync scenarios
      }

      logger.error("Error deleting activity", error, "ActivityService", "DATA");
      throw error;
    }
  }

  static subscribeActivities(
    callback: (items: Activity[], isSynced: boolean) => void
    ,
    options?: {
      /**
       * If true, perform a full DataStore query after DELETE events.
       * This is a safety-net for cross-device consistency, but can be expensive.
       *
       * Default: true (throttled).
       */
      refreshOnDelete?: boolean;
      /** Debounce/throttle window for refresh queries. Default: 500ms. */
      deleteRefreshThrottleMs?: number;
      /** Enable verbose debug logging (opt-in). Default: false. */
      debug?: boolean;
    }
  ): {
    unsubscribe: () => void;
  } {
    const refreshOnDelete = options?.refreshOnDelete ?? true;
    const deleteRefreshThrottleMs = options?.deleteRefreshThrottleMs ?? 500;
    const debug = options?.debug ?? false;

    // Use centralized logger to prevent duplicate subscription setup logs
    dataSubscriptionLogger.logServiceSetup(
      "ActivityService",
      "Setting up AWS DataStore subscription for Activity model",
      "☁️"
    );

    const querySubscription = DataStore.observeQuery(Activity).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        if (debug) {
          logWithDevice(
            "ActivityService",
            `📋 AWS DataStore subscription fired - ${items.length} activities`,
            {
              activityCount: items.length,
              isSynced,
              syncStatus: isSynced ? "cloud-synced" : "local-only",
              activityIds: items.map(i => i.id),
              activityNames: items.map(i => i.name),
              timestamp: new Date().toISOString(),
            }
          );
        }

        callback(items, isSynced);
      },
      (error: unknown) => {
        getServiceLogger("ActivityService").error(
          "DataStore subscription error",
          error instanceof Error ? error : new Error(String(error)),
          "DATA",
          "❌"
        );
        callback([], false);
      }
    );

    // Also observe DELETE operations to ensure deletions trigger updates
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (!refreshOnDelete) return;
      if (refreshTimer) return; // already scheduled
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        DataStore.query(Activity)
          .then(activities => {
            if (debug) {
              logWithDevice(
                "ActivityService",
                "Query refresh after DELETE completed",
                {
                  remainingActivityCount: activities.length,
                  remainingActivityIds: activities.map(a => a.id),
                }
              );
            }
            callback(activities, true);
          })
          .catch((err: unknown) => {
            getServiceLogger("ActivityService").error(
              "Error refreshing after delete",
              err instanceof Error ? err : new Error(String(err)),
              "DATA",
              "❌"
            );
          });
      }, deleteRefreshThrottleMs);
    };

    const deleteObserver = DataStore.observe(Activity).subscribe(
      msg => {
        if (msg.opType === OpType.DELETE) {
          const element = msg.element as unknown as ObserveElement | undefined;
          const isLocalDelete = element?._deleted === true;
          const source = isLocalDelete
            ? OperationSource.LOCAL
            : OperationSource.REMOTE_SYNC;

          if (debug) {
            logWithDevice(
              "ActivityService",
              `DELETE operation detected (${source})`,
              {
                activityId: element?.id,
                activityName: element?.name || element?.title,
                deleted: element?._deleted,
                operationType: msg.opType,
              }
            );
          }

          scheduleRefresh();
        }
      },
      (error: unknown) => {
        getServiceLogger("ActivityService").error(
          "DELETE observer error",
          error instanceof Error ? error : new Error(String(error)),
          "DATA",
          "❌"
        );
      }
    );

    return {
      unsubscribe: () => {
        logWithDevice("ActivityService", "Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }
      },
    };
  }

  static async clearDataStore(): Promise<void> {
    try {
      await resetDataStore(
        { dataStore: DataStore, hub: Hub },
        {
          mode: "clearAndRestart",
          waitForOutboxEmpty: true,
          outboxTimeoutMs: 2000,
          stopTimeoutMs: 5000,
          clearTimeoutMs: 5000,
          startTimeoutMs: 5000,
          proceedOnStopTimeout: true,
        }
      );
    } catch (error) {
      getServiceLogger("ActivityService").error(
        "Error clearing DataStore",
        error
      );
      throw error;
    }
  }
}
