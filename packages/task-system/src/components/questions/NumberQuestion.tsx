import Slider from "@react-native-community/slider";
import { AppFonts } from "@constants/AppFonts";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { Question } from "@task-types/ActivityConfig";
import {
  QuestionType,
  ValidationType,
} from "@task-types/activity-config-enums";
import { getServiceLogger } from "@utils/serviceLogger";
import { getUnitDisplayLabel } from "@utils/unitLabel";

const logger = getServiceLogger("NumberQuestion");

interface NumberQuestionProps {
  question: Question;
  value: string | number;
  onChange: (value: string) => void;
  displayProperties: Record<string, string>;
  errors: string[];
}

export const NumberQuestion: React.FC<NumberQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const unitRaw = displayProperties.uniti18nKey || "";
  const unitBaseLabel = getUnitDisplayLabel(unitRaw);
  const placeholderText = question.friendlyName || "Enter a number";
  const { translatedText: placeholder } = useTranslatedText(placeholderText);
  const { translatedText: unitLabel } = useTranslatedText(unitBaseLabel);

  // Handle numeric scale (1-10, etc.)
  const validations = question.validations || [];
  const minValidation = validations.find(v => v.type === ValidationType.MIN);
  const maxValidation = validations.find(v => v.type === ValidationType.MAX);
  const min = minValidation?.value
    ? parseInt(minValidation.value, 10)
    : undefined;
  const max = maxValidation?.value
    ? parseInt(maxValidation.value, 10)
    : undefined;

  // Check if this is a numeric scale slider
  const isNumericScale =
    (question.type === QuestionType.NUMERIC_SCALE ||
      question.type?.toLowerCase() ===
        QuestionType.NUMERIC_SCALE.toLowerCase()) &&
    min !== undefined &&
    max !== undefined;

  // Calculate initial slider value (hooks must be called unconditionally)
  const currentValue =
    isNumericScale && value
      ? typeof value === "string"
        ? parseInt(value, 10)
        : value
      : (min ?? 0);
  const initialValue =
    isNumericScale &&
    !isNaN(currentValue) &&
    currentValue >= min! &&
    currentValue <= max!
      ? currentValue
      : (min ?? 0);

  // Hooks must be called unconditionally - always call them
  const [sliderValue, setSliderValue] = useState<number>(initialValue);

  // Sync slider value with prop value (only update if it's a numeric scale)
  useEffect(() => {
    if (isNumericScale && min !== undefined && max !== undefined) {
      const newValue = value
        ? typeof value === "string"
          ? parseInt(value, 10)
          : value
        : min;
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        setSliderValue(newValue);
      }
    }
  }, [value, min, max, isNumericScale]);

  // If it's a numeric scale, render as slider
  if (isNumericScale) {
    return (
      <View style={styles.container}>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>{min}</Text>
            <Text style={styles.sliderValue}>{sliderValue}</Text>
            <Text style={styles.sliderLabel}>{max}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={1}
            value={sliderValue}
            onValueChange={newValue => {
              const intValue = Math.round(newValue);
              logger.debug(
                "Slider value changed",
                {
                  questionId: question.id,
                  value: intValue,
                  scaleRange: `${min}-${max}`,
                },
                undefined,
                "🔢"
              );
              onChange(intValue.toString());
            }}
            minimumTrackTintColor="#3498db"
            maximumTrackTintColor="#dfe4ea"
            thumbTintColor="#3498db"
          />
        </View>
        {unitLabel && <Text style={styles.unitText}>{unitLabel}</Text>}
      </View>
    );
  }

  // Regular number input
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.length > 0 && styles.inputError]}
          value={value?.toString() || ""}
          onChangeText={text => {
            const numericValue = !isNaN(Number(text)) ? Number(text) : null;
            logger.debug(
              "Value changed",
              {
                questionId: question.id,
                value: text,
                numericValue,
                isValidNumber: numericValue !== null,
              },
              undefined,
              "🔢"
            );
            onChange(text);
          }}
          placeholder={placeholder}
          keyboardType="numeric"
        />
        {unitLabel && <Text style={styles.unitText}>{unitLabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 8,
    padding: 12,
    ...AppFonts.body,
    color: "#2f3542",
    minHeight: 44,
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  unitText: {
    ...AppFonts.small,
    marginLeft: 8,
    color: "#57606f",
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sliderLabel: {
    ...AppFonts.label,
    color: "#57606f",
  },
  sliderValue: {
    ...AppFonts.heading,
    color: "#3498db",
    minWidth: 50,
    textAlign: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
