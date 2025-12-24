"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ThemedText_1 = require("@/components/ThemedText");
const useThemeColor_1 = require("@/hooks/useThemeColor");
const sizeStyles = {
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 14 },
  lg: { paddingVertical: 12, paddingHorizontal: 16 },
};
const Button = ({
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
  const tint = (0, useThemeColor_1.useThemeColor)({}, "tint");
  const background = (0, useThemeColor_1.useThemeColor)({}, "background");
  const text = (0, useThemeColor_1.useThemeColor)({}, "text");
  const icon = (0, useThemeColor_1.useThemeColor)({}, "icon");
  const isDisabled = disabled || loading;
  const resolvedA11yLabel =
    accessibilityLabel !== null && accessibilityLabel !== void 0
      ? accessibilityLabel
      : typeof label === "string"
        ? label
        : undefined;
  const baseContainer = {
    ...sizeStyles[size],
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    opacity: isDisabled ? 0.6 : 1,
  };
  const variantContainer =
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
  const labelColor =
    variant === "primary" ? background : variant === "secondary" ? text : tint;
  return (0, jsx_runtime_1.jsx)(react_native_1.Pressable, {
    testID: testID,
    accessibilityRole: "button",
    accessibilityLabel: resolvedA11yLabel,
    accessibilityState: { disabled: isDisabled, busy: loading },
    disabled: isDisabled,
    onPress: onPress,
    style: ({ pressed }) => [
      baseContainer,
      variantContainer,
      pressed && !isDisabled ? styles.pressed : null,
      style,
    ],
    children: loading
      ? (0, jsx_runtime_1.jsx)(react_native_1.ActivityIndicator, {
          testID: testID ? `${testID}-spinner` : undefined,
          color: labelColor,
        })
      : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, {
          children: [
            startAdornment
              ? (0, jsx_runtime_1.jsx)(react_native_1.View, {
                  style: styles.adornment,
                  children: startAdornment,
                })
              : null,
            children
              ? children
              : (0, jsx_runtime_1.jsx)(ThemedText_1.ThemedText, {
                  style: [styles.label, { color: labelColor }],
                  children: label !== null && label !== void 0 ? label : "",
                }),
            endAdornment
              ? (0, jsx_runtime_1.jsx)(react_native_1.View, {
                  style: styles.adornment,
                  children: endAdornment,
                })
              : null,
          ],
        }),
  });
};
exports.Button = Button;
const styles = react_native_1.StyleSheet.create({
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
//# sourceMappingURL=Button.js.map
