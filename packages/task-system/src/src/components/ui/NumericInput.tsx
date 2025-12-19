import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  borderStyle?: "line" | "rectangle" | "oval";
  error?: boolean;
  testID?: string;
  style?: any;
}

/**
 * Reusable numeric input component with configurable border styles
 * Used for clinical measurements like blood pressure, temperature, etc.
 */
export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  placeholder = "---",
  maxLength = 3,
  borderStyle = "line",
  error = false,
  testID,
  style,
}) => {
  const getBorderStyle = () => {
    switch (borderStyle) {
      case "oval":
        return styles.ovalBorder;
      case "rectangle":
        return styles.rectangleBorder;
      default:
        return styles.lineBorder;
    }
  };

  return (
    <View style={style}>
      <TextInput
        style={[styles.input, getBorderStyle(), error && styles.inputError]}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        maxLength={maxLength}
        placeholder={placeholder}
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    color: "#2f3542",
    textAlign: "center",
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
    backgroundColor: "transparent",
  },
  rectangleBorder: {
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 4,
    backgroundColor: "#f8f9fa",
  },
  ovalBorder: {
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
});
