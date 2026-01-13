/**
 * Font utilities for platform-aware font handling
 *
 * Provides utilities to get platform-specific font families and styles.
 * iOS and Android handle fonts differently:
 * - iOS: Uses full font family names (Ubuntu-Medium) + fontWeight CSS property
 * - Android: Uses short font family names (Ubuntu-M) + fontWeight: "normal"
 */

import { Platform, TextStyle } from "react-native";

/**
 * Font weight values supported by the app
 */
export const FontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 800,
} as const;

export type FontWeight = (typeof FontWeights)[keyof typeof FontWeights];

/**
 * Font size values for consistent typography
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;

export type FontSize = (typeof FontSizes)[keyof typeof FontSizes];

/**
 * Get platform-specific font family name
 *
 * @param weight - Font weight (300, 400, 500, 800)
 * @param italic - Whether font is italic
 * @returns Platform-specific font family string, or undefined for unsupported weights
 *
 * @example
 * ```typescript
 * // iOS: returns "Ubuntu-Medium"
 * // Android: returns "Ubuntu-M"
 * const fontFamily = getFontFamily(500, false);
 * ```
 */
export const getFontFamily = (
  weight: FontWeight,
  italic = false
): string | undefined => {
  const isIOS = Platform.OS === "ios";

  // Map weights to font names
  const weightMap = {
    [FontWeights.light]: isIOS ? "Ubuntu-Light" : "Ubuntu-L",
    [FontWeights.regular]: isIOS ? "Ubuntu-Regular" : "Ubuntu-R",
    [FontWeights.medium]: isIOS ? "Ubuntu-Medium" : "Ubuntu-M",
    [FontWeights.bold]: isIOS ? "Ubuntu-Bold" : "Ubuntu-B",
  };

  // Handle italic variants
  if (italic) {
    const italicMap = {
      [FontWeights.light]: isIOS ? "Ubuntu-LightItalic" : "Ubuntu-LI",
      [FontWeights.bold]: isIOS ? "Ubuntu-BoldItalic" : "Ubuntu-BI",
    };

    // Only Light and Bold have italic variants
    if (weight === FontWeights.light || weight === FontWeights.bold) {
      return italicMap[weight];
    }

    // Fall back to non-italic for medium/regular
    return weightMap[weight];
  }

  return weightMap[weight];
};

/**
 * Get complete font style with platform handling
 *
 * @param weight - Font weight (300, 400, 500, 800)
 * @param size - Font size in pixels
 * @param italic - Whether font is italic
 * @returns TextStyle object with fontFamily, fontSize, fontWeight
 *
 * @example
 * ```typescript
 * const style = getFontStyle(500, 16, false);
 * // Returns: { fontFamily: "Ubuntu-Medium", fontSize: 16, fontWeight: "500" } on iOS
 * // Returns: { fontFamily: "Ubuntu-M", fontSize: 16, fontWeight: "normal" } on Android
 * ```
 */
export const getFontStyle = (
  weight: FontWeight,
  size: number,
  italic = false
): TextStyle => {
  const isIOS = Platform.OS === "ios";
  const fontFamily = getFontFamily(weight, italic);

  return {
    fontFamily,
    fontSize: size,
    // iOS uses numeric fontWeight, Android uses "normal" (weight is in font file name)
    fontWeight: isIOS ? (String(weight) as TextStyle["fontWeight"]) : "normal",
  };
};
