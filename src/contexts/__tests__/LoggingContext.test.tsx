/**
 * Unit tests for LoggingContext
 */

import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { LoggingProvider, useLogger } from "../LoggingContext";

// Mock initializeLoggingService to avoid circular dependencies
jest.mock("@orion/task-system", () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    createLogger: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  };

  return {
    initializeLoggingService: jest.fn().mockReturnValue(mockLogger),
    LoggingService: jest.fn().mockImplementation(() => mockLogger),
  };
});

// Test component that uses the logger
const TestComponent: React.FC = () => {
  const logger = useLogger();
  return React.createElement(
    Text,
    { testID: "test-component" },
    logger ? "Logger available" : "Logger not available"
  );
};

describe("LoggingContext", () => {
  describe("LoggingProvider", () => {
    it("should provide logger to children", () => {
      render(
        React.createElement(
          LoggingProvider,
          null,
          React.createElement(TestComponent)
        )
      );
      expect(screen.getByText("Logger available")).toBeTruthy();
    });

    it("should initialize logging service", () => {
      const { getByText } = render(
        React.createElement(
          LoggingProvider,
          null,
          React.createElement(TestComponent)
        )
      );
      expect(getByText("Logger available")).toBeTruthy();
    });
  });

  describe("useLogger", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(React.createElement(TestComponent));
      }).toThrow("useLogger must be used within a LoggingProvider");

      consoleSpy.mockRestore();
    });

    it("should return logger instance when used inside provider", () => {
      render(
        React.createElement(
          LoggingProvider,
          null,
          React.createElement(TestComponent)
        )
      );
      expect(screen.getByText("Logger available")).toBeTruthy();
    });
  });
});
