/**
 * Platform-aware logging utility for app-level code
 * All logs must include platform identification (iOS, Android, or Web)
 *
 * NOTE: These utilities now use the centralized logging service.
 * They are maintained for backward compatibility during migration.
 * New code should use useLogger() hook or getLoggingService() directly.
 */

import { getLoggingService, getPlatformIcon } from "@orion/task-system";

/**
 * Get platform identifier for logging (direct detection, no service dependency)
 */
function getPlatformIdDirect(): string {
  return getPlatformIcon();
}

/**
 * Format log message with new standard format
 * Format: [Platform:harness:ServiceName - STEP] : message (with icon inline)
 * Or: [Platform:harness:ServiceName] : message (with icon inline)
 */
function formatLogMessageNew(
  platform: string,
  serviceName: string,
  step: string,
  message: string,
  icon?: string
): string {
  const iconPart = icon ? `${icon} ` : "";
  const messageWithIcon = `${iconPart}${message}`;
  const source = "harness"; // Main app (test harness)

  if (step) {
    // Initialization/data flow logs: [Platform:harness:ServiceName - STEP] : message
    return `[${platform}:${source}:${serviceName} - ${step}] : ${messageWithIcon}`;
  } else {
    // Function logs: [Platform:harness:ServiceName] : message
    return `[${platform}:${source}:${serviceName}] : ${messageWithIcon}`;
  }
}

/**
 * Log with platform identification
 * Use this for all console.log calls to ensure platform is always included
 *
 * @deprecated Use useLogger() hook in React components or getLoggingService() in services
 * This function is maintained for backward compatibility during migration.
 *
 * @param icon - Emoji icon for the log type
 * @param step - Step identifier (e.g., "INIT-1", "DATA-1", or empty string)
 * @param serviceName - Name of the service/module logging
 * @param message - The log message
 * @param data - Optional data object to log
 */
export function logWithPlatform(
  icon: string,
  step: string,
  serviceName: string,
  message: string,
  data?: { [key: string]: unknown }
): void {
  try {
    const logger = getLoggingService();
    logger.info(message, data, serviceName, step, icon);
  } catch {
    // Fallback to console if logging service not initialized
    // This can happen during early initialization
    const platform = getPlatformIdDirect();
    const formattedMessage = formatLogMessageNew(
      platform,
      serviceName,
      step,
      message,
      icon
    );
    if (data) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }
}

/**
 * Log error with platform identification
 * Use this for all console.error calls to ensure platform is always included
 *
 * @deprecated Use useLogger() hook in React components or getLoggingService() in services
 * This function is maintained for backward compatibility during migration.
 *
 * @param step - Step identifier (e.g., "INIT-1", "DATA-1", or empty string)
 * @param serviceName - Name of the service/module logging
 * @param message - The error message
 * @param error - Optional error object (will extract message only)
 */
export function logErrorWithPlatform(
  step: string,
  serviceName: string,
  message: string,
  error?: unknown
): void {
  try {
    const logger = getLoggingService();
    logger.error(message, error, serviceName, step, "❌");
  } catch {
    // Fallback to console if logging service not initialized
    // This can happen during early initialization
    const platform = getPlatformIdDirect();
    const errorMessage =
      error instanceof Error ? error.message : error ? String(error) : "";
    const fullMessage = `${message}${errorMessage ? ` - ${errorMessage}` : ""}`;
    const formattedMessage = formatLogMessageNew(
      platform,
      serviceName,
      step,
      fullMessage,
      "❌"
    );
    console.error(formattedMessage);
  }
}
