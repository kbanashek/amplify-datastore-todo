/**
 * Service logger helper
 * Provides easy access to logging service for non-React contexts (services, utilities)
 *
 * Usage in services:
 * ```typescript
 * import { getServiceLogger } from "../services/logging/serviceLogger";
 *
 * const logger = getServiceLogger("TaskService");
 * logger.info("Task created", { taskId: "123" });
 * logger.error("Failed to create task", error);
 * ```
 */

import { getLoggingService } from "../LoggingService";

/**
 * Get a logger instance for a specific service
 * This is the recommended way for services and utilities to access logging
 *
 * @param serviceName - Name of the service (e.g., "TaskService", "AppointmentService")
 * @returns Logger instance with service name pre-configured
 */
export function getServiceLogger(serviceName: string) {
  try {
    const loggingService = getLoggingService();
    return loggingService.createLogger(serviceName);
  } catch {
    // Fallback logger if logging service not initialized
    // This can happen during early initialization
    return {
      debug: (
        message: string,
        metadata?: unknown,
        step?: string,
        icon?: string
      ) => {
        if (__DEV__) {
          const formatted = formatMessage(serviceName, message, step, icon);
          if (metadata) {
            console.log(formatted, metadata);
          } else {
            console.log(formatted);
          }
        }
      },
      info: (
        message: string,
        metadata?: unknown,
        step?: string,
        icon?: string
      ) => {
        const formatted = formatMessage(serviceName, message, step, icon);
        if (metadata) {
          console.log(formatted, metadata);
        } else {
          console.log(formatted);
        }
      },
      warn: (
        message: string,
        metadata?: unknown,
        step?: string,
        icon?: string
      ) => {
        const formatted = formatMessage(serviceName, message, step, icon);
        if (metadata) {
          console.warn(formatted, metadata);
        } else {
          console.warn(formatted);
        }
      },
      error: (
        message: string,
        error?: unknown,
        step?: string,
        icon?: string
      ) => {
        const formatted = formatMessage(
          serviceName,
          message,
          step,
          icon || "❌"
        );
        const errorMsg =
          error instanceof Error ? error.message : error ? String(error) : "";
        const fullMessage = errorMsg ? `${formatted} - ${errorMsg}` : formatted;
        console.error(fullMessage);
      },
    };
  }
}

function formatMessage(
  serviceName: string,
  message: string,
  step?: string,
  icon?: string
): string {
  // Use direct platform detection for fallback with emoji icons
  const platform = (() => {
    try {
      const { getPlatformIcon } = require("../../utils/platformIcons");
      return getPlatformIcon();
    } catch {
      return "❓"; // Unknown
    }
  })();

  const iconPart = icon ? `${icon} ` : "";
  const messageWithIcon = `${iconPart}${message}`;
  const source = "task-system"; // Package source

  if (step) {
    return `[${platform}:${source}:${serviceName} - ${step}] : ${messageWithIcon}`;
  } else {
    return `[${platform}:${source}:${serviceName}] : ${messageWithIcon}`;
  }
}
