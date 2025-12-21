/**
 * Platform-aware logging utility for app-level code
 * All logs must include platform identification (iOS, Android, or Web)
 */

import { Platform } from "react-native";

/**
 * Get platform identifier for logging
 * Uses Platform.OS directly (consistent with existing platform.ts utility pattern)
 * @returns Platform identifier string (e.g., "iOS", "Android", "Web")
 */
export function getPlatformId(): string {
  const platform = Platform.OS;

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
  const platform = getPlatformId();
  const stepPart = step ? `[${step}] ` : "";
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : "";
  const fullMessage = `❌ [${platform}] ${stepPart}${serviceName}: ${message}${errorMessage ? ` - ${errorMessage}` : ""}`;
  console.error(fullMessage);
}
