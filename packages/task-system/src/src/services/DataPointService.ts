import { DataStore, OpType } from "@aws-amplify/datastore";
import { DataPoint, DataPointInstance } from "../models";
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

    return {
      unsubscribe: () => {
        console.log("[DataPointService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
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

    return {
      unsubscribe: () => {
        console.log("[DataPointService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
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
