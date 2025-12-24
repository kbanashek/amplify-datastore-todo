/**
 * Platform-aware logging utility
 * All logs must include platform identification (iOS, Android, or Web)
 */

import { getPlatformIcon } from "./platformIcons";

/**
 * Get platform identifier for logging
 * @returns Platform identifier emoji (e.g., "🍎", "🤖", "🌐")
 */
export function getPlatformId(): string {
  return getPlatformIcon();
}

/**
 * Create a log message with platform prefix
 * New format: [Platform:task-system:ServiceName - STEP] : icon message
 * Or: [Platform:task-system:ServiceName] : icon message
 *
 * @param icon - Emoji icon for the log type (will be inline in message)
 * @param step - Step identifier (e.g., "INIT-1", "DATA-1", or empty string)
 * @param serviceName - Name of the service/module logging
 * @param message - The log message
 * @returns Formatted log message string
 */
export function formatLogMessage(
  icon: string,
  step: string,
  serviceName: string,
  message: string
): string {
  const platform = getPlatformId();
  const iconPart = icon ? `${icon} ` : "";
  const messageWithIcon = `${iconPart}${message}`;
  const source = "task-system"; // Package source

  if (step) {
    // Initialization/data flow logs: [Platform:task-system:ServiceName - STEP] : message
    return `[${platform}:${source}:${serviceName} - ${step}] : ${messageWithIcon}`;
  } else {
    // Function logs: [Platform:task-system:ServiceName] : message
    return `[${platform}:${source}:${serviceName}] : ${messageWithIcon}`;
  }
}

/**
 * Log with platform identification
 * Use this for all console.log calls to ensure platform is always included
 *
 * NOTE: This utility uses console directly. For centralized logging with providers,
 * the main app should configure logging and services should use the logging service.
 *
 * @deprecated New code should use useLogger() hook in React components.
 * For services in the main app, use getServiceLogger() from the logging service.
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
  data?: Record<string, unknown>
): void {
  // Use console directly - package is self-contained
  // Main app services should use the centralized logging service
  const formattedMessage = formatLogMessage(icon, step, serviceName, message);
  if (data) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
}

/**
 * Log error with platform identification
 * Use this for all console.error calls to ensure platform is always included
 *
 * NOTE: This utility uses console directly. For centralized logging with providers,
 * the main app should configure logging and services should use the logging service.
 *
 * @deprecated New code should use useLogger() hook in React components.
 * For services in the main app, use getServiceLogger() from the logging service.
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
  // Use console directly - package is self-contained
  // Main app services should use the centralized logging service
  const platform = getPlatformId();
  const source = "task-system"; // Package source
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : "";
  const fullMessage = `${message}${errorMessage ? ` - ${errorMessage}` : ""}`;

  if (step) {
    // Initialization/data flow logs: [Platform:task-system:ServiceName - STEP] : ❌ message
    console.error(
      `[${platform}:${source}:${serviceName} - ${step}] : ❌ ${fullMessage}`
    );
  } else {
    // Function logs: [Platform:task-system:ServiceName] : ❌ message
    console.error(`[${platform}:${source}:${serviceName}] : ❌ ${fullMessage}`);
  }
}
