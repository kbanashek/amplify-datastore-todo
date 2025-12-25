// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "line.3.horizontal": "menu",
  xmark: "close",
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
  "video.fill": "videocam",
  "building.2.fill": "business",
} as IconMapping;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 *
 * @param name - The name of the icon from the MAPPING object
 * @param size - The size of the icon (default: 24)
 * @param color - The color of the icon
 * @param style - Additional text style properties
 * @param weight - Ignored in iOS implementation, kept for API compatibility
 * @returns A MaterialIcons component with the mapped icon name
 */
export const IconSymbol: React.FC<IconSymbolProps> = ({
  name,
  size = 24,
  color,
  style,
}) => {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
};
