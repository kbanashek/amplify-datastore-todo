import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@hooks/useThemeColor";
import { AppFonts } from "@constants/AppFonts";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

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
    fontSize: 32,
    lineHeight: 32,
  },
  subtitle: {
    ...AppFonts.subheading,
  },
  link: {
    ...AppFonts.body,
    lineHeight: 30,
    color: "#0a7ea4",
  },
});
