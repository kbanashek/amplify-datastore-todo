/**
 * Device-specific logging utility
 * Helps identify which device/platform is performing operations
 */

import { Platform } from "react-native";
import { PACKAGE_SOURCE } from "@constants/packageSource";

const PLATFORM_ICONS: Record<string, string> = {
  ios: "🍎",
  android: "🤖",
  web: "🌐",
} as const;

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
export const getDeviceId = (): string => {
  return PLATFORM_ICONS[Platform.OS] || "❓";
};

/**
 * Create a log prefix with device info
 * @param serviceName - Name of the service logging
 * @returns Log prefix string
 */
export const getLogPrefix = (serviceName: string): string => {
  const deviceId = getDeviceId();
  const timestamp = new Date().toISOString();
  return `[${deviceId}][${serviceName}][${timestamp}]`;
};

/**
 * Log with device context
 * Uses new standard format: [Platform:task-system:ServiceName] : message
 */
export const logWithDevice = (
  serviceName: string,
  message: string,
  data?: Record<string, unknown>
): void => {
  if (!debugLogsEnabled()) return;
  const deviceId = getDeviceId();
  const formattedMessage = `[${deviceId}:${PACKAGE_SOURCE}:${serviceName}] : ${message}`;
  if (data) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
};

/**
 * Log error with device context
 * Uses new standard format: [Platform:task-system:ServiceName] : ❌ message
 */
export const logErrorWithDevice = (
  serviceName: string,
  message: string,
  error?: unknown
): void => {
  const deviceId = getDeviceId();
  const errorMsg =
    error instanceof Error ? error.message : error ? String(error) : "";
  const fullMessage = errorMsg ? `${message} - ${errorMsg}` : message;
  const formattedMessage = `[${deviceId}:${PACKAGE_SOURCE}:${serviceName}] : ❌ ${fullMessage}`;
  if (error && errorMsg !== String(error)) {
    console.error(formattedMessage, error);
  } else {
    console.error(formattedMessage);
  }
};
