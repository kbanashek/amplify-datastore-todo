import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, testID }) => {
  const borderColor = useThemeColor({}, "icon");

  return (
    <ThemedView
      testID={testID}
      style={[styles.container, { borderColor: borderColor + "33" }, style]}
    >
      {children}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
});
