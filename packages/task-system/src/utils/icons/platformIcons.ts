/**
 * Platform icon mapping utility
 * Centralized platform identification with emoji icons
 */

import { getPlatform } from "@utils/platform/platform";

/**
 * Platform icon map - maps platform OS to emoji icon
 * Use this pattern instead of switch/if-else statements for simple value mappings
 */
const PLATFORM_ICONS: Record<string, string> = {
  ios: "🍎", // iOS/Apple
  android: "🤖", // Android
  web: "🌐", // Web (default)
} as const;

/**
 * Get platform emoji icon
 * @returns Platform emoji icon (🍎 for iOS, 🤖 for Android, 🌐 for Web)
 */
export const getPlatformIcon = (): string => {
  const platform = getPlatform();

  // Use object map lookup instead of if/else or switch
  const baseIcon = PLATFORM_ICONS[platform];
  if (baseIcon) {
    // For web, check user agent for more specific identification
    if (platform === "web") {
      const userAgent =
        typeof navigator !== "undefined" ? navigator.userAgent : "";
      if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        return "🌐🍎"; // Web-iOS
      }
      if (userAgent.includes("Android")) {
        return "🌐🤖"; // Web-Android
      }
    }
    return baseIcon;
  }

  // Fallback: capitalize first letter
  return platform.charAt(0).toUpperCase() + platform.slice(1);
};
