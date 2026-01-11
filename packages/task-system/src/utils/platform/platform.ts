import { Platform } from "react-native";

/**
 * Platform utility functions for platform-specific checks
 */

/**
 * Check if the current platform is Android
 * @returns true if running on Android, false otherwise
 */
export const isAndroid = (): boolean => {
  return Platform.OS === "android";
};

/**
 * Check if the current platform is iOS
 * @returns true if running on iOS, false otherwise
 */
export const isIOS = (): boolean => {
  return Platform.OS === "ios";
};

export const isWeb = (): boolean => {
  return Platform.OS === "web";
};

export const isWindows = (): boolean => {
  return Platform.OS === "windows";
};

export const isMacOS = (): boolean => {
  return Platform.OS === "macos";
};

/**
 * Get the current platform OS string
 * @returns "android" | "ios" | "web" | "windows" | "macos"
 */
export const getPlatform = (): string => {
  return Platform.OS;
};
