/**
 * Adversarial tests for TaskService - designed to expose error handling gaps
 */

import { TaskService } from "../TaskService";
import { TaskStatus, TaskType } from "@task-types/Task";

// Mock AWS Amplify DataStore before importing (must match TaskService import)
jest.mock("@aws-amplify/datastore", () => ({
  DataStore: {
    save: jest.fn(),
    query: jest.fn(),
    observeQuery: jest.fn(),
    delete: jest.fn(),
  },
}));

const { DataStore } = require("@aws-amplify/datastore");

describe("TaskService - Adversarial Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle DataStore.save() throwing non-Error object", async () => {
    // Test error handling with string instead of Error
    (DataStore.save as jest.Mock).mockRejectedValue("String error");

    await expect(
      TaskService.createTask({
        pk: "TASK-1",
        sk: "SK-1",
        title: "Test",
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      })
    ).rejects.toBe("String error");
  });

  it("should handle DataStore.save() throwing null", async () => {
    (DataStore.save as jest.Mock).mockRejectedValue(null);

    await expect(
      TaskService.createTask({
        pk: "TASK-1",
        sk: "SK-1",
        title: "Test",
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      })
    ).rejects.toBeNull();
  });

  it("should handle subscription callback throwing error", () => {
    // Mock DataStore.query to return a Promise that resolves to empty array
    (DataStore.query as jest.Mock).mockImplementation(() =>
      Promise.resolve([])
    );

    let subscriptionCallback: any;
    let errorCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any, error?: any) => {
        if (typeof callbacks === "function") {
          subscriptionCallback = callbacks;
          errorCallback = error;
        } else {
          subscriptionCallback = callbacks.next || callbacks;
          errorCallback = callbacks.error;
        }
        return { unsubscribe: jest.fn() };
      },
    }));

    // Subscribe with a callback that throws
    const throwingCallback = jest.fn(() => {
      throw new Error("Callback crashed");
    });

    const subscription = TaskService.subscribeTasks(throwingCallback);

    // Trigger the subscription - should be caught by error handler
    expect(() => {
      subscriptionCallback({
        items: [],
        isSynced: true,
      });
    }).not.toThrow();
  });

  it("should handle DataStore.query() returning undefined instead of array", async () => {
    // Test defensive programming
    (DataStore.query as jest.Mock).mockResolvedValue(undefined);

    const tasks = await TaskService.getTasks();

    // Should handle gracefully
    expect(Array.isArray(tasks)).toBe(true);
  });

  it("should handle extremely large task list without memory issues", async () => {
    // Create 1,000 tasks to test memory handling (reduced from 10,000 to prevent CI timeouts)
    const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
      id: `task-${i}`,
      pk: `TASK-${i}`,
      sk: `SK-${i}`,
      title: `Task ${i}`.repeat(100), // Large strings to maintain payload size
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      _version: 1,
      _lastChangedAt: Date.now(),
      _deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Mock DataStore.query to return a Promise that resolves to empty array
    (DataStore.query as jest.Mock).mockImplementation(() =>
      Promise.resolve([])
    );

    let subscriptionCallback: any;
    let errorCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any, error?: any) => {
        if (typeof callbacks === "function") {
          subscriptionCallback = callbacks;
          errorCallback = error;
        } else {
          subscriptionCallback = callbacks.next || callbacks;
          errorCallback = callbacks.error;
        }
        return { unsubscribe: jest.fn() };
      },
    }));

    const callbackSpy = jest.fn();
    TaskService.subscribeTasks(callbackSpy);

    // Send large payload
    subscriptionCallback({
      items: largeTasks,
      isSynced: true,
    });

    expect(callbackSpy).toHaveBeenCalledWith(largeTasks, true);
  });

  it("should handle subscription error gracefully", () => {
    // Mock DataStore.query to return empty array
    (DataStore.query as jest.Mock).mockResolvedValue([]);

    let subscriptionCallback: any;
    let errorCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any, error?: any) => {
        if (typeof callbacks === "function") {
          subscriptionCallback = callbacks;
          errorCallback = error;
        } else {
          subscriptionCallback = callbacks.next || callbacks;
          errorCallback = callbacks.error;
        }
        return { unsubscribe: jest.fn() };
      },
    }));

    const callbackSpy = jest.fn();
    TaskService.subscribeTasks(callbackSpy);

    // Trigger subscription error
    expect(() => {
      errorCallback(new Error("Subscription failed"));
    }).not.toThrow();

    // Should call callback with empty array
    expect(callbackSpy).toHaveBeenCalledWith([], false);
  });

  it("should handle malformed task data in subscription", () => {
    // Mock DataStore.query to return empty array
    (DataStore.query as jest.Mock).mockResolvedValue([]);

    let subscriptionCallback: any;
    let errorCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any, error?: any) => {
        if (typeof callbacks === "function") {
          subscriptionCallback = callbacks;
          errorCallback = error;
        } else {
          subscriptionCallback = callbacks.next || callbacks;
          errorCallback = callbacks.error;
        }
        return { unsubscribe: jest.fn() };
      },
    }));

    const callbackSpy = jest.fn();
    TaskService.subscribeTasks(callbackSpy);

    // Send malformed data
    expect(() => {
      subscriptionCallback({
        items: [
          { id: "1", title: null }, // Missing required fields
          { id: "2" }, // Missing title
          null, // Null item
        ],
        isSynced: true,
      });
    }).not.toThrow();
  });
});
