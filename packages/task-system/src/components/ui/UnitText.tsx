import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslatedText } from "@hooks/useTranslatedText";

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
  style?: any;
}

/**
 * Reusable component for displaying unit text (e.g., "kg", "mmHg", "°C")
 * Automatically translates unit text if translation key is provided
 */
export const UnitText: React.FC<UnitTextProps> = ({
  unit,
  fontSize = 14,
  fontWeight = "600",
  color = "#57606f",
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
    fontSize: 14,
    fontWeight: "600",
    color: "#57606f",
  },
});
