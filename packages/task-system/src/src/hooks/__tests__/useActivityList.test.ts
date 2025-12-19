import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useActivityList } from "../useActivityList";

// Mock ActivityService
jest.mock("../../services/ActivityService", () => ({
  ActivityService: {
    subscribeActivities: jest.fn(),
    getActivities: jest.fn(),
    deleteActivity: jest.fn(),
  },
}));

import { ActivityService } from "../../services/ActivityService";
import { Activity } from "../../types/Activity";

describe("useActivityList", () => {
  const mockSubscribeActivities =
    ActivityService.subscribeActivities as jest.MockedFunction<
      typeof ActivityService.subscribeActivities
    >;
  const mockGetActivities =
    ActivityService.getActivities as jest.MockedFunction<
      typeof ActivityService.getActivities
    >;
  const mockDeleteActivity =
    ActivityService.deleteActivity as jest.MockedFunction<
      typeof ActivityService.deleteActivity
    >;

  const mockActivities: Activity[] = [
    {
      id: "1",
      pk: "ACTIVITY-1",
      sk: "SK-1",
      name: "Activity 1",
      title: "Title 1",
      description: "Description 1",
      type: "QUESTIONNAIRE",
    },
    {
      id: "2",
      pk: "ACTIVITY-2",
      sk: "SK-2",
      name: "Activity 2",
      title: "Title 2",
      description: "Description 2",
      type: "QUESTIONNAIRE",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeActivities.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useActivityList());
      expect(result.current.loading).toBe(true);
      expect(result.current.activities).toEqual([]);
    });

    it("subscribes to activities on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useActivityList());
      expect(mockSubscribeActivities).toHaveBeenCalled();
    });

    it("updates activities when subscription callback fires", async () => {
      let subscriptionCallback:
        | ((items: Activity[], synced: boolean) => void)
        | null = null;
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useActivityList());
      expect(result.current.loading).toBe(true);

      if (subscriptionCallback) {
        subscriptionCallback(mockActivities, true);
      }

      await waitFor(() => {
        expect(result.current.activities).toEqual(mockActivities);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("delete activity", () => {
    it("deletes an activity successfully", async () => {
      mockSubscribeActivities.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteActivity.mockResolvedValue(undefined);
      const { result } = renderHook(() => useActivityList());

      await act(async () => {
        await result.current.handleDeleteActivity("1");
      });

      expect(mockDeleteActivity).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeActivities.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteActivity.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useActivityList());

      await act(async () => {
        await result.current.handleDeleteActivity("1");
      });

      expect(result.current.error).toBe("Failed to delete activity.");
    });
  });

  describe("refresh activities", () => {
    it("refreshes activities manually", async () => {
      mockSubscribeActivities.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetActivities.mockResolvedValue(mockActivities);
      const { result } = renderHook(() => useActivityList());

      await act(async () => {
        await result.current.refreshActivities();
      });

      expect(mockGetActivities).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.activities).toEqual(mockActivities);
        expect(result.current.loading).toBe(false);
      });
    });

    it("handles refresh errors", async () => {
      mockSubscribeActivities.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetActivities.mockRejectedValue(new Error("Refresh failed"));
      const { result } = renderHook(() => useActivityList());

      await act(async () => {
        await result.current.refreshActivities();
      });

      expect(result.current.error).toBe("Failed to refresh activities.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useActivityList());
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
