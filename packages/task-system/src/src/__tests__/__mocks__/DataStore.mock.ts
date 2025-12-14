import { DataStore, OpType } from "@aws-amplify/datastore";

// Mock DataStore for testing
export const mockDataStore = {
  query: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  observeQuery: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  configure: jest.fn(),
};

export const createMockSubscription = (
  items: any[] = [],
  isSynced: boolean = true
) => {
  return {
    subscribe: jest.fn(callback => {
      // Immediately call callback with mock data
      callback({ items, isSynced });
      return {
        unsubscribe: jest.fn(),
      };
    }),
  };
};

export const createMockTask = (overrides: Partial<any> = {}): any => ({
  id: "test-task-id",
  pk: "test-pk",
  sk: "test-sk",
  title: "Test Task",
  description: "Test Description",
  status: "OPEN",
  taskType: "SCHEDULED",
  startTimeInMillSec: Date.now(),
  expireTimeInMillSec: Date.now() + 86400000,
  ...overrides,
});

export const createMockActivity = (overrides: Partial<any> = {}): any => ({
  id: "test-activity-id",
  pk: "test-pk",
  sk: "test-sk",
  name: "Test Activity",
  layouts: JSON.stringify({ activityGroups: [], layouts: [] }),
  ...overrides,
});

export const createMockQuestion = (overrides: Partial<any> = {}): any => ({
  id: "test-question-id",
  pk: "test-pk",
  sk: "test-sk",
  text: "Test Question",
  type: "text",
  required: false,
  ...overrides,
});

export const createMockTaskAnswer = (overrides: Partial<any> = {}): any => ({
  id: "test-answer-id",
  pk: "test-pk",
  sk: "test-sk",
  taskId: "test-task-id",
  questionId: "test-question-id",
  answer: "Test Answer",
  ...overrides,
});

export const createMockTaskHistory = (overrides: Partial<any> = {}): any => ({
  id: "test-history-id",
  pk: "test-pk",
  sk: "test-sk",
  taskInstanceId: "test-task-instance-id",
  status: "OPEN",
  timestamp: new Date().toISOString(),
  action: "CREATED",
  ...overrides,
});

export const createMockTaskResult = (overrides: Partial<any> = {}): any => ({
  id: "test-result-id",
  pk: "test-pk",
  sk: "test-sk",
  taskInstanceId: "test-task-instance-id",
  status: "OPEN",
  startedAt: new Date().toISOString(),
  ...overrides,
});
