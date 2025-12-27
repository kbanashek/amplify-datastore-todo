import { AppFonts } from "@constants/AppFonts";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { Question } from "@task-types/ActivityConfig";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ClinicalDynamicInputQuestionProps {
  question: Question;
  value: string | Record<string, any> | null;
  onChange: (value: string | Record<string, any>) => void;
  displayProperties: Record<string, any>;
  errors: string[];
}

/**
 * A component for rendering a clinical dynamic input question with various display options.
 * Supports different border styles (line, oval, rectangle) and unit display.
 * Handles numeric input with validation and formatting.
 *
 * @param question - The question configuration object
 * @param value - The current value (can be string or object with text/unitType)
 * @param onChange - Callback function when value changes
 * @param displayProperties - Configuration for visual display and behavior
 * @param errors - Array of error messages
 */
export const ClinicalDynamicInputQuestion: React.FC<
  ClinicalDynamicInputQuestionProps
> = ({ question, value, onChange, displayProperties, errors }) => {
  const [dynamicValue, setDynamicValue] = useState("");

  // Parse saved answer - can be string or object with text/unitType
  useEffect(() => {
    if (value) {
      if (typeof value === "string") {
        setDynamicValue(value);
      } else if (value.text) {
        setDynamicValue(value.text);
      }
    }
  }, [value]);

  // Get display properties
  const othersStyle = displayProperties?.others || {};
  const clinicalStyle = displayProperties?.bloodPressure || {};
  const unitText = displayProperties?.unitText || "";
  const fieldLabelText = displayProperties?.fieldLabelText || "";
  const type = displayProperties?.type || "pulse";
  const maxLength = type === "pulse" ? 3 : 2;
  const displayType = clinicalStyle?.displayType || "line";

  const { translatedText: translatedUnit } = useTranslatedText(unitText);
  const { translatedText: translatedLabel } = useTranslatedText(fieldLabelText);

  const handleValueChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= maxLength) {
      setDynamicValue(numericText);
      updateAnswer(numericText);
    }
  };

  const updateAnswer = (text: string) => {
    if (text) {
      const answerObj = {
        text: text,
        unitType: translatedUnit || unitText,
      };
      onChange(answerObj);
    } else {
      onChange("");
    }
  };

  const getBorderStyle = () => {
    switch (displayType) {
      case "oval":
        return styles.ovalBorder;
      case "rectangle":
        return styles.rectangleBorder;
      default:
        return styles.lineBorder;
    }
  };

  return (
    <View style={styles.container}>
      {translatedLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{translatedLabel}</Text>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            getBorderStyle(),
            errors.length > 0 && styles.inputError,
          ]}
          value={dynamicValue}
          onChangeText={handleValueChange}
          keyboardType="numeric"
          maxLength={maxLength}
          placeholder="---"
          testID={`clinical-dynamic-input-${question.id}`}
        />
        {translatedUnit && (
          <View style={styles.unitContainer}>
            <Text style={styles.unitText}>{translatedUnit}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  labelContainer: {
    marginBottom: 8,
  },
  labelText: {
    ...AppFonts.label,
    color: "AppColors.gray",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    ...AppFonts.body,
    color: "AppColors.gray",
    textAlign: "center",
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "AppColors.borderGray",
    backgroundColor: "transparent",
  },
  rectangleBorder: {
    borderWidth: 1,
    borderColor: "AppColors.borderGray",
    borderRadius: 4,
    backgroundColor: "AppColors.powderGray",
  },
  ovalBorder: {
    borderWidth: 1,
    borderColor: "AppColors.borderGray",
    borderRadius: 20,
    backgroundColor: "AppColors.powderGray",
  },
  inputError: {
    borderColor: "AppColors.errorRed",
  },
  unitContainer: {
    marginLeft: 12,
  },
  unitText: {
    ...AppFonts.label,
    color: "AppColors.darkGray",
  },
});
