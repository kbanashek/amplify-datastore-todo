/**
 * Unit tests for LoggingService
 */

import { LoggingService } from "@services/LoggingService";
import { ConsoleProvider } from "@services/logging/providers/ConsoleProvider";
import { NativeProvider } from "@services/logging/providers/NativeProvider";
import { SentryProvider } from "@services/logging/providers/SentryProvider";
import { LogLevel, LogLevelPreset } from "@services/logging/types";

describe("LoggingService", () => {
  let service: LoggingService;
  let consoleProvider: ConsoleProvider;

  beforeEach(() => {
    service = new LoggingService({
      minLevel: LogLevel.DEBUG,
      includePlatform: true,
      includeTimestamp: true,
    });
    consoleProvider = new ConsoleProvider();
  });

  describe("initialization", () => {
    it("should initialize with default providers", () => {
      expect(service.getProvider("ConsoleProvider")).toBeDefined();
    });

    it("should initialize with custom config", () => {
      const customService = new LoggingService({
        minLevel: LogLevel.WARN,
        defaultServiceName: "TestApp",
      });
      expect(customService.getProvider("ConsoleProvider")).toBeDefined();
    });
  });

  describe("provider management", () => {
    it("should add a provider", () => {
      // Remove existing ConsoleProvider first
      service.removeProvider("ConsoleProvider");
      const provider = new ConsoleProvider();
      service.addProvider(provider);
      expect(service.getProvider("ConsoleProvider")).toBe(provider);
    });

    it("should remove a provider", () => {
      service.removeProvider("ConsoleProvider");
      expect(service.getProvider("ConsoleProvider")).toBeUndefined();
    });

    it("should enable/disable a provider", () => {
      const provider = service.getProvider("ConsoleProvider");
      expect(provider?.isEnabled()).toBe(true);
      service.setProviderEnabled("ConsoleProvider", false);
      expect(provider?.isEnabled()).toBe(false);
    });
  });

  describe("log level filtering", () => {
    it("should filter logs below minimum level", () => {
      // Set up spies before creating service to catch INIT-0 log
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      const service = new LoggingService({ minLevel: LogLevelPreset.WARN });

      // Clear INIT-0 log calls to test only the filtered messages
      consoleSpy.mockClear();

      service.debug("Debug message");
      service.info("Info message");
      service.warn("Warn message");

      // After clearing, console.log should not be called for debug/info when minLevel is warn
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe("logging methods", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation();
      jest.spyOn(console, "warn").mockImplementation();
      jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should log debug messages", () => {
      service.debug("Debug message", undefined, "TestService");
      expect(console.log).toHaveBeenCalled();
    });

    it("should log info messages", () => {
      service.info("Info message", undefined, "TestService");
      expect(console.log).toHaveBeenCalled();
    });

    it("should log warn messages", () => {
      service.warn("Warn message", undefined, "TestService");
      expect(console.warn).toHaveBeenCalled();
    });

    it("should log error messages", () => {
      service.error("Error message", new Error("Test error"), "TestService");
      expect(console.error).toHaveBeenCalled();
    });

    it("should include metadata in logs", () => {
      const metadata = { userId: "123", action: "test" };
      service.info("Info message", metadata, "TestService");
      // With single-line format, metadata is inlined in the message string
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Info message")
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("userId: 123")
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("action: test")
      );
    });

    it("should handle errors in error logging", () => {
      const error = new Error("Test error");
      service.error("Error message", error, "TestService");
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("createLogger", () => {
    it("should create a logger with default service name", () => {
      const logger = service.createLogger("TestService");
      expect(logger).toHaveProperty("debug");
      expect(logger).toHaveProperty("info");
      expect(logger).toHaveProperty("warn");
      expect(logger).toHaveProperty("error");
    });

    it("should use service name in logs", () => {
      const logger = service.createLogger("TestService");
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      logger.info("Test message");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("TestService")
      );
    });
  });
});
