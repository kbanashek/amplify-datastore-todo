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

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps["style"];
  testID?: string;
}

/**
 * A customizable text input field component with optional label and helper/error text.
 *
 * @param label - Optional label text displayed above the input
 * @param helperText - Optional helper text displayed below the input
 * @param errorText - Optional error text displayed below the input (takes precedence over helperText)
 * @param containerStyle - Additional styles for the container View
 * @param inputStyle - Additional styles for the TextInput
 * @param testID - Test identifier for the component
 * @param editable - Whether the text input is editable (defaults to true)
 * @param inputProps - Additional props passed to the TextInput component
 *
 * @returns A styled text field component with optional label and helper/error text
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
