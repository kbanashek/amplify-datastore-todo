import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  label?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  accessibilityLabel?: string;
}

const sizeStyles: Record<
  ButtonSize,
  { paddingVertical: number; paddingHorizontal: number }
> = {
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 14 },
  lg: { paddingVertical: 12, paddingHorizontal: 16 },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  testID,
  style,
  startAdornment,
  endAdornment,
  accessibilityLabel,
}) => {
  const tint = useThemeColor({}, "tint");
  const background = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const icon = useThemeColor({}, "icon");

  const isDisabled = disabled || loading;

  const resolvedA11yLabel =
    accessibilityLabel ?? (typeof label === "string" ? label : undefined);

  const baseContainer: ViewStyle = {
    ...sizeStyles[size],
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    opacity: isDisabled ? 0.6 : 1,
  };

  const variantContainer: ViewStyle =
    variant === "primary"
      ? { backgroundColor: tint }
      : variant === "secondary"
        ? { backgroundColor: icon + "22" }
        : variant === "outline"
          ? {
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: tint,
            }
          : { backgroundColor: "transparent" };

  const labelColor: string =
    variant === "primary" ? background : variant === "secondary" ? text : tint;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={resolvedA11yLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        baseContainer,
        variantContainer,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          testID={testID ? `${testID}-spinner` : undefined}
          color={labelColor}
        />
      ) : (
        <>
          {startAdornment ? (
            <View style={styles.adornment}>{startAdornment}</View>
          ) : null}
          {children ? (
            children
          ) : (
            <ThemedText style={[styles.label, { color: labelColor }]}>
              {label ?? ""}
            </ThemedText>
          )}
          {endAdornment ? (
            <View style={styles.adornment}>{endAdornment}</View>
          ) : null}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  adornment: {
    alignItems: "center",
    justifyContent: "center",
  },
});
