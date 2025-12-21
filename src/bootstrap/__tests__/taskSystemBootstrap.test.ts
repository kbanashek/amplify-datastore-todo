// Skip this test suite - requires React Native environment setup
// TODO: Fix Amplify API mocking for test environment
// The issue is that generateClient from @aws-amplify/api requires React Native environment
import { bootstrapTaskSystem } from "../taskSystemBootstrap";

describe.skip("bootstrapTaskSystem", () => {
  it("should be skipped until Amplify API mocking is fixed", () => {
    expect(true).toBe(true);
  });
});

const mockInitTaskSystem = jest.fn().mockResolvedValue(undefined);
jest.mock("@orion/task-system", () => ({
  initTaskSystem: (...args: any[]) => mockInitTaskSystem(...args),
}));

const mockDataStoreStart = jest.fn().mockResolvedValue(undefined);
jest.mock("@aws-amplify/datastore", () => ({
  DataStore: {
    start: (...args: any[]) => mockDataStoreStart(...args),
  },
}));

describe("bootstrapTaskSystem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes task-system without starting DataStore inside the package", async () => {
    await bootstrapTaskSystem({ startDataStore: false });

    expect(mockInitTaskSystem).toHaveBeenCalledWith({ startDataStore: false });
    expect(mockDataStoreStart).not.toHaveBeenCalled();
  });

  it("starts DataStore when startDataStore=true", async () => {
    await bootstrapTaskSystem({ startDataStore: true });

    expect(mockInitTaskSystem).toHaveBeenCalledWith({ startDataStore: false });
    expect(mockDataStoreStart).toHaveBeenCalled();
  });

  it("is single-flight (concurrent calls reuse the same in-flight bootstrap)", async () => {
    await Promise.all([
      bootstrapTaskSystem({ startDataStore: true }),
      bootstrapTaskSystem({ startDataStore: true }),
      bootstrapTaskSystem({ startDataStore: true }),
    ]);

    expect(mockInitTaskSystem).toHaveBeenCalledTimes(1);
    expect(mockDataStoreStart).toHaveBeenCalledTimes(1);
  });
});
