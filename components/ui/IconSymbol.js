"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconSymbol = IconSymbol;
const jsx_runtime_1 = require("react/jsx-runtime");
// Fallback for using MaterialIcons on Android and web.
const MaterialIcons_1 = __importDefault(
  require("@expo/vector-icons/MaterialIcons")
);
/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "line.3.horizontal": "menu",
  "xmark.circle.fill": "cancel",
  "checkmark.circle.fill": "check-circle",
  "doc.text.fill": "description",
  "chart.bar.fill": "bar-chart",
  "questionmark.circle.fill": "help",
  "questionmark.circle": "help-outline",
  "text.bubble.fill": "chat-bubble",
  "list.bullet.rectangle.portrait.fill": "list",
  "list.clipboard": "assignment",
  "clock.fill": "schedule",
  clock: "schedule",
  pills: "medication",
  bell: "notifications",
  calendar: "calendar-today",
  repeat: "repeat",
  "doc.text": "description",
};
/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
function IconSymbol({ name, size = 24, color, style }) {
  return (0, jsx_runtime_1.jsx)(MaterialIcons_1.default, {
    color: color,
    size: size,
    name: MAPPING[name],
    style: style,
  });
}
//# sourceMappingURL=IconSymbol.js.map
