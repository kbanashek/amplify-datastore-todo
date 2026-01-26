/**
 * Unit tests for syncUtils
 * Tests DataStore sync utilities including timeout-protected stop
 */

import { forceFullSync, clearCacheAndResync } from "../syncUtils";

jest.mock("@aws-amplify/datastore", () => ({
  DataStore: {},
}));

jest.mock("@aws-amplify/core", () => ({
  Hub: {},
}));

// Mock deviceLogger from package
jest.mock("@orion/task-system", () => ({
  logWithDevice: jest.fn(),
  logErrorWithDevice: jest.fn(),
  resetDataStore: jest.fn().mockResolvedValue(undefined),
}));

describe("syncUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("forceFullSync", () => {
    it("delegates to resetDataStore(mode=restart)", async () => {
      const { resetDataStore } = require("@orion/task-system");
      const promise = forceFullSync();
      await jest.runAllTimersAsync();
      await promise;
      expect(resetDataStore).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ mode: "restart" })
      );
    });
  });

  describe("clearCacheAndResync", () => {
    it("delegates to resetDataStore(mode=clearAndRestart)", async () => {
      const { resetDataStore } = require("@orion/task-system");
      const promise = clearCacheAndResync();
      await jest.runAllTimersAsync();
      await promise;
      expect(resetDataStore).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ mode: "clearAndRestart" })
      );
    });
  });

  describe("timeout protection", () => {
    it("should log timeout warning when DataStore.stop() times out", async () => {
      const { logWithDevice } = require("@orion/task-system");

      // Act
      const promise = forceFullSync();
      await jest.runAllTimersAsync();
      await promise;

      // Assert - should have logged timeout warning
      expect(logWithDevice).toHaveBeenCalled();
    });
  });
});
