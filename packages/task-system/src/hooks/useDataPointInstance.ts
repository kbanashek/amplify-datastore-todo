import { DataPointService } from "@services/DataPointService";
import {
  CreateDataPointInstanceInput,
  DataPointInstance,
  UpdateDataPointInstanceInput,
} from "@task-types/DataPoint";
import { getServiceLogger } from "@utils/serviceLogger";
import { useCallback, useEffect, useState } from "react";

const logger = getServiceLogger("useDataPointInstance");

/**
 * Return type for the useDataPointInstance hook.
 */
interface UseDataPointInstanceReturn {
  /** Filters instances by activity ID */
  getInstancesByActivityId: (activityId: string) => DataPointInstance[];
  /** Finds a specific instance by activity and question ID */
  getInstanceByQuestionId: (
    activityId: string,
    questionId: string
  ) => DataPointInstance | undefined;
  /** Creates a new data point instance in DataStore */
  createDataPointInstance: (
    input: CreateDataPointInstanceInput
  ) => Promise<DataPointInstance | null>;
  /** Updates an existing data point instance */
  updateDataPointInstance: (
    id: string,
    data: Omit<UpdateDataPointInstanceInput, "id" | "_version">
  ) => Promise<DataPointInstance | null>;
  /** All data point instances (reactively updated via subscription) */
  instances: DataPointInstance[];
  /** Whether initial data is still loading */
  loading: boolean;
  /** Error message from the most recent operation, or null */
  error: string | null;
  /** Whether a create operation is in progress */
  isCreating: boolean;
  /** Whether an update operation is in progress */
  isUpdating: boolean;
}

/**
 * React hook for managing data point instances with real-time synchronization.
 *
 * Provides reactive updates via DataStore subscriptions, filtering utilities,
 * and CRUD operations for data point instances. Instances are automatically
 * updated when changes occur in the DataStore.
 *
 * @returns Object containing instance data, loading states, and CRUD operations
 *
 * @example
 * ```tsx
 * const {
 *   instances,
 *   loading,
 *   getInstancesByActivityId,
 *   createDataPointInstance,
 * } = useDataPointInstance();
 *
 * // Get instances for a specific activity
 * const activityInstances = getInstancesByActivityId("activity-123");
 *
 * // Create a new instance
 * const newInstance = await createDataPointInstance({
 *   activityId: "activity-123",
 *   questionId: "question-456",
 *   value: "42",
 * });
 * ```
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
