"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const useThemeColor_1 = require("@/hooks/useThemeColor");
const LoadingSpinner = ({ size = "small", style, testID }) => {
  const color = (0, useThemeColor_1.useThemeColor)({}, "tint");
  return (0, jsx_runtime_1.jsx)(react_native_1.View, {
    style: style,
    testID: testID,
    children: (0, jsx_runtime_1.jsx)(react_native_1.ActivityIndicator, {
      testID: testID ? `${testID}-indicator` : undefined,
      size: size,
      color: color,
    }),
  });
};
exports.LoadingSpinner = LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map
