/**
 * Centralized color system for the application
 * Following React Native best practices for single source of truth
 * Colors match the existing Lumiere app color scheme
 */

export const AppColors = {
  // Base colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Primary Brand Colors
  CINavy: "#1E376C",
  CIBlue: "#237cb8",
  punch: "#D93D23",
  errorRed: "#F44336",

  // Neutral Colors - Text
  gray: "#333333",
  mediumDarkGray: "#666666",
  approxNero: "#232323",

  // Neutral Colors - Backgrounds & Borders
  lightGray: "#E5E5E5",
  ltGray: "#EEEEEE",
  powderGray: "#F3F7FA",

  // Accent Colors
  lightYellow: "#FFD85E",

  // Opacity Variants
  CINavyHalfOpacity: "#1E376C50",
  whiteHalfOpacity: "#FFFFFF50",

  // Shadow Colors (with opacity)
  blackShadow5: "rgba(0, 0, 0, 0.05)", // 5% opacity
  blackShadow10: "rgba(0, 0, 0, 0.10)", // 10% opacity
  blackShadow15: "rgba(0, 0, 0, 0.15)", // 15% opacity

  // Legacy colors (for backward compatibility during migration)
  // These should be gradually replaced with AppColors
  legacy: {
    primary: "#3498db",
    secondary: "#2ecc71",
    danger: "#e74c3c",
    warning: "#f39c12",
    dark: "#2f3542",
    gray: "#747d8c",
    lightGray: "#ecf0f1",
  },
} as const;

export type AppColorKey = keyof typeof AppColors;
