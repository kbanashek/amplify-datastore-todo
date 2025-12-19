/**
 * Device-specific logging utility
 * Helps identify which device/platform is performing operations
 */

import { Platform } from "react-native";

/**
 * Enable verbose debug logging only when explicitly opted-in.
 *
 * - Default: OFF (prevents "log loops" from render/subscription hot paths)
 * - To enable: set `EXPO_PUBLIC_TASK_SYSTEM_DEBUG_LOGS=1`
 */
function debugLogsEnabled(): boolean {
  // eslint-disable-next-line no-undef
  const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;
  if (!isDev) return false;

  // Expo public env var (preferred)
  const expoFlag =
    typeof process !== "undefined" &&
    typeof process.env !== "undefined" &&
    process.env.EXPO_PUBLIC_TASK_SYSTEM_DEBUG_LOGS === "1";
  if (expoFlag) return true;

  return false;
}

/**
 * Get device/platform identifier for logging
 * @returns Device identifier string (e.g., "iOS", "Android", "Web")
 */
export function getDeviceId(): string {
  const platform = Platform.OS;
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  // For web, try to get more specific info
  if (platform === "web") {
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

  return platformName;
}

/**
 * Create a log prefix with device info
 * @param serviceName - Name of the service logging
 * @returns Log prefix string
 */
export function getLogPrefix(serviceName: string): string {
  const deviceId = getDeviceId();
  const timestamp = new Date().toISOString();
  return `[${deviceId}][${serviceName}][${timestamp}]`;
}

/**
 * Log with device context
 */
export function logWithDevice(
  serviceName: string,
  message: string,
  data?: any
): void {
  if (!debugLogsEnabled()) return;
  const prefix = getLogPrefix(serviceName);
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Log error with device context
 */
export function logErrorWithDevice(
  serviceName: string,
  message: string,
  error?: any
): void {
  const prefix = getLogPrefix(serviceName);
  if (error) {
    console.error(`${prefix} ${message}`, error);
  } else {
    console.error(`${prefix} ${message}`);
  }
}
