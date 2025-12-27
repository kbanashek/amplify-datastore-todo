/**
 * Button component with multiple variants, sizes, and states.
 *
 * Provides a flexible, themed button with support for loading states,
 * disabled states, and custom adornments (icons, etc.).
 *
 * @module Button
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@components/ThemedText";
import { AppFonts } from "@constants/AppFonts";
import { useThemeColor } from "@hooks/useThemeColor";

/**
 * Button visual style variant
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

/**
 * Button size variant
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Props for the Button component
 */
export interface ButtonProps {
  /** Button text label (ignored if children provided) */
  label?: string;
  /** Custom button content (overrides label) */
  children?: React.ReactNode;
  /** Callback when button is pressed */
  onPress?: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is in loading state (shows spinner) */
  loading?: boolean;
  /** Visual style variant: primary, secondary, outline, or ghost */
  variant?: ButtonVariant;
  /** Size variant: sm, md, or lg */
  size?: ButtonSize;
  /** Test identifier for testing frameworks */
  testID?: string;
  /** Additional styles for the button container */
  style?: StyleProp<ViewStyle>;
  /** Content to display before the label/children (e.g., icon) */
  startAdornment?: React.ReactNode;
  /** Content to display after the label/children (e.g., icon) */
  endAdornment?: React.ReactNode;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

/**
 * Padding styles for each button size
 */
const sizeStyles: Record<
  ButtonSize,
  { paddingVertical: number; paddingHorizontal: number }
> = {
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 14 },
  lg: { paddingVertical: 12, paddingHorizontal: 16 },
};

/**
 * A flexible button component with multiple visual variants and states.
 *
 * Supports loading states, disabled states, custom content, and adornments.
 * Automatically handles theme colors and accessibility.
 *
 * @param props - Button component props
 * @returns Rendered button component
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button label="Submit" onPress={() => console.log('pressed')} />
 *
 * // Loading button
 * <Button label="Saving..." loading variant="primary" />
 *
 * // Button with icon
 * <Button
 *   label="Next"
 *   variant="primary"
 *   endAdornment={<Icon name="arrow-right" />}
 * />
 * ```
 */
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
    ...AppFonts.button,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  adornment: {
    alignItems: "center",
    justifyContent: "center",
  },
});
