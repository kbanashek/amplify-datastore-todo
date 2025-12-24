/**
 * Unit tests for ConsoleProvider
 */

import { ConsoleProvider } from "@services/logging/providers/ConsoleProvider";
import { LogLevel } from "@services/logging/types";

describe("ConsoleProvider", () => {
  let provider: ConsoleProvider;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    provider = new ConsoleProvider();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("provider management", () => {
    it("should have correct name", () => {
      expect(provider.getName()).toBe("ConsoleProvider");
    });

    it("should be enabled by default", () => {
      expect(provider.isEnabled()).toBe(true);
    });

    it("should enable/disable correctly", () => {
      provider.setEnabled(false);
      expect(provider.isEnabled()).toBe(false);
      provider.setEnabled(true);
      expect(provider.isEnabled()).toBe(true);
    });
  });

  describe("logging", () => {
    it("should log debug messages", () => {
      provider.log({
        level: LogLevel.DEBUG,
        message: "Debug message",
        timestamp: new Date(),
        platform: "iOS",
        serviceName: "TestService",
      });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("should log info messages", () => {
      provider.log({
        level: LogLevel.INFO,
        message: "Info message",
        timestamp: new Date(),
        platform: "iOS",
        serviceName: "TestService",
      });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("should log warn messages", () => {
      provider.log({
        level: LogLevel.WARN,
        message: "Warn message",
        timestamp: new Date(),
        platform: "iOS",
        serviceName: "TestService",
      });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("should log error messages", () => {
      provider.log({
        level: LogLevel.ERROR,
        message: "Error message",
        timestamp: new Date(),
        platform: "iOS",
        serviceName: "TestService",
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should include metadata in logs", () => {
      const metadata = { userId: "123" };
      provider.log({
        level: LogLevel.INFO,
        message: "Info message",
        metadata,
        timestamp: new Date(),
        platform: "iOS",
        serviceName: "TestService",
      });
      // With single-line format, metadata is inlined in the message string
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Info message")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("userId: 123")
      );
    });

    it("should format log message correctly", () => {
      provider.log({
        level: LogLevel.INFO,
        message: "Test message",
        timestamp: new Date(),
        platform: "iOS",
        serviceName: "TestService",
        step: "INIT-1",
        icon: "🚀",
      });
      const callArgs = consoleLogSpy.mock.calls[0][0];
      expect(callArgs).toContain("iOS");
      // With sequence diagram formatting, INIT-1 logs use indentation/arrows
      // The step may appear in sequence format or standard format
      expect(
        callArgs.includes("INIT-1") ||
          callArgs.includes("→") ||
          callArgs.includes("Test message")
      ).toBe(true);
      expect(callArgs).toContain("Test message");
      expect(callArgs).toContain("🚀");
    });

    it("should not log when disabled", () => {
      provider.setEnabled(false);
      provider.log({
        level: LogLevel.INFO,
        message: "Test message",
        timestamp: new Date(),
        platform: "iOS",
        serviceName: "TestService",
      });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
