import { useTranslatedText } from "@hooks/useTranslatedText";
import React from "react";
import { StyleSheet, Text, View, StyleProp, ViewStyle } from "react-native";
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
 * Reusable component for displaying unit text (e.g., "kg", "mmHg", "°C")
 * Automatically translates unit text if translation key is provided
 *
 * @param unit - The unit text to display
 * @param fontSize - The font size of the unit text (default: from AppFonts.label)
 * @param fontWeight - The font weight of the unit text (default: from AppFonts.label)
 * @param color - The color of the unit text (default: from AppFonts.label)
 * @param style - Additional styles to apply to the container
 * @returns A themed unit text component with the provided unit text
 */
export const UnitText: React.FC<UnitTextProps> = ({
  unit,
  fontSize = FontSizes.sm,
  fontWeight = "600",
  color = AppFonts.label.color,
  style,
}) => {
  const { translatedText } = useTranslatedText(unit);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize, fontWeight, color }]}>
        {translatedText || unit}
      </Text>
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
