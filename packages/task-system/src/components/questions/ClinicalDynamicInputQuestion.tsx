import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Question } from "@task-types/ActivityConfig";
import { useTranslatedText } from "@hooks/useTranslatedText";

interface ClinicalDynamicInputQuestionProps {
  question: Question;
  value: string | Record<string, any> | null;
  onChange: (value: string | Record<string, any>) => void;
  displayProperties: Record<string, any>;
  errors: string[];
}

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
    fontSize: 14,
    fontWeight: "500",
    color: "#2f3542",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    color: "#2f3542",
    textAlign: "center",
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
    backgroundColor: "transparent",
  },
  rectangleBorder: {
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 4,
    backgroundColor: "#f8f9fa",
  },
  ovalBorder: {
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  unitContainer: {
    marginLeft: 12,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#57606f",
  },
});
