import { DataStore, OpType } from "@aws-amplify/datastore";
import { logWithDevice, logErrorWithDevice } from "../utils/deviceLogger";
import { DataPoint, DataPointInstance } from "../models";
import {
  CreateDataPointInput,
  CreateDataPointInstanceInput,
  UpdateDataPointInput,
  UpdateDataPointInstanceInput,
} from "../types/DataPoint";
import { ModelName } from "../constants/modelNames";
import { OperationSource } from "../constants/operationSource";

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
        if (
          modelName === ModelName.DataPoint ||
          modelName === ModelName.DataPointInstance
        ) {
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
      const dataPoint = await DataStore.query(DataPoint, id);
      return dataPoint || null;
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

        logWithDevice(
          "DataPointService",
          "Subscription update (observeQuery)",
          {
            itemCount: items.length,
            isSynced,
            itemIds: items.map(i => i.id),
          }
        );

        callback(items, isSynced);
      }
    );

    // Also observe DELETE operations to ensure deletions trigger updates
    const deleteObserver = DataStore.observe(DataPoint).subscribe(msg => {
      if (msg.opType === OpType.DELETE) {
        const element = msg.element as any;
        const isLocalDelete = element?._deleted === true;
        const source = isLocalDelete
          ? OperationSource.LOCAL
          : OperationSource.REMOTE_SYNC;

        logWithDevice(
          "DataPointService",
          `DELETE operation detected for DataPoint (${source})`,
          {
            dataPointId: element?.id,
            dataPointName: element?.name,
            deleted: element?._deleted,
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
        logWithDevice("DataPointService", "Unsubscribing from DataStore");
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
      const instance = await DataStore.query(DataPointInstance, id);
      return instance || null;
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

      logWithDevice(
        "DataPointService",
        "Subscription update (observeQuery) for DataPointInstance",
        {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
        }
      );

      callback(items, isSynced);
    });

    // Also observe DELETE operations to ensure deletions trigger updates
    const deleteObserver = DataStore.observe(DataPointInstance).subscribe(
      msg => {
        if (msg.opType === OpType.DELETE) {
          const element = msg.element as any;
          const isLocalDelete = element?._deleted === true;
          const source = isLocalDelete
            ? OperationSource.LOCAL
            : OperationSource.REMOTE_SYNC;

          logWithDevice(
            "DataPointService",
            `DELETE operation detected for DataPointInstance (${source})`,
            {
              instanceId: element?.id,
              dataPointId: element?.dataPointId,
              deleted: element?._deleted,
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
        logWithDevice("DataPointService", "Unsubscribing from DataStore");
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
