import { Question } from "@task-types/ActivityConfig";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { getBorderStyle } from "@utils/borderStyleHelper";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TemperatureQuestionProps {
  question: Question;
  value: string | null;
  onChange: (value: string) => void;
  displayProperties: Record<string, any>;
  errors: string[];
}

export const TemperatureQuestion: React.FC<TemperatureQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const [temperature, setTemperature] = useState("");
  const [unitType, setUnitType] = useState<"celsius" | "fahrenheit">("celsius");

  // Parse saved answer (format: "37.5 celsius" or "99.5 fahrenheit")
  useEffect(() => {
    if (value) {
      const parts = value.split(" ");
      const temp = parts[0] || "";
      const unit = parts[1]?.toLowerCase() || "celsius";
      setTemperature(temp);
      setUnitType(unit === "fahrenheit" ? "fahrenheit" : "celsius");
    }
  }, [value]);

  // Get display properties
  const othersStyle = displayProperties?.others || {};
  const unitTypeConfig = othersStyle.unitType || "celsius"; // "celsius", "fahrenheit", or "both"
  const showBothUnits = unitTypeConfig === "both";
  const fieldDisplayStyle = othersStyle.fieldDisplayStyle || "line";

  const handleTemperatureChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");

    // Auto-format decimal: if 3 chars, add decimal after 2nd char
    let formatted = numericText;
    if (numericText.length === 3) {
      formatted = `${numericText.substring(0, 2)}.${numericText.substring(2)}`;
    } else if (numericText.length >= 4) {
      formatted = `${numericText.substring(0, 3)}.${numericText.substring(3, 4)}`;
    }

    setTemperature(formatted);
    updateAnswer(formatted, unitType);
  };

  const handleUnitChange = (newUnit: "celsius" | "fahrenheit") => {
    setUnitType(newUnit);
    updateAnswer(temperature, newUnit);
  };

  const updateAnswer = (temp: string, unit: "celsius" | "fahrenheit") => {
    if (temp) {
      onChange(`${temp} ${unit}`);
    } else {
      onChange("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            getBorderStyle(fieldDisplayStyle, styles as any) as any,
            errors.length > 0 && styles.inputError,
          ]}
          value={temperature}
          onChangeText={handleTemperatureChange}
          keyboardType="numeric"
          maxLength={5}
          placeholder="---"
          testID={`temperature-input-${question.id}`}
        />
        <View style={styles.unitContainer}>
          {showBothUnits ? (
            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unitType === "celsius" && styles.unitButtonSelected,
                ]}
                onPress={() => handleUnitChange("celsius")}
                testID={`temperature-unit-celsius-${question.id}`}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unitType === "celsius" && styles.unitButtonTextSelected,
                  ]}
                >
                  °C
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unitType === "fahrenheit" && styles.unitButtonSelected,
                ]}
                onPress={() => handleUnitChange("fahrenheit")}
                testID={`temperature-unit-fahrenheit-${question.id}`}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unitType === "fahrenheit" && styles.unitButtonTextSelected,
                  ]}
                >
                  °F
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.unitText}>
              {unitTypeConfig === "fahrenheit" ? "°F" : "°C"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    color: AppColors.gray,
    textAlign: "center",
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderGray,
    backgroundColor: "transparent",
  },
  rectangleBorder: {
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 4,
    backgroundColor: AppColors.powderGray,
  },
  ovalBorder: {
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 20,
    backgroundColor: AppColors.powderGray,
  },
  inputError: {
    borderColor: AppColors.errorRed,
  },
  unitContainer: {
    marginLeft: 12,
  },
  unitText: {
    ...AppFonts.bodyBold,
    color: AppColors.gray,
  },
  unitButtons: {
    flexDirection: "column",
  },
  unitButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    backgroundColor: AppColors.powderGray,
  },
  unitButtonSelected: {
    backgroundColor: AppColors.CIBlue,
    borderColor: AppColors.CIBlue,
  },
  unitButtonText: {
    ...AppFonts.label,
    color: AppColors.darkGray,
  },
  unitButtonTextSelected: {
    color: AppColors.white,
  },
});
