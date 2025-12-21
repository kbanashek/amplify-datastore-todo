/**
 * Logging context and provider
 * Provides centralized logging service to all components via React context
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import {
  LoggingService,
  initializeLoggingService,
  getLoggingService,
} from "../services/LoggingService";
import type { LoggingConfig } from "../services/logging/types";

interface LoggingContextType {
  logger: LoggingService;
}

const LoggingContext = createContext<LoggingContextType | null>(null);

/**
 * Hook to access the logging service
 * Must be used within a LoggingProvider
 */
export const useLogger = (): LoggingService => {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error("useLogger must be used within a LoggingProvider");
  }
  return context.logger;
};

interface LoggingProviderProps {
  children: ReactNode;
  config?: LoggingConfig;
}

/**
 * LoggingProvider component
 * Initializes the logging service and provides it to all child components
 */
export const LoggingProvider: React.FC<LoggingProviderProps> = ({
  children,
  config,
}) => {
  // Initialize logging service once
  const logger = useMemo(() => {
    const service = initializeLoggingService(config);

    // Inject logger into global scope for package services to access
    // This avoids Metro bundler module resolution errors from dynamic requires
    const globalScope =
      typeof global !== "undefined"
        ? global
        : typeof window !== "undefined"
          ? window
          : null;
    if (globalScope) {
      (globalScope as any).__ORION_LOGGER__ = {
        getServiceLogger: (serviceName: string) =>
          service.createLogger(serviceName),
      };
    }

    return service;
  }, []); // Only initialize once

  // Don't try to initialize Sentry provider automatically
  // SentryProvider will remain disabled until explicitly enabled
  // This prevents Metro bundler errors when @sentry/react-native is not installed
  // To enable Sentry in the future:
  // 1. Install @sentry/react-native
  // 2. Initialize Sentry in your app
  // 3. Call logger.setProviderEnabled("SentryProvider", true)

  const value: LoggingContextType = useMemo(
    () => ({
      logger,
    }),
    [logger]
  );

  return (
    <LoggingContext.Provider value={value}>{children}</LoggingContext.Provider>
  );
};
