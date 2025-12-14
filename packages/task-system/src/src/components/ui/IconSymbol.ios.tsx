// NOTE: This package must be embeddable in host apps that may not include `expo-symbols`.
// We intentionally avoid importing `expo-symbols` at runtime on iOS and use the same
// MaterialIcons-based fallback as other platforms.
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  // `weight` kept for API compatibility; ignored in the fallback implementation.
  weight?: unknown;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}

/**
 * Keep this mapping in sync with `IconSymbol.tsx`.
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
} as const satisfies IconMapping;
