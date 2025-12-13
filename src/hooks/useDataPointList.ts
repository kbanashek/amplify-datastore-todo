import { useState, useEffect } from "react";
import { DataPointService } from "../services/DataPointService";
import { DataPoint, DataPointInstance } from "../types/DataPoint";

interface UseDataPointListReturn {
  dataPoints: DataPoint[];
  instances: DataPointInstance[];
  loading: boolean;
  error: string | null;
  handleDeleteDataPoint: (id: string) => Promise<void>;
  handleDeleteInstance: (id: string) => Promise<void>;
  refreshDataPoints: () => Promise<void>;
}

export const useDataPointList = (): UseDataPointListReturn => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [instances, setInstances] = useState<DataPointInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Array<() => void>>([]);

  useEffect(() => {
    const sub1 = DataPointService.subscribeDataPoints((items, isSynced) => {
      setDataPoints(items);
      setLoading(false);
      console.log(
        "[useDataPointList] DataPoints updated:",
        items.length,
        "synced:",
        isSynced
      );
    });
    const sub2 = DataPointService.subscribeDataPointInstances(
      (items, isSynced) => {
        setInstances(items);
        console.log(
          "[useDataPointList] DataPointInstances updated:",
          items.length,
          "synced:",
          isSynced
        );
      }
    );
    setSubscriptions([sub1, sub2]);

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const handleDeleteDataPoint = async (id: string): Promise<void> => {
    try {
      await DataPointService.deleteDataPoint(id);
    } catch (err) {
      console.error("Error deleting data point:", err);
      setError("Failed to delete data point.");
    }
  };

  const handleDeleteInstance = async (id: string): Promise<void> => {
    try {
      await DataPointService.deleteDataPointInstance(id);
    } catch (err) {
      console.error("Error deleting instance:", err);
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
      console.error("Error refreshing data points:", err);
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
