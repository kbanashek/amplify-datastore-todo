"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ThemedView_1 = require("@/components/ThemedView");
const useThemeColor_1 = require("@/hooks/useThemeColor");
const Card = ({ children, style, testID }) => {
  const borderColor = (0, useThemeColor_1.useThemeColor)({}, "icon");
  return (0, jsx_runtime_1.jsx)(ThemedView_1.ThemedView, {
    testID: testID,
    style: [styles.container, { borderColor: borderColor + "33" }, style],
    children: children,
  });
};
exports.Card = Card;
const styles = react_native_1.StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
});
//# sourceMappingURL=Card.js.map
