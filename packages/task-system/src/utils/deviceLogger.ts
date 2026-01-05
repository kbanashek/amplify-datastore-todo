/**
 * Device-specific logging utility
 * Helps identify which device/platform is performing operations
 */

import { getPlatformIcon } from "@utils/platformIcons";

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
 * @returns Device identifier emoji (e.g., "🍎", "🤖", "🌐")
 */
export function getDeviceId(): string {
  return getPlatformIcon();
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
 * Uses new standard format: [Platform:task-system:ServiceName] : message
 */
export function logWithDevice(
  serviceName: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (!debugLogsEnabled()) return;
  const deviceId = getDeviceId();
  const source = "task-system"; // Package source
  const formattedMessage = `[${deviceId}:${source}:${serviceName}] : ${message}`;
  if (data) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
}

/**
 * Log error with device context
 * Uses new standard format: [Platform:task-system:ServiceName] : ❌ message
 */
export function logErrorWithDevice(
  serviceName: string,
  message: string,
  error?: unknown
): void {
  const deviceId = getDeviceId();
  const source = "task-system"; // Package source
  const errorMsg =
    error instanceof Error ? error.message : error ? String(error) : "";
  const fullMessage = errorMsg ? `${message} - ${errorMsg}` : message;
  const formattedMessage = `[${deviceId}:${source}:${serviceName}] : ❌ ${fullMessage}`;
  if (error && errorMsg !== String(error)) {
    console.error(formattedMessage, error);
  } else {
    console.error(formattedMessage);
  }
}
