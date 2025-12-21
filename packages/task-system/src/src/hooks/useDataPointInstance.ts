import { useState, useCallback, useEffect } from "react";
import { DataPointService } from "../services/DataPointService";
import {
  DataPointInstance,
  CreateDataPointInstanceInput,
  UpdateDataPointInstanceInput,
} from "../types/DataPoint";
import { getServiceLogger } from "../utils/serviceLogger";

const logger = getServiceLogger("useDataPointInstance");

interface UseDataPointInstanceReturn {
  // Get instances by activityId
  getInstancesByActivityId: (activityId: string) => DataPointInstance[];
  // Get instance by questionId for a specific activity
  getInstanceByQuestionId: (
    activityId: string,
    questionId: string
  ) => DataPointInstance | undefined;
  // Create a new data point instance
  createDataPointInstance: (
    input: CreateDataPointInstanceInput
  ) => Promise<DataPointInstance | null>;
  // Update an existing data point instance
  updateDataPointInstance: (
    id: string,
    data: Omit<UpdateDataPointInstanceInput, "id" | "_version">
  ) => Promise<DataPointInstance | null>;
  // Get all instances (reactive)
  instances: DataPointInstance[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
}

/**
 * Hook for managing data point instances reactively
 * Provides reactive updates, filtering, and CRUD operations
 */
export const useDataPointInstance = (): UseDataPointInstanceReturn => {
  const [instances, setInstances] = useState<DataPointInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Subscribe to data point instance changes
  useEffect(() => {
    const sub = DataPointService.subscribeDataPointInstances(
      (items, isSynced) => {
        setInstances(items);
        setLoading(false);
        logger.debug("DataPointInstances updated", {
          count: items.length,
          synced: isSynced,
        });
      }
    );

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  const getInstancesByActivityId = useCallback(
    (activityId: string): DataPointInstance[] => {
      return instances.filter(instance => instance.activityId === activityId);
    },
    [instances]
  );

  const getInstanceByQuestionId = useCallback(
    (activityId: string, questionId: string): DataPointInstance | undefined => {
      return instances.find(
        instance =>
          instance.activityId === activityId &&
          instance.questionId === questionId
      );
    },
    [instances]
  );

  const createDataPointInstance = useCallback(
    async (
      input: CreateDataPointInstanceInput
    ): Promise<DataPointInstance | null> => {
      setIsCreating(true);
      setError(null);

      try {
        logger.debug("Creating data point instance", input);
        const created = await DataPointService.createDataPointInstance(input);
        logger.info("Data point instance created successfully", created);
        // The subscription will automatically update instances
        return created;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create data point instance";
        logger.error("Error creating data point instance", err);
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateDataPointInstance = useCallback(
    async (
      id: string,
      data: Omit<UpdateDataPointInstanceInput, "id" | "_version">
    ): Promise<DataPointInstance | null> => {
      setIsUpdating(true);
      setError(null);

      try {
        logger.debug("Updating data point instance", { id, data });
        const updated = await DataPointService.updateDataPointInstance(
          id,
          data
        );
        logger.info("Data point instance updated successfully", updated);
        // The subscription will automatically update instances
        return updated;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update data point instance";
        logger.error("Error updating data point instance", err);
        setError(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    getInstancesByActivityId,
    getInstanceByQuestionId,
    createDataPointInstance,
    updateDataPointInstance,
    instances,
    loading,
    error,
    isCreating,
    isUpdating,
  };
};
