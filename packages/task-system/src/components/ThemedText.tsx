/**
 * ThemedText component module.
 *
 * @module ThemedText
 */

import { StyleSheet, Text, type TextProps } from "react-native";

import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { useThemeColor } from "@hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

/**
 * ThemedText component.
 *
 * @param props - Component props
 * @returns Rendered ThemedText component
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...AppFonts.body,
    lineHeight: 24,
  },
  defaultSemiBold: {
    ...AppFonts.bodyMedium,
    lineHeight: 24,
  },
  title: {
    ...AppFonts.heading,
    lineHeight: 32,
  },
  subtitle: {
    ...AppFonts.subheading,
  },
  link: {
    ...AppFonts.body,
    lineHeight: 30,
    color: AppColors.CIBlue,
  },
});
