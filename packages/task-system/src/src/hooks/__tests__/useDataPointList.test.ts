import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useDataPointList } from "../useDataPointList";

// Mock DataPointService
jest.mock("@orion/task-system", () => ({
  DataPointService: {
    subscribeDataPoints: jest.fn(),
    subscribeDataPointInstances: jest.fn(),
    getDataPoints: jest.fn(),
    getDataPointInstances: jest.fn(),
    deleteDataPoint: jest.fn(),
    deleteDataPointInstance: jest.fn(),
  },
}));

import { DataPointService } from "@orion/task-system";
import { DataPoint, DataPointInstance } from "../../types/DataPoint";

describe("useDataPointList", () => {
  const mockSubscribeDataPoints =
    DataPointService.subscribeDataPoints as jest.MockedFunction<
      typeof DataPointService.subscribeDataPoints
    >;
  const mockSubscribeDataPointInstances =
    DataPointService.subscribeDataPointInstances as jest.MockedFunction<
      typeof DataPointService.subscribeDataPointInstances
    >;
  const mockGetDataPoints =
    DataPointService.getDataPoints as jest.MockedFunction<
      typeof DataPointService.getDataPoints
    >;
  const mockGetDataPointInstances =
    DataPointService.getDataPointInstances as jest.MockedFunction<
      typeof DataPointService.getDataPointInstances
    >;
  const mockDeleteDataPoint =
    DataPointService.deleteDataPoint as jest.MockedFunction<
      typeof DataPointService.deleteDataPoint
    >;
  const mockDeleteDataPointInstance =
    DataPointService.deleteDataPointInstance as jest.MockedFunction<
      typeof DataPointService.deleteDataPointInstance
    >;

  const mockDataPoints: DataPoint[] = [
    {
      id: "1",
      pk: "DATAPOINT-1",
      sk: "SK-1",
      activityId: "ACTIVITY-1",
      questionId: "QUESTION-1",
    },
  ];

  const mockInstances: DataPointInstance[] = [
    {
      id: "1",
      pk: "INSTANCE-1",
      sk: "SK-1",
      activityId: "ACTIVITY-1",
      questionId: "QUESTION-1",
      answers: "Answer 1",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useDataPointList());
      expect(result.current.loading).toBe(true);
      expect(result.current.dataPoints).toEqual([]);
      expect(result.current.instances).toEqual([]);
    });

    it("subscribes to both data points and instances on mount", () => {
      const unsubscribe1 = jest.fn();
      const unsubscribe2 = jest.fn();
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: unsubscribe1,
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: unsubscribe2,
      });
      renderHook(() => useDataPointList());
      expect(mockSubscribeDataPoints).toHaveBeenCalled();
      expect(mockSubscribeDataPointInstances).toHaveBeenCalled();
    });

    it("updates data points when subscription callback fires", async () => {
      let subscriptionCallback:
        | ((items: DataPoint[], synced: boolean) => void)
        | null = null;
      mockSubscribeDataPoints.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useDataPointList());
      expect(result.current.loading).toBe(true);

      if (subscriptionCallback) {
        subscriptionCallback(mockDataPoints, true);
      }

      await waitFor(() => {
        expect(result.current.dataPoints).toEqual(mockDataPoints);
        expect(result.current.loading).toBe(false);
      });
    });

    it("updates instances when subscription callback fires", async () => {
      let subscriptionCallback:
        | ((items: DataPointInstance[], synced: boolean) => void)
        | null = null;
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useDataPointList());

      if (subscriptionCallback) {
        subscriptionCallback(mockInstances, true);
      }

      await waitFor(() => {
        expect(result.current.instances).toEqual(mockInstances);
      });
    });
  });

  describe("delete data point", () => {
    it("deletes a data point successfully", async () => {
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteDataPoint.mockResolvedValue(undefined);
      const { result } = renderHook(() => useDataPointList());

      await act(async () => {
        await result.current.handleDeleteDataPoint("1");
      });

      expect(mockDeleteDataPoint).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteDataPoint.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useDataPointList());

      await act(async () => {
        await result.current.handleDeleteDataPoint("1");
      });

      expect(result.current.error).toBe("Failed to delete data point.");
    });
  });

  describe("delete instance", () => {
    it("deletes an instance successfully", async () => {
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteDataPointInstance.mockResolvedValue(undefined);
      const { result } = renderHook(() => useDataPointList());

      await act(async () => {
        await result.current.handleDeleteInstance("1");
      });

      expect(mockDeleteDataPointInstance).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteDataPointInstance.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useDataPointList());

      await act(async () => {
        await result.current.handleDeleteInstance("1");
      });

      expect(result.current.error).toBe("Failed to delete instance.");
    });
  });

  describe("refresh data points", () => {
    it("refreshes both data points and instances manually", async () => {
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetDataPoints.mockResolvedValue(mockDataPoints);
      mockGetDataPointInstances.mockResolvedValue(mockInstances);
      const { result } = renderHook(() => useDataPointList());

      await act(async () => {
        await result.current.refreshDataPoints();
      });

      expect(mockGetDataPoints).toHaveBeenCalled();
      expect(mockGetDataPointInstances).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.dataPoints).toEqual(mockDataPoints);
        expect(result.current.instances).toEqual(mockInstances);
        expect(result.current.loading).toBe(false);
      });
    });

    it("handles refresh errors", async () => {
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetDataPoints.mockRejectedValue(new Error("Refresh failed"));
      const { result } = renderHook(() => useDataPointList());

      await act(async () => {
        await result.current.refreshDataPoints();
      });

      expect(result.current.error).toBe("Failed to refresh data points.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes both subscriptions on unmount", () => {
      const unsubscribe1 = jest.fn();
      const unsubscribe2 = jest.fn();
      mockSubscribeDataPoints.mockReturnValue({
        unsubscribe: unsubscribe1,
      });
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: unsubscribe2,
      });
      const { unmount } = renderHook(() => useDataPointList());
      unmount();
      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
    });
  });
});
