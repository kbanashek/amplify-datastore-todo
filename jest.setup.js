// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useSegments: () => [],
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock react-native-get-random-values for Amplify
jest.mock('react-native-get-random-values', () => ({}));

jest.mock('./src/contexts/AmplifyContext', () => ({
  useAmplify: () => ({
    networkStatus: 'ONLINE',
    isOnline: true,
    isSynced: true,
  }),
  AmplifyProvider: ({ children }) => children,
}));

jest.mock('@aws-amplify/datastore', () => {
  const mockDataStore = {
    configure: jest.fn(),
    query: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    observeQuery: jest.fn(() => ({
      subscribe: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
    })),
    start: jest.fn(),
    stop: jest.fn(),
  };

  return {
    DataStore: mockDataStore,
    OpType: {
      CREATE: 'CREATE',
      UPDATE: 'UPDATE',
      DELETE: 'DELETE',
    },
    initSchema: jest.fn(() => ({
      Todo: class Todo {},
      Task: class Task {},
      Question: class Question {},
      Activity: class Activity {},
      DataPoint: class DataPoint {},
      DataPointInstance: class DataPointInstance {},
      TaskAnswer: class TaskAnswer {},
      TaskResult: class TaskResult {},
      TaskHistory: class TaskHistory {},
    })),
  };
});

// Mock models module with copyOf method
const createModelClass = (name: string) => {
  class ModelClass {
    static copyOf(original: any, updater: (draft: any) => void) {
      const draft = { ...original };
      updater(draft);
      return draft;
    }
    constructor(data: any) {
      Object.assign(this, data);
    }
  }
  return ModelClass;
};

jest.mock('./models', () => ({
  Task: createModelClass('Task'),
  Question: createModelClass('Question'),
  Activity: createModelClass('Activity'),
  DataPoint: createModelClass('DataPoint'),
  DataPointInstance: createModelClass('DataPointInstance'),
  TaskAnswer: createModelClass('TaskAnswer'),
  TaskResult: createModelClass('TaskResult'),
  TaskHistory: createModelClass('TaskHistory'),
  TaskType: {
    SCHEDULED: 'SCHEDULED',
    TIMED: 'TIMED',
    EPISODIC: 'EPISODIC',
  },
  TaskStatus: {
    OPEN: 'OPEN',
    VISIBLE: 'VISIBLE',
    STARTED: 'STARTED',
    INPROGRESS: 'INPROGRESS',
    COMPLETED: 'COMPLETED',
    EXPIRED: 'EXPIRED',
    RECALLED: 'RECALLED',
  },
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

