import { DataPointService } from "@services/DataPointService";
import { DataPoint, DataPointInstance } from "@task-types/DataPoint";
import { getServiceLogger } from "@utils/logging/serviceLogger";
import { useEffect, useState } from "react";

const logger = getServiceLogger("useDataPointList");

/**
 * Return type for the useDataPointList hook.
 */
interface UseDataPointListReturn {
  /** List of all data point definitions */
  dataPoints: DataPoint[];
  /** List of all data point instances */
  instances: DataPointInstance[];
  /** Whether initial data is still loading */
  loading: boolean;
  /** Error message from the most recent operation, or null */
  error: string | null;
  /** Deletes a data point definition by ID */
  handleDeleteDataPoint: (id: string) => Promise<void>;
  /** Deletes a data point instance by ID */
  handleDeleteInstance: (id: string) => Promise<void>;
  /** Manually refreshes all data point data */
  refreshDataPoints: () => Promise<void>;
}

/**
 * React hook for managing data points and instances with real-time synchronization.
 *
 * Subscribes to both DataPoint definitions and DataPointInstance values,
 * providing reactive updates when changes occur in the DataStore.
 *
 * @returns Object containing data point data, loading states, and management operations
 *
 * @example
 * ```tsx
 * const {
 *   dataPoints,
 *   instances,
 *   loading,
 *   handleDeleteDataPoint,
 * } = useDataPointList();
 *
 * // Find instances for a specific data point
 * const pointInstances = instances.filter(i => i.dataPointId === dataPoints[0].id);
 * ```
 */
export const useDataPointList = (): UseDataPointListReturn => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [instances, setInstances] = useState<DataPointInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<(() => void)[]>([]);

  useEffect(() => {
    const sub1 = DataPointService.subscribeDataPoints((items, isSynced) => {
      setDataPoints(items);
      setLoading(false);
      logger.debug("DataPoints updated", {
        count: items.length,
        synced: isSynced,
      });
    });
    const sub2 = DataPointService.subscribeDataPointInstances(
      (items, isSynced) => {
        setInstances(items);
        logger.debug("DataPointInstances updated", {
          count: items.length,
          synced: isSynced,
        });
      }
    );
    setSubscriptions([() => sub1.unsubscribe(), () => sub2.unsubscribe()]);

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const handleDeleteDataPoint = async (id: string): Promise<void> => {
    try {
      await DataPointService.deleteDataPoint(id);
    } catch (err) {
      logger.error("Error deleting data point", err);
      setError("Failed to delete data point.");
    }
  };

  const handleDeleteInstance = async (id: string): Promise<void> => {
    try {
      await DataPointService.deleteDataPointInstance(id);
    } catch (err) {
      logger.error("Error deleting instance", err);
      setError("Failed to delete instance.");
    }
  };

  const refreshDataPoints = async (): Promise<void> => {
    try {
      setLoading(true);
      const [allDataPoints, allInstances] = await Promise.all([
        DataPointService.getDataPoints(),
        DataPointService.getDataPointInstances(),
      ]);
      setDataPoints(allDataPoints);
      setInstances(allInstances);
      setLoading(false);
    } catch (err) {
      logger.error("Error refreshing data points", err);
      setError("Failed to refresh data points.");
      setLoading(false);
    }
  };

  return {
    dataPoints,
    instances,
    loading,
    error,
    handleDeleteDataPoint,
    handleDeleteInstance,
    refreshDataPoints,
  };
};
