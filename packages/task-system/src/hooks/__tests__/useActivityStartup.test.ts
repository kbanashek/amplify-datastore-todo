import { renderHook, waitFor } from "@testing-library/react-native";
import { useActivityStartup } from "@hooks/useActivityStartup";

// Mock ActivityService
jest.mock("@services/ActivityService", () => ({
  ActivityService: {
    subscribeActivities: jest.fn(),
  },
}));

// Mock dataSubscriptionLogger
jest.mock("@utils/dataSubscriptionLogger", () => ({
  dataSubscriptionLogger: {
    logActivities: jest.fn(),
  },
}));

import { ActivityService } from "@services/ActivityService";
import { dataSubscriptionLogger } from "@utils/dataSubscriptionLogger";
import { Activity as ActivityModel } from "@models/index";
import { Activity } from "@task-types/Activity";

describe("useActivityStartup", () => {
  const mockSubscribeActivities =
    ActivityService.subscribeActivities as jest.MockedFunction<
      typeof ActivityService.subscribeActivities
    >;
  const mockLogActivities =
    dataSubscriptionLogger.logActivities as jest.MockedFunction<
      typeof dataSubscriptionLogger.logActivities
    >;

  const mockActivities = [
    {
      id: "1",
      pk: "ACTIVITY-1",
      sk: "SK-1",
      name: "Activity 1",
      title: "Title 1",
      description: "Description 1",
      type: "QUESTIONNAIRE",
      createdAt: "2025-12-22T10:00:00Z",
    },
    {
      id: "2",
      pk: "ACTIVITY-2",
      sk: "SK-2",
      name: "Activity 2",
      title: "Title 2",
      description: "Description 2",
      type: "QUESTIONNAIRE",
      createdAt: "2025-12-22T11:00:00Z",
    },
  ] as ActivityModel[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("subscription setup", () => {
    it("subscribes to activities on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useActivityStartup());
      expect(mockSubscribeActivities).toHaveBeenCalledTimes(1);
      expect(mockSubscribeActivities).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("only subscribes once even with multiple renders", () => {
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockReturnValue({
        unsubscribe,
      });
      const { rerender } = renderHook(() => useActivityStartup());
      rerender(undefined);
      rerender(undefined);
      expect(mockSubscribeActivities).toHaveBeenCalledTimes(1);
    });
  });

  describe("logging behavior", () => {
    it("logs activities when count changes", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      // First call with activities
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(mockActivities, true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      expect(mockLogActivities).toHaveBeenCalledWith(
        [
          {
            name: "Activity 1",
            title: "Title 1",
            createdAt: "2025-12-22T10:00:00Z",
          },
          {
            name: "Activity 2",
            title: "Title 2",
            createdAt: "2025-12-22T11:00:00Z",
          },
        ],
        true,
        "useActivityStartup"
      );
    });

    it("logs activities when sync status changes", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      // First call with synced=true
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(mockActivities, true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      mockLogActivities.mockClear();

      // Second call with same count but synced=false
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(mockActivities, false);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      expect(mockLogActivities).toHaveBeenCalledWith(
        [
          {
            name: "Activity 1",
            title: "Title 1",
            createdAt: "2025-12-22T10:00:00Z",
          },
          {
            name: "Activity 2",
            title: "Title 2",
            createdAt: "2025-12-22T11:00:00Z",
          },
        ],
        false,
        "useActivityStartup"
      );
    });

    it("does not log when neither count nor sync status changes", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      // First call
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(mockActivities, true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      mockLogActivities.mockClear();

      // Second call with same count and same sync status
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(mockActivities, true);
      }

      // Should not log again
      expect(mockLogActivities).not.toHaveBeenCalled();
    });

    it("logs when activity count increases", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      // First call with 2 activities
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(mockActivities, true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      mockLogActivities.mockClear();

      // Second call with 3 activities
      const newActivity = {
        id: "3",
        pk: "ACTIVITY-3",
        sk: "SK-3",
        name: "Activity 3",
        title: "Title 3",
        description: "Description 3",
        type: "QUESTIONNAIRE",
        createdAt: "2025-12-22T12:00:00Z",
      } as ActivityModel;

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )([...mockActivities, newActivity], true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      expect(mockLogActivities).toHaveBeenCalledWith(
        [
          {
            name: "Activity 1",
            title: "Title 1",
            createdAt: "2025-12-22T10:00:00Z",
          },
          {
            name: "Activity 2",
            title: "Title 2",
            createdAt: "2025-12-22T11:00:00Z",
          },
          {
            name: "Activity 3",
            title: "Title 3",
            createdAt: "2025-12-22T12:00:00Z",
          },
        ],
        true,
        "useActivityStartup"
      );
    });

    it("logs when activity count decreases", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      // First call with 2 activities
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(mockActivities, true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      mockLogActivities.mockClear();

      // Second call with 1 activity
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )([mockActivities[0]], true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      expect(mockLogActivities).toHaveBeenCalledWith(
        [
          {
            name: "Activity 1",
            title: "Title 1",
            createdAt: "2025-12-22T10:00:00Z",
          },
        ],
        true,
        "useActivityStartup"
      );
    });

    it("handles activities with missing name or title", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      const activityWithoutName = {
        id: "1",
        pk: "ACTIVITY-1",
        sk: "SK-1",
        title: "Title Only",
        description: "Description",
        type: "QUESTIONNAIRE",
        createdAt: "2025-12-22T10:00:00Z",
      } as ActivityModel;

      const activityWithoutTitle = {
        id: "2",
        pk: "ACTIVITY-2",
        sk: "SK-2",
        name: "Name Only",
        description: "Description",
        type: "QUESTIONNAIRE",
        createdAt: "2025-12-22T11:00:00Z",
      } as ActivityModel;

      const activityWithoutBoth = {
        id: "3",
        pk: "ACTIVITY-3",
        sk: "SK-3",
        description: "Description",
        type: "QUESTIONNAIRE",
        createdAt: "2025-12-22T12:00:00Z",
      } as ActivityModel;

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )(
          [activityWithoutName, activityWithoutTitle, activityWithoutBoth],
          true
        );
      }

      expect(mockLogActivities).toHaveBeenCalledWith(
        [
          {
            name: undefined,
            title: "Title Only",
            createdAt: "2025-12-22T10:00:00Z",
          },
          {
            name: "Name Only",
            title: undefined,
            createdAt: "2025-12-22T11:00:00Z",
          },
          {
            name: undefined,
            title: undefined,
            createdAt: "2025-12-22T12:00:00Z",
          },
        ],
        true,
        "useActivityStartup"
      );
    });

    it("handles empty activities array", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )([], true);
      }

      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      expect(mockLogActivities).toHaveBeenCalledWith(
        [],
        true,
        "useActivityStartup"
      );
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useActivityStartup());
      unmount();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it("handles unmount when subscription is null", () => {
      mockSubscribeActivities.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { unmount } = renderHook(() => useActivityStartup());
      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("handles initial state correctly (no activities)", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      // Initial call with empty array
      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )([], false);
      }

      // Should log the initial empty state
      expect(mockLogActivities).toHaveBeenCalledTimes(1);
      expect(mockLogActivities).toHaveBeenCalledWith(
        [],
        false,
        "useActivityStartup"
      );
    });

    it("handles activities with null createdAt", () => {
      let subscriptionCallback: any = null;
      const unsubscribe = jest.fn();
      mockSubscribeActivities.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe };
      });

      renderHook(() => useActivityStartup());

      const activityWithoutDate = {
        id: "1",
        pk: "ACTIVITY-1",
        sk: "SK-1",
        name: "Activity 1",
        title: "Title 1",
        description: "Description",
        type: "QUESTIONNAIRE",
        createdAt: null,
      } as ActivityModel;

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: ActivityModel[],
            synced: boolean
          ) => void
        )([activityWithoutDate], true);
      }

      expect(mockLogActivities).toHaveBeenCalledWith(
        [
          {
            name: "Activity 1",
            title: "Title 1",
            createdAt: null,
          },
        ],
        true,
        "useActivityStartup"
      );
    });
  });
});
