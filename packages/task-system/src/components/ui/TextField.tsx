/**
 * TextField component for text input with labels and validation states.
 *
 * Provides a themed text input with optional label, helper text, and error states.
 * Automatically handles theme colors and accessibility.
 *
 * @module TextField
 */

import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@components/ThemedText";
import { useThemeColor } from "@hooks/useThemeColor";

/**
 * Props for the TextField component
 */
export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  /** Optional label text displayed above the input */
  label?: string;
  /** Optional helper text displayed below the input */
  helperText?: string;
  /** Optional error text displayed below the input (overrides helperText) */
  errorText?: string;
  /** Additional styles for the container View */
  containerStyle?: StyleProp<ViewStyle>;
  /** Additional styles for the TextInput */
  inputStyle?: TextInputProps["style"];
  /** Test identifier for testing frameworks */
  testID?: string;
}

/**
 * A customizable text input field component with optional label and helper/error text.
 *
 * Supports themed colors, validation states, and accessibility features.
 * Error text takes precedence over helper text when both are provided.
 *
 * @param props - TextField component props
 * @returns Rendered text field with optional label and message
 *
 * @example
 * ```tsx
 * // Basic text field
 * <TextField label="Email" placeholder="Enter your email" />
 *
 * // With helper text
 * <TextField
 *   label="Password"
 *   helperText="Must be at least 8 characters"
 *   secureTextEntry
 * />
 *
 * // With error
 * <TextField
 *   label="Username"
 *   errorText="Username is required"
 * />
 * ```
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  errorText,
  containerStyle,
  inputStyle,
  testID,
  editable = true,
  ...inputProps
}) => {
  const textColor = useThemeColor({}, "text");
  const background = useThemeColor({}, "background");
  const borderBase = useThemeColor({}, "icon");
  const tint = useThemeColor({}, "tint");

  const borderColor = errorText ? "#d32f2f" : borderBase + "55";

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
      <TextInput
        {...inputProps}
        editable={editable}
        accessibilityLabel={inputProps.accessibilityLabel ?? label}
        testID={testID ? `${testID}-input` : undefined}
        placeholderTextColor={borderBase}
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: background,
            borderColor,
          },
          !editable ? styles.inputDisabled : null,
          inputStyle,
        ]}
      />
      {errorText ? (
        <ThemedText style={[styles.message, { color: "#d32f2f" }]}>
          {errorText}
        </ThemedText>
      ) : helperText ? (
        <ThemedText style={[styles.message, { color: tint }]}>
          {helperText}
        </ThemedText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  message: {
    fontSize: 12,
  },
});
