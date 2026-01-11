/**
 * Adversarial tests for TaskService - designed to expose error handling gaps
 */

import { TaskService } from "../TaskService";
import { TaskStatus, TaskType } from "@task-types/Task";

// Mock AWS Amplify before importing
jest.mock("aws-amplify", () => ({
  DataStore: {
    save: jest.fn(),
    query: jest.fn(),
    observeQuery: jest.fn(),
    delete: jest.fn(),
  },
}));

const { DataStore } = require("aws-amplify");

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
    let subscriptionCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any) => {
        subscriptionCallback = callbacks.next || callbacks;
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
    // Create 10,000 tasks to test memory handling
    const largeTasks = Array.from({ length: 10000 }, (_, i) => ({
      id: `task-${i}`,
      pk: `TASK-${i}`,
      sk: `SK-${i}`,
      title: `Task ${i}`.repeat(100), // Large strings
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      _version: 1,
      _lastChangedAt: Date.now(),
      _deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    let subscriptionCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any) => {
        subscriptionCallback = callbacks.next || callbacks;
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
    let errorCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any) => {
        errorCallback = callbacks.error;
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
    let subscriptionCallback: any;
    (DataStore.observeQuery as jest.Mock).mockImplementation(() => ({
      subscribe: (callbacks: any) => {
        subscriptionCallback = callbacks.next || callbacks;
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
