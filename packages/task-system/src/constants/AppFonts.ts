/**
 * Centralized font system for the application
 *
 * Provides pre-configured text styles using Ubuntu fonts with platform-aware handling.
 * All font specifications should come from this file to ensure consistency.
 *
 * @example
 * ```typescript
 * import { AppFonts } from "@constants/AppFonts";
 *
 * <Text style={AppFonts.heading}>My Heading</Text>
 * <Text style={[AppFonts.body, { color: AppColors.CINavy }]}>Body text</Text>
 * ```
 */

import { AppColors } from "@constants/AppColors";
import {
  FontSizes,
  FontWeights,
  getFontStyle,
} from "@utils/formatting/fontUtils";
import { TextStyle } from "react-native";

/**
 * Pre-configured text styles for common use cases
 *
 * These styles include font family, size, weight, and default colors.
 * Colors can be overridden by spreading these styles and adding a color property.
 */
export const AppFonts = {
  /**
   * Main heading style (28px, bold, CINavy)
   * Use for page titles and primary headings
   */
  heading: {
    ...getFontStyle(FontWeights.bold, FontSizes.xxxl, false),
    color: AppColors.CINavy,
  } as TextStyle,

  /**
   * Subheading style (18px, medium, CINavy)
   * Use for section headers and secondary headings
   */
  subheading: {
    ...getFontStyle(FontWeights.medium, FontSizes.lg, false),
    color: AppColors.CINavy,
  } as TextStyle,

  /**
   * Body text style (16px, regular, gray)
   * Use for standard body text and paragraphs
   */
  body: {
    ...getFontStyle(FontWeights.regular, FontSizes.md, false),
    color: AppColors.gray,
  } as TextStyle,

  /**
   * Body text with medium weight (16px, medium, gray)
   * Use for emphasized body text
   */
  bodyMedium: {
    ...getFontStyle(FontWeights.medium, FontSizes.md, false),
    color: AppColors.gray,
  } as TextStyle,

  /**
   * Body text with bold weight (16px, bold, gray)
   * Use for strongly emphasized body text
   */
  bodyBold: {
    ...getFontStyle(FontWeights.bold, FontSizes.md, false),
    color: AppColors.gray,
  } as TextStyle,

  /**
   * Button text style (16px, medium, white)
   * Use for button labels
   */
  button: {
    ...getFontStyle(FontWeights.medium, FontSizes.md, false),
    color: AppColors.white,
  } as TextStyle,

  /**
   * Caption text style (12px, regular, mediumDarkGray)
   * Use for small descriptive text, hints, and captions
   */
  caption: {
    ...getFontStyle(FontWeights.regular, FontSizes.xs, false),
    color: AppColors.mediumDarkGray,
  } as TextStyle,

  /**
   * Label text style (14px, medium, gray)
   * Use for form labels and input labels
   */
  label: {
    ...getFontStyle(FontWeights.medium, FontSizes.sm, false),
    color: AppColors.gray,
  } as TextStyle,

  /**
   * Small text style (14px, regular, gray)
   * Use for secondary information and small text
   */
  small: {
    ...getFontStyle(FontWeights.regular, FontSizes.sm, false),
    color: AppColors.gray,
  } as TextStyle,

  /**
   * Large text style (20px, medium, gray)
   * Use for prominent text that's not quite a heading
   */
  large: {
    ...getFontStyle(FontWeights.medium, FontSizes.xl, false),
    color: AppColors.gray,
  } as TextStyle,
} as const;

/**
 * Export font utilities for custom font combinations
 */
export {
  FontSizes,
  FontWeights,
  getFontFamily,
  getFontStyle,
} from "@utils/formatting/fontUtils";

/**
 * Type for AppFonts keys
 */
export type AppFontKey = keyof typeof AppFonts;
