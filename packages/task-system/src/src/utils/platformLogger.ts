/**
 * Platform-aware logging utility
 * All logs must include platform identification (iOS, Android, or Web)
 */

import { getPlatform } from "./platform";

/**
 * Get platform identifier for logging
 * @returns Platform identifier string (e.g., "iOS", "Android", "Web")
 */
export function getPlatformId(): string {
  const platform = getPlatform();

  // Map platform to display format
  if (platform === "ios") {
    return "iOS";
  }
  if (platform === "android") {
    return "Android";
  }
  if (platform === "web") {
    // For web, try to get more specific info
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return "Web-iOS";
    }
    if (userAgent.includes("Android")) {
      return "Web-Android";
    }
    return "Web";
  }

  // Fallback: capitalize first letter
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * Create a log message with platform prefix
 * Format: [ICON] [PLATFORM] [STEP] ServiceName: message
 *
 * @param icon - Emoji icon for the log type
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
  const stepPart = step ? `[${step}] ` : "";
  return `${icon} [${platform}] ${stepPart}${serviceName}: ${message}`;
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
  const stepPart = step ? `[${step}] ` : "";
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : "";
  const fullMessage = `❌ [${platform}] ${stepPart}${serviceName}: ${message}${errorMessage ? ` - ${errorMessage}` : ""}`;
  console.error(fullMessage);
}
