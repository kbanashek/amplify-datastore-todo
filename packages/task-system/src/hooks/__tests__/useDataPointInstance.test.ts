import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useDataPointInstance } from "@hooks/useDataPointInstance";

// Mock DataPointService
jest.mock("@services/DataPointService", () => ({
  DataPointService: {
    subscribeDataPointInstances: jest.fn(),
    createDataPointInstance: jest.fn(),
    updateDataPointInstance: jest.fn(),
  },
}));

import { DataPointService } from "@services/DataPointService";
import { DataPointInstance as DataPointInstanceModel } from "@models/index";
import {
  DataPointInstance,
  CreateDataPointInstanceInput,
} from "@task-types/DataPoint";

describe("useDataPointInstance", () => {
  const mockSubscribeDataPointInstances =
    DataPointService.subscribeDataPointInstances as jest.MockedFunction<
      typeof DataPointService.subscribeDataPointInstances
    >;
  const mockCreateDataPointInstance =
    DataPointService.createDataPointInstance as jest.MockedFunction<
      typeof DataPointService.createDataPointInstance
    >;
  const mockUpdateDataPointInstance =
    DataPointService.updateDataPointInstance as jest.MockedFunction<
      typeof DataPointService.updateDataPointInstance
    >;

  const mockInstances = [
    {
      id: "1",
      pk: "INSTANCE-1",
      sk: "SK-1",
      activityId: "ACTIVITY-1",
      questionId: "QUESTION-1",
      answers: "Answer 1",
    },
    {
      id: "2",
      pk: "INSTANCE-2",
      sk: "SK-2",
      activityId: "ACTIVITY-1",
      questionId: "QUESTION-2",
      answers: "Answer 2",
    },
    {
      id: "3",
      pk: "INSTANCE-3",
      sk: "SK-3",
      activityId: "ACTIVITY-2",
      questionId: "QUESTION-1",
      answers: "Answer 3",
    },
  ] as DataPointInstanceModel[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useDataPointInstance());
      expect(result.current.loading).toBe(true);
      expect(result.current.instances).toEqual([]);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
    });

    it("subscribes to data point instances on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useDataPointInstance());
      expect(mockSubscribeDataPointInstances).toHaveBeenCalled();
    });

    it("updates instances when subscription callback fires", async () => {
      let subscriptionCallback: any = null;
      mockSubscribeDataPointInstances.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useDataPointInstance());
      expect(result.current.loading).toBe(true);

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: DataPointInstanceModel[],
            synced: boolean
          ) => void
        )(mockInstances, true);
      }

      await waitFor(() => {
        expect(result.current.instances).toEqual(mockInstances);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("getInstancesByActivityId", () => {
    it("filters instances by activity ID", async () => {
      let subscriptionCallback: any = null;
      mockSubscribeDataPointInstances.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useDataPointInstance());

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: DataPointInstanceModel[],
            synced: boolean
          ) => void
        )(mockInstances, true);
      }

      await waitFor(() => {
        expect(result.current.instances.length).toBeGreaterThan(0);
      });

      const activity1Instances =
        result.current.getInstancesByActivityId("ACTIVITY-1");
      expect(activity1Instances).toHaveLength(2);
      expect(activity1Instances.every(i => i.activityId === "ACTIVITY-1")).toBe(
        true
      );
    });

    it("returns empty array when no instances for activity", async () => {
      let subscriptionCallback: any = null;
      mockSubscribeDataPointInstances.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useDataPointInstance());

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: DataPointInstanceModel[],
            synced: boolean
          ) => void
        )(mockInstances, true);
      }

      await waitFor(() => {
        expect(result.current.instances.length).toBeGreaterThan(0);
      });

      const activity3Instances =
        result.current.getInstancesByActivityId("ACTIVITY-3");
      expect(activity3Instances).toEqual([]);
    });
  });

  describe("getInstanceByQuestionId", () => {
    it("finds instance by activity ID and question ID", async () => {
      let subscriptionCallback: any = null;
      mockSubscribeDataPointInstances.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useDataPointInstance());

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: DataPointInstanceModel[],
            synced: boolean
          ) => void
        )(mockInstances, true);
      }

      await waitFor(() => {
        expect(result.current.instances.length).toBeGreaterThan(0);
      });

      const instance = result.current.getInstanceByQuestionId(
        "ACTIVITY-1",
        "QUESTION-1"
      );
      expect(instance).toBeDefined();
      expect(instance?.activityId).toBe("ACTIVITY-1");
      expect(instance?.questionId).toBe("QUESTION-1");
    });

    it("returns undefined when instance not found", async () => {
      let subscriptionCallback: any = null;
      mockSubscribeDataPointInstances.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useDataPointInstance());

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: DataPointInstanceModel[],
            synced: boolean
          ) => void
        )(mockInstances, true);
      }

      await waitFor(() => {
        expect(result.current.instances.length).toBeGreaterThan(0);
      });

      const instance = result.current.getInstanceByQuestionId(
        "ACTIVITY-1",
        "QUESTION-999"
      );
      expect(instance).toBeUndefined();
    });
  });

  describe("createDataPointInstance", () => {
    it("creates a data point instance successfully", async () => {
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const newInstance = {
        id: "4",
        pk: "INSTANCE-4",
        sk: "SK-4",
        activityId: "ACTIVITY-1",
        questionId: "QUESTION-3",
        answers: "New Answer",
      } as DataPointInstanceModel;
      mockCreateDataPointInstance.mockResolvedValue(newInstance);
      const { result } = renderHook(() => useDataPointInstance());

      const input: CreateDataPointInstanceInput = {
        pk: "INSTANCE-4",
        sk: "SK-4",
        activityId: "ACTIVITY-1",
        questionId: "QUESTION-3",
        answers: "New Answer",
      };

      await act(async () => {
        const created = await result.current.createDataPointInstance(input);
        expect(created).toEqual(newInstance);
      });

      expect(mockCreateDataPointInstance).toHaveBeenCalledWith(input);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles create errors", async () => {
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockCreateDataPointInstance.mockRejectedValue(new Error("Create failed"));
      const { result } = renderHook(() => useDataPointInstance());

      const input: CreateDataPointInstanceInput = {
        pk: "INSTANCE-4",
        sk: "SK-4",
        activityId: "ACTIVITY-1",
        questionId: "QUESTION-3",
        answers: "New Answer",
      };

      await act(async () => {
        const created = await result.current.createDataPointInstance(input);
        expect(created).toBeNull();
      });

      expect(result.current.error).toBe("Create failed");
      expect(result.current.isCreating).toBe(false);
    });

    it("sets isCreating during creation", async () => {
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockCreateDataPointInstance.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockInstances[0]), 100)
          )
      );
      const { result } = renderHook(() => useDataPointInstance());

      const input: CreateDataPointInstanceInput = {
        pk: "INSTANCE-4",
        sk: "SK-4",
        activityId: "ACTIVITY-1",
        questionId: "QUESTION-3",
        answers: "New Answer",
      };

      let createPromise: Promise<DataPointInstance | null>;
      act(() => {
        createPromise = result.current.createDataPointInstance(input);
      });

      // Check immediately after calling (before awaiting)
      expect(result.current.isCreating).toBe(true);
      await act(async () => {
        await createPromise!;
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe("updateDataPointInstance", () => {
    it("updates a data point instance successfully", async () => {
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const updatedInstance = {
        ...mockInstances[0],
        answers: "Updated Answer",
      } as DataPointInstanceModel;
      mockUpdateDataPointInstance.mockResolvedValue(updatedInstance);
      const { result } = renderHook(() => useDataPointInstance());

      await act(async () => {
        const updated = await result.current.updateDataPointInstance("1", {
          answers: "Updated Answer",
        });
        expect(updated).toEqual(updatedInstance);
      });

      expect(mockUpdateDataPointInstance).toHaveBeenCalledWith("1", {
        answers: "Updated Answer",
      });
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles update errors", async () => {
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockUpdateDataPointInstance.mockRejectedValue(new Error("Update failed"));
      const { result } = renderHook(() => useDataPointInstance());

      await act(async () => {
        const updated = await result.current.updateDataPointInstance("1", {
          answers: "Updated Answer",
        });
        expect(updated).toBeNull();
      });

      expect(result.current.error).toBe("Update failed");
      expect(result.current.isUpdating).toBe(false);
    });

    it("sets isUpdating during update", async () => {
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockUpdateDataPointInstance.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockInstances[0]), 100)
          )
      );
      const { result } = renderHook(() => useDataPointInstance());

      let updatePromise: Promise<DataPointInstance | null>;
      act(() => {
        updatePromise = result.current.updateDataPointInstance("1", {
          answers: "Updated",
        });
      });

      // Check immediately after calling (before awaiting)
      expect(result.current.isUpdating).toBe(true);
      await act(async () => {
        await updatePromise!;
      });
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeDataPointInstances.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useDataPointInstance());
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
