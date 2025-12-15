import { DataStore, OpType } from "@aws-amplify/datastore";
// @ts-ignore - Activity is exported from models/index.js at runtime
import { Activity } from "../../models";
import { CreateActivityInput, UpdateActivityInput } from "../types/Activity";
import { logWithDevice, logErrorWithDevice } from "../utils/deviceLogger";

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
        if (modelConstructor.name === "Activity") {
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
      console.log("[ActivityService] Creating activity with DataStore:", input);
      const activity = await DataStore.save(
        new Activity({
          ...input,
        })
      );

      console.log(
        "[ActivityService] Activity created successfully:",
        activity.id
      );
      return activity;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }

  static async getActivities(): Promise<Activity[]> {
    try {
      return await DataStore.query(Activity);
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  }

  static async getActivity(id: string): Promise<Activity | null> {
    try {
      return await DataStore.query(Activity, id);
    } catch (error) {
      console.error("Error fetching activity:", error);
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
      console.error("Error updating activity:", error);
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
      console.error("Error deleting activity:", error);
      throw error;
    }
  }

  static subscribeActivities(
    callback: (items: Activity[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    console.log(
      "[ActivityService] Setting up DataStore subscription for Activity"
    );

    const querySubscription = DataStore.observeQuery(Activity).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        console.log("[ActivityService] DataStore subscription update:", {
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
        const isLocalDelete = msg.element?._deleted === true;
        const source = isLocalDelete ? "LOCAL" : "REMOTE_SYNC";
        
        logWithDevice("ActivityService", `DELETE operation detected (${source})`, {
          activityId: msg.element?.id,
          activityName: msg.element?.name || msg.element?.title,
          deleted: msg.element?._deleted,
          operationType: msg.opType,
        });
        
        DataStore.query(Activity).then(activities => {
          logWithDevice("ActivityService", "Query refresh after DELETE completed", {
            remainingActivityCount: activities.length,
            remainingActivityIds: activities.map(a => a.id),
          });
          callback(activities, true);
        }).catch(err => {
          logErrorWithDevice("ActivityService", "Error refreshing after delete", err);
        });
      }
    });

    return {
      unsubscribe: () => {
        console.log("[ActivityService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
      },
    };
  }

  static async clearDataStore(): Promise<void> {
    try {
      await DataStore.clear();
    } catch (error) {
      console.error("Error clearing DataStore:", error);
      throw error;
    }
  }
}
