import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { getBorderStyle } from "@utils/platform/borderStyleHelper";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  borderStyle?: "line" | "rectangle" | "oval";
  error?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable numeric input component with configurable border styles
 * Used for clinical measurements like blood pressure, temperature, etc.
 */
/**
 * A customizable numeric input component for capturing numeric values.
 *
 * @param value - The current input value
 * @param onChange - Callback function when value changes
 * @param placeholder - Placeholder text when input is empty (default: "---")
 * @param maxLength - Maximum number of characters allowed (default: 3)
 * @param borderStyle - Visual style of the input border: "line", "rectangle", or "oval" (default: "line")
 * @param error - Whether to show error styling (default: false)
 * @param testID - Test identifier for testing frameworks
 * @param style - Additional style properties to apply to the container
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
  return (
    <View style={style}>
      <TextInput
        style={[
          styles.input,
          getBorderStyle(borderStyle, styles),
          error && styles.inputError,
        ]}
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
    ...AppFonts.body,
    color: AppColors.gray,
    textAlign: "center",
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lineBorder: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: AppColors.borderGray,
    borderBottomColor: AppColors.borderGray,
    borderRadius: 0,
    backgroundColor: AppColors.powderGray,
  },
  rectangleBorder: {
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 4,
    backgroundColor: AppColors.powderGray,
  },
  ovalBorder: {
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 20,
    backgroundColor: AppColors.powderGray,
  },
  inputError: {
    borderColor: AppColors.errorRed,
  },
});
