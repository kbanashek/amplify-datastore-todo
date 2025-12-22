/**
 * Device-specific logging utility
 * Helps identify which device/platform is performing operations
 */

import { getPlatformIcon } from "./platformIcons";

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
 */
export function logWithDevice(
  serviceName: string,
  message: string,
  data?: any
): void {
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
