/**
 * Service logger utility for package services
 * Attempts to use main app's centralized logging service if available,
 * falls back to platformLogger if package is used standalone
 */

import { logErrorWithPlatform, logWithPlatform } from "./platformLogger";

type ServiceLogger = {
  debug: (
    message: string,
    metadata?: unknown,
    step?: string,
    icon?: string
  ) => void;
  info: (
    message: string,
    metadata?: unknown,
    step?: string,
    icon?: string
  ) => void;
  warn: (
    message: string,
    metadata?: unknown,
    step?: string,
    icon?: string
  ) => void;
  error: (
    message: string,
    error?: unknown,
    step?: string,
    icon?: string
  ) => void;
};

const loggerCache = new Map<string, ServiceLogger>();

/**
 * Get a logger instance for a specific service
 * Tries to use main app's centralized logging service if available,
 * falls back to platformLogger for standalone package usage
 *
 * @param serviceName - Name of the service (e.g., "TaskService", "AppointmentService")
 * @returns Logger instance with service name pre-configured
 */
export function getServiceLogger(serviceName: string): ServiceLogger {
  // Check cache first
  const cached = loggerCache.get(serviceName);
  if (cached) {
    return cached;
  }

  // Try to use main app's centralized logging service if available
  // Use a global variable approach to avoid Metro bundler module resolution errors
  // The main app can set window.__ORION_LOGGER__ or global.__ORION_LOGGER__ if available
  let logger: ServiceLogger;

  // Check for injected logger from main app (avoids Metro require issues)
  const getInjectedLogger = (): ServiceLogger | null => {
    try {
      // Check global scope for injected logger
      const globalScope =
        typeof global !== "undefined"
          ? global
          : typeof window !== "undefined"
            ? window
            : null;
      if (globalScope && (globalScope as any).__ORION_LOGGER__) {
        const injectedLogger = (globalScope as any).__ORION_LOGGER__;
        if (typeof injectedLogger.getServiceLogger === "function") {
          return injectedLogger.getServiceLogger(serviceName);
        }
      }
    } catch {
      // Ignore errors
    }
    return null;
  };

  const injectedLogger = getInjectedLogger();
  if (injectedLogger) {
    loggerCache.set(serviceName, injectedLogger);
    return injectedLogger;
  }

  // Main app logging service not available - package used standalone
  // Return a logger that uses platformLogger
  logger = {
    debug: (
      message: string,
      metadata?: unknown,
      step?: string,
      icon?: string
    ) => {
      if (__DEV__) {
        logWithPlatform(
          icon || "🔍",
          step || "",
          serviceName,
          message,
          metadata as Record<string, unknown>
        );
      }
    },
    info: (
      message: string,
      metadata?: unknown,
      step?: string,
      icon?: string
    ) => {
      logWithPlatform(
        icon || "ℹ️",
        step || "",
        serviceName,
        message,
        metadata as Record<string, unknown>
      );
    },
    warn: (
      message: string,
      metadata?: unknown,
      step?: string,
      icon?: string
    ) => {
      logWithPlatform(
        icon || "⚠️",
        step || "",
        serviceName,
        message,
        metadata as Record<string, unknown>
      );
    },
    error: (message: string, error?: unknown, step?: string, icon?: string) => {
      logErrorWithPlatform(step || "", serviceName, message, error);
    },
  };

  // Cache the logger
  loggerCache.set(serviceName, logger);
  return logger;
}
