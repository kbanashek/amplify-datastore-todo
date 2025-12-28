import { useTranslatedText } from "@hooks/useTranslatedText";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { AppFonts, FontSizes } from "@constants/AppFonts";

interface UnitTextProps {
  unit: string;
  fontSize?: number;
  fontWeight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable component for displaying unit text (e.g., "kg", "mmHg", "°C").
 * Automatically translates unit text if translation key is provided.
 *
 * @param props - Component props
 * @param props.unit - The unit text to display
 * @param props.fontSize - Optional font size override (default: from AppFonts.label)
 * @param props.fontWeight - Optional font weight override (default: from AppFonts.label)
 * @param props.color - Optional color override (default: from AppFonts.label)
 * @param props.style - Additional styles to apply to the container
 * @returns A themed unit text component with the provided unit text
 *
 * @example
 * ```tsx
 * <UnitText unit="kg" fontSize={16} fontWeight="bold" />
 * <UnitText unit="°C" color="#FF0000" />
 * ```
 */
export const UnitText: React.FC<UnitTextProps> = ({
  unit,
  fontSize,
  fontWeight,
  color,
  style,
}) => {
  const { translatedText } = useTranslatedText(unit);

  // Build style object only with provided overrides
  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    fontSize ? { fontSize } : undefined,
    fontWeight ? { fontWeight } : undefined,
    color ? { color } : undefined,
  ].filter(Boolean);

  return (
    <View style={[styles.container, style]}>
      <Text style={textStyle}>{translatedText || unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
  },
  text: {
    ...AppFonts.label,
  },
});
