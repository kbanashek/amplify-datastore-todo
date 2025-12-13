/**
 * Centralized style patterns and common styles
 * Following React Native best practices for reusable styles
 */

import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { AppColors } from "./AppColors";

/**
 * Common shadow styles
 */
export const Shadows = {
  card: {
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // 5% opacity
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,

  cardStrong: {
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,
};

/**
 * Common border styles
 */
export const Borders = {
  lightGray: {
    borderWidth: 1,
    borderColor: AppColors.lightGray,
  } as ViewStyle,

  ltGray: {
    borderWidth: 1,
    borderColor: AppColors.ltGray,
  } as ViewStyle,

  CIBlue: {
    borderWidth: 1,
    borderColor: AppColors.CIBlue,
  } as ViewStyle,
};

/**
 * Common text styles
 */
export const TextStyles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.white,
  } as TextStyle,

  body: {
    fontSize: 14,
    fontWeight: "400",
    color: AppColors.white,
  } as TextStyle,

  button: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.CINavy,
  } as TextStyle,

  buttonDisabled: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.CINavyHalfOpacity,
  } as TextStyle,
});

/**
 * Common container styles
 */
export const ContainerStyles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    ...Shadows.card,
  } as ViewStyle,

  button: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  buttonDisabled: {
    backgroundColor: AppColors.whiteHalfOpacity,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
});
