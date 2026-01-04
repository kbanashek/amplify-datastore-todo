/**
 * Unit tests for useLogger hook
 */

import { useLogger } from "../useLogger";
import { LoggingProvider } from "../../contexts/LoggingContext";
import { renderHook } from "@testing-library/react-native";
import React from "react";

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

describe("useLogger", () => {
  it("should return logger instance when used within provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(LoggingProvider, null, children);
    };

    const { result } = renderHook(() => useLogger(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("debug");
    expect(result.current).toHaveProperty("info");
    expect(result.current).toHaveProperty("warn");
    expect(result.current).toHaveProperty("error");
  });

  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useLogger());
    }).toThrow("useLogger must be used within a LoggingProvider");

    consoleSpy.mockRestore();
  });
});
