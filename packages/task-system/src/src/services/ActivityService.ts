import { DataStore, OpType } from "@aws-amplify/datastore";
// @ts-ignore - Activity is exported from models/index.js at runtime
import { ModelName } from "../constants/modelNames";
import { OperationSource } from "../constants/operationSource";
import { Activity } from "../models";
import { CreateActivityInput, UpdateActivityInput } from "../types/Activity";
import { logErrorWithDevice, logWithDevice } from "../utils/deviceLogger";
import { getServiceLogger } from "../utils/serviceLogger";

type ActivityUpdateData = Omit<UpdateActivityInput, "id" | "_version">;

export class ActivityService {
  /**
   * Configure DataStore with custom conflict resolution strategy for Activity model
   */
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        if (modelConstructor.name === ModelName.Activity) {
          if (operation === OpType.DELETE) {
            if (remoteModel._deleted) {
              return remoteModel;
            }
            if (!localModel.name && !localModel.title) {
              return { ...remoteModel, _deleted: true };
            }
            return localModel;
          }
        }
        return remoteModel;
      },
    });
  }

  static async createActivity(input: CreateActivityInput): Promise<Activity> {
    try {
      logWithDevice(
        "ActivityService",
        "Creating activity with DataStore",
        input
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
    try {
      const toDelete = await DataStore.query(Activity, id);
      if (!toDelete) {
        throw new Error(`Activity with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      getServiceLogger("ActivityService").error(
        "Error deleting activity",
        error
      );
      throw error;
    }
  }

  static subscribeActivities(
    callback: (items: Activity[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    logWithDevice(
      "ActivityService",
      "Setting up DataStore subscription for Activity"
    );

    const querySubscription = DataStore.observeQuery(Activity).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        logWithDevice("ActivityService", "Subscription update (observeQuery)", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
        });

        callback(items, isSynced);
      }
    );

    // Also observe DELETE operations to ensure deletions trigger updates
    const deleteObserver = DataStore.observe(Activity).subscribe(msg => {
      if (msg.opType === OpType.DELETE) {
        const element = msg.element as any;
        const isLocalDelete = element?._deleted === true;
        const source = isLocalDelete
          ? OperationSource.LOCAL
          : OperationSource.REMOTE_SYNC;

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

        DataStore.query(Activity)
          .then(activities => {
            logWithDevice(
              "ActivityService",
              "Query refresh after DELETE completed",
              {
                remainingActivityCount: activities.length,
                remainingActivityIds: activities.map(a => a.id),
              }
            );
            callback(activities, true);
          })
          .catch(err => {
            logErrorWithDevice(
              "ActivityService",
              "Error refreshing after delete",
              err
            );
          });
      }
    });

    return {
      unsubscribe: () => {
        logWithDevice("ActivityService", "Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
      },
    };
  }

  static async clearDataStore(): Promise<void> {
    try {
      await DataStore.clear();
    } catch (error) {
      getServiceLogger("ActivityService").error(
        "Error clearing DataStore",
        error
      );
      throw error;
    }
  }
}
