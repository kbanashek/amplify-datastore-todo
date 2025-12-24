"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextField = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ThemedText_1 = require("@/components/ThemedText");
const useThemeColor_1 = require("@/hooks/useThemeColor");
const TextField = ({
  label,
  helperText,
  errorText,
  containerStyle,
  inputStyle,
  testID,
  editable = true,
  ...inputProps
}) => {
  const _a = undefined;
  const textColor = (0, useThemeColor_1.useThemeColor)({}, "text");
  const background = (0, useThemeColor_1.useThemeColor)({}, "background");
  const borderBase = (0, useThemeColor_1.useThemeColor)({}, "icon");
  const tint = (0, useThemeColor_1.useThemeColor)({}, "tint");
  const borderColor = errorText ? "#d32f2f" : borderBase + "55";
  return (0, jsx_runtime_1.jsxs)(react_native_1.View, {
    style: [styles.container, containerStyle],
    testID: testID,
    children: [
      label
        ? (0, jsx_runtime_1.jsx)(ThemedText_1.ThemedText, {
            style: styles.label,
            children: label,
          })
        : null,
      (0, jsx_runtime_1.jsx)(react_native_1.TextInput, {
        ...inputProps,
        editable: editable,
        accessibilityLabel:
          (_a = inputProps.accessibilityLabel) !== null && _a !== void 0
            ? _a
            : label,
        testID: testID ? `${testID}-input` : undefined,
        placeholderTextColor: borderBase,
        style: [
          styles.input,
          {
            color: textColor,
            backgroundColor: background,
            borderColor,
          },
          !editable ? styles.inputDisabled : null,
          inputStyle,
        ],
      }),
      errorText
        ? (0, jsx_runtime_1.jsx)(ThemedText_1.ThemedText, {
            style: [styles.message, { color: "#d32f2f" }],
            children: errorText,
          })
        : helperText
          ? (0, jsx_runtime_1.jsx)(ThemedText_1.ThemedText, {
              style: [styles.message, { color: tint }],
              children: helperText,
            })
          : null,
    ],
  });
};
exports.TextField = TextField;
const styles = react_native_1.StyleSheet.create({
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
//# sourceMappingURL=TextField.js.map
