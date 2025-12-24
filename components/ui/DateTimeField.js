"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeField = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const datetimepicker_1 = __importDefault(
  require("@react-native-community/datetimepicker")
);
const ThemedText_1 = require("@/components/ThemedText");
const useThemeColor_1 = require("@/hooks/useThemeColor");
const DateTimeField = ({
  mode,
  value,
  onChange,
  placeholder,
  format,
  disabled = false,
  error = false,
  testID,
  style,
}) => {
  const [showPicker, setShowPicker] = (0, react_1.useState)(false);
  const textColor = (0, useThemeColor_1.useThemeColor)({}, "text");
  const background = (0, useThemeColor_1.useThemeColor)({}, "background");
  const borderBase = (0, useThemeColor_1.useThemeColor)({}, "icon");
  const tint = (0, useThemeColor_1.useThemeColor)({}, "tint");
  const displayValue = (0, react_1.useMemo)(() => {
    if (!value)
      return placeholder !== null && placeholder !== void 0
        ? placeholder
        : mode === "datetime"
          ? "Select date/time"
          : mode === "time"
            ? "Select time"
            : "Select date";
    if (format) return format(value);
    if (mode === "time") {
      return value.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (mode === "datetime") {
      return value.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [format, mode, placeholder, value]);
  const borderColor = error ? "#d32f2f" : borderBase + "55";
  const handlePickerChange = (_event, date) => {
    if (react_native_1.Platform.OS === "android") {
      setShowPicker(false);
    }
    if (date) {
      onChange(date);
    }
  };
  return (0, jsx_runtime_1.jsxs)(react_native_1.View, {
    style: style,
    children: [
      (0, jsx_runtime_1.jsx)(react_native_1.Pressable, {
        testID: testID ? `${testID}-button` : undefined,
        accessibilityRole: "button",
        accessibilityState: { disabled },
        disabled: disabled,
        onPress: () => setShowPicker(true),
        style: ({ pressed }) => [
          styles.button,
          {
            backgroundColor: background,
            borderColor,
            opacity: disabled ? 0.7 : 1,
          },
          pressed && !disabled ? styles.pressed : null,
        ],
        children: (0, jsx_runtime_1.jsx)(ThemedText_1.ThemedText, {
          style: [styles.buttonText, { color: textColor }],
          children: displayValue,
        }),
      }),
      showPicker
        ? (0, jsx_runtime_1.jsx)(datetimepicker_1.default, {
            testID: testID ? `${testID}-picker` : undefined,
            value: value !== null && value !== void 0 ? value : new Date(),
            mode: mode,
            display:
              react_native_1.Platform.OS === "ios" ? "spinner" : "default",
            onChange: handlePickerChange,
          })
        : null,
      react_native_1.Platform.OS === "ios" && showPicker
        ? (0, jsx_runtime_1.jsx)(react_native_1.View, {
            style: styles.iosActions,
            children: (0, jsx_runtime_1.jsx)(react_native_1.Pressable, {
              testID: testID ? `${testID}-done` : undefined,
              accessibilityRole: "button",
              onPress: () => setShowPicker(false),
              style: ({ pressed }) => [
                styles.doneButton,
                { backgroundColor: tint },
                pressed ? styles.pressed : null,
              ],
              children: (0, jsx_runtime_1.jsx)(ThemedText_1.ThemedText, {
                style: styles.doneButtonText,
                children: "Done",
              }),
            }),
          })
        : null,
    ],
  });
};
exports.DateTimeField = DateTimeField;
const styles = react_native_1.StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  iosActions: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
//# sourceMappingURL=DateTimeField.js.map
