import { DataStore, OpType } from "@aws-amplify/datastore";
import { logWithDevice, logErrorWithDevice } from "../utils/deviceLogger";
import { DataPoint, DataPointInstance } from "../../models";
import {
  CreateDataPointInput,
  CreateDataPointInstanceInput,
  UpdateDataPointInput,
  UpdateDataPointInstanceInput,
} from "../types/DataPoint";

type DataPointUpdateData = Omit<UpdateDataPointInput, "id" | "_version">;
type DataPointInstanceUpdateData = Omit<
  UpdateDataPointInstanceInput,
  "id" | "_version"
>;

export class DataPointService {
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        const modelName = modelConstructor.name;
        if (modelName === "DataPoint" || modelName === "DataPointInstance") {
          if (operation === OpType.DELETE) {
            if (remoteModel._deleted) {
              return remoteModel;
            }
            if (!localModel.pk && !localModel.sk) {
              return { ...remoteModel, _deleted: true };
            }
            return localModel;
          }
        }
        return remoteModel;
      },
    });
  }

  // DataPoint methods
  static async createDataPoint(
    input: CreateDataPointInput
  ): Promise<DataPoint> {
    try {
      console.log(
        "[DataPointService] Creating data point with DataStore:",
        input
      );
      const dataPoint = await DataStore.save(
        new DataPoint({
          ...input,
        })
      );

      console.log(
        "[DataPointService] DataPoint created successfully:",
        dataPoint.id
      );
      return dataPoint;
    } catch (error) {
      console.error("Error creating data point:", error);
      throw error;
    }
  }

  static async getDataPoints(): Promise<DataPoint[]> {
    try {
      return await DataStore.query(DataPoint);
    } catch (error) {
      console.error("Error fetching data points:", error);
      throw error;
    }
  }

  static async getDataPoint(id: string): Promise<DataPoint | null> {
    try {
      return await DataStore.query(DataPoint, id);
    } catch (error) {
      console.error("Error fetching data point:", error);
      throw error;
    }
  }

  static async updateDataPoint(
    id: string,
    data: DataPointUpdateData
  ): Promise<DataPoint> {
    try {
      const original = await DataStore.query(DataPoint, id);
      if (!original) {
        throw new Error(`DataPoint with id ${id} not found`);
      }

      const updated = await DataStore.save(
        DataPoint.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      console.error("Error updating data point:", error);
      throw error;
    }
  }

  static async deleteDataPoint(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(DataPoint, id);
      if (!toDelete) {
        throw new Error(`DataPoint with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting data point:", error);
      throw error;
    }
  }

  static subscribeDataPoints(
    callback: (items: DataPoint[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    console.log(
      "[DataPointService] Setting up DataStore subscription for DataPoint"
    );

    const querySubscription = DataStore.observeQuery(DataPoint).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        console.log("[DataPointService] DataStore subscription update:", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
        });

        callback(items, isSynced);
      }
    );

    // Also observe DELETE operations to ensure deletions trigger updates
    const deleteObserver = DataStore.observe(DataPoint).subscribe(msg => {
      if (msg.opType === OpType.DELETE) {
        const isLocalDelete = msg.element?._deleted === true;
        const source = isLocalDelete ? "LOCAL" : "REMOTE_SYNC";

        logWithDevice(
          "DataPointService",
          `DELETE operation detected for DataPoint (${source})`,
          {
            dataPointId: msg.element?.id,
            dataPointName: msg.element?.name,
            deleted: msg.element?._deleted,
            operationType: msg.opType,
          }
        );

        DataStore.query(DataPoint)
          .then(dataPoints => {
            logWithDevice(
              "DataPointService",
              "Query refresh after DELETE completed",
              {
                remainingDataPointCount: dataPoints.length,
              }
            );
            callback(dataPoints, true);
          })
          .catch(err => {
            logErrorWithDevice(
              "DataPointService",
              "Error refreshing after delete",
              err
            );
          });
      }
    });

    return {
      unsubscribe: () => {
        console.log("[DataPointService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
      },
    };
  }

  // DataPointInstance methods
  static async createDataPointInstance(
    input: CreateDataPointInstanceInput
  ): Promise<DataPointInstance> {
    try {
      console.log(
        "[DataPointService] Creating data point instance with DataStore:",
        input
      );
      const instance = await DataStore.save(
        new DataPointInstance({
          ...input,
        })
      );

      console.log(
        "[DataPointService] DataPointInstance created successfully:",
        instance.id
      );
      return instance;
    } catch (error) {
      console.error("Error creating data point instance:", error);
      throw error;
    }
  }

  static async getDataPointInstances(): Promise<DataPointInstance[]> {
    try {
      return await DataStore.query(DataPointInstance);
    } catch (error) {
      console.error("Error fetching data point instances:", error);
      throw error;
    }
  }

  static async getDataPointInstance(
    id: string
  ): Promise<DataPointInstance | null> {
    try {
      return await DataStore.query(DataPointInstance, id);
    } catch (error) {
      console.error("Error fetching data point instance:", error);
      throw error;
    }
  }

  static async updateDataPointInstance(
    id: string,
    data: DataPointInstanceUpdateData
  ): Promise<DataPointInstance> {
    try {
      const original = await DataStore.query(DataPointInstance, id);
      if (!original) {
        throw new Error(`DataPointInstance with id ${id} not found`);
      }

      const updated = await DataStore.save(
        DataPointInstance.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      console.error("Error updating data point instance:", error);
      throw error;
    }
  }

  static async deleteDataPointInstance(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(DataPointInstance, id);
      if (!toDelete) {
        throw new Error(`DataPointInstance with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting data point instance:", error);
      throw error;
    }
  }

  /**
   * Delete all DataPoints
   * @returns {Promise<number>} - The number of data points deleted
   */
  static async deleteAllDataPoints(): Promise<number> {
    try {
      const dataPoints = await DataStore.query(DataPoint);
      let deletedCount = 0;

      // Delete in batches to avoid overwhelming the sync queue
      const batchSize = 10;
      for (let i = 0; i < dataPoints.length; i += batchSize) {
        const batch = dataPoints.slice(i, i + batchSize);
        await Promise.all(batch.map(dp => DataStore.delete(dp)));
        deletedCount += batch.length;

        // Small delay between batches to allow sync
        if (i + batchSize < dataPoints.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log("[DataPointService] Deleted all data points", {
        deletedCount,
        totalQueried: dataPoints.length,
      });

      return deletedCount;
    } catch (error) {
      console.error("Error deleting all data points:", error);
      throw error;
    }
  }

  /**
   * Delete all DataPointInstances
   * @returns {Promise<number>} - The number of data point instances deleted
   */
  static async deleteAllDataPointInstances(): Promise<number> {
    try {
      const instances = await DataStore.query(DataPointInstance);
      let deletedCount = 0;

      // Delete in batches to avoid overwhelming the sync queue
      const batchSize = 10;
      for (let i = 0; i < instances.length; i += batchSize) {
        const batch = instances.slice(i, i + batchSize);
        await Promise.all(batch.map(instance => DataStore.delete(instance)));
        deletedCount += batch.length;

        // Small delay between batches to allow sync
        if (i + batchSize < instances.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log("[DataPointService] Deleted all data point instances", {
        deletedCount,
        totalQueried: instances.length,
      });

      return deletedCount;
    } catch (error) {
      console.error("Error deleting all data point instances:", error);
      throw error;
    }
  }

  static subscribeDataPointInstances(
    callback: (items: DataPointInstance[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    console.log(
      "[DataPointService] Setting up DataStore subscription for DataPointInstance"
    );

    const querySubscription = DataStore.observeQuery(
      DataPointInstance
    ).subscribe(snapshot => {
      const { items, isSynced } = snapshot;

      console.log("[DataPointService] DataStore subscription update:", {
        itemCount: items.length,
        isSynced,
        itemIds: items.map(i => i.id),
      });

      callback(items, isSynced);
    });

    // Also observe DELETE operations to ensure deletions trigger updates
    const deleteObserver = DataStore.observe(DataPointInstance).subscribe(
      msg => {
        if (msg.opType === OpType.DELETE) {
          const isLocalDelete = msg.element?._deleted === true;
          const source = isLocalDelete ? "LOCAL" : "REMOTE_SYNC";

          logWithDevice(
            "DataPointService",
            `DELETE operation detected for DataPointInstance (${source})`,
            {
              instanceId: msg.element?.id,
              dataPointId: msg.element?.dataPointId,
              deleted: msg.element?._deleted,
              operationType: msg.opType,
            }
          );

          DataStore.query(DataPointInstance)
            .then(instances => {
              logWithDevice(
                "DataPointService",
                "Query refresh after DELETE completed for DataPointInstance",
                {
                  remainingInstanceCount: instances.length,
                }
              );
              callback(instances, true);
            })
            .catch(err => {
              logErrorWithDevice(
                "DataPointService",
                "Error refreshing after delete",
                err
              );
            });
        }
      }
    );

    return {
      unsubscribe: () => {
        console.log("[DataPointService] Unsubscribing from DataStore");
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
