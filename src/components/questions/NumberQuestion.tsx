import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { Question } from "../../types/ActivityConfig";
import { useTranslatedText } from "../../hooks/useTranslatedText";

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
  const unit = displayProperties.uniti18nKey || "";
  const placeholderText = question.friendlyName || "Enter a number";
  const { translatedText: placeholder } = useTranslatedText(placeholderText);

  // Handle numeric scale (1-10, etc.)
  const validations = question.validations || [];
  const minValidation = validations.find((v) => v.type === "min");
  const maxValidation = validations.find((v) => v.type === "max");
  const min = minValidation?.value ? parseInt(minValidation.value, 10) : undefined;
  const max = maxValidation?.value ? parseInt(maxValidation.value, 10) : undefined;

  // If it's a numeric scale, render as slider
  if ((question.type === "numericScale" || question.type?.toLowerCase() === "numericscale") && min !== undefined && max !== undefined) {
    const currentValue = value ? (typeof value === "string" ? parseInt(value, 10) : value) : min;
    const initialValue = !isNaN(currentValue) && currentValue >= min && currentValue <= max ? currentValue : min;
    const [sliderValue, setSliderValue] = useState<number>(initialValue);

    // Sync slider value with prop value
    useEffect(() => {
      const newValue = value ? (typeof value === "string" ? parseInt(value, 10) : value) : min;
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        setSliderValue(newValue);
      }
    }, [value, min, max]);

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
            onValueChange={(newValue) => {
              const intValue = Math.round(newValue);
              setSliderValue(intValue);
              console.log("🔢 [NumberQuestion] Slider value changed", {
                questionId: question.id,
                value: intValue,
                scaleRange: `${min}-${max}`,
              });
              onChange(intValue.toString());
            }}
            minimumTrackTintColor="#3498db"
            maximumTrackTintColor="#dfe4ea"
            thumbTintColor="#3498db"
          />
        </View>
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>
    );
  }

  // Regular number input
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            errors.length > 0 && styles.inputError,
          ]}
          value={value?.toString() || ""}
          onChangeText={(text) => {
            const numericValue = !isNaN(Number(text)) ? Number(text) : null;
            console.log("🔢 [NumberQuestion] Value changed", {
              questionId: question.id,
              value: text,
              numericValue,
              isValidNumber: numericValue !== null,
            });
            onChange(text);
          }}
          placeholder={placeholder}
          keyboardType="numeric"
        />
        {unit && <Text style={styles.unitText}>{unit}</Text>}
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
    fontSize: 16,
    color: "#2f3542",
    minHeight: 44,
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  unitText: {
    marginLeft: 8,
    fontSize: 14,
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
    fontSize: 14,
    color: "#57606f",
    fontWeight: "500",
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3498db",
    minWidth: 50,
    textAlign: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

