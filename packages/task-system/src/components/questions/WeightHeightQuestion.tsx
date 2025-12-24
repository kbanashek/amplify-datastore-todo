import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Question } from "@task-types/ActivityConfig";
import { useTranslatedText } from "@hooks/useTranslatedText";

interface WeightHeightQuestionProps {
  question: Question;
  value: string | Record<string, any> | null;
  onChange: (value: string | Record<string, any>) => void;
  displayProperties: Record<string, any>;
  errors: string[];
}

export const WeightHeightQuestion: React.FC<WeightHeightQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const [mainValue, setMainValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const [mainChecked, setMainChecked] = useState(true);
  const [secondaryChecked, setSecondaryChecked] = useState(false);

  // Parse saved answer
  useEffect(() => {
    if (value) {
      if (typeof value === "string") {
        const parts = value.split(" ");
        setMainValue(parts[0] || "");
        // Check unit type from second part
        const unit = parts[1]?.toLowerCase() || "";
        if (unit.includes("kg") || unit.includes("cm")) {
          setMainChecked(true);
          setSecondaryChecked(false);
        } else if (unit.includes("lb") || unit.includes("in")) {
          setMainChecked(false);
          setSecondaryChecked(true);
        }
      } else if (value.value) {
        // Compound value format
        const valueObj = value.value;
        setMainValue(valueObj.weight || valueObj.height || "");
        setSecondaryValue(
          valueObj.weightSecondary || valueObj.heightSecondary || ""
        );
      }
    }
  }, [value]);

  const othersStyle = displayProperties?.others || {};
  const fieldType = othersStyle.fieldType || "weight"; // "weight" or "height"
  const unitType = othersStyle.unitType || "kg"; // "kg", "lb", "cm", "in", or "both"
  const compoundUnitType = othersStyle.compoundUnitType || ""; // "weight-height" for compound
  const isCompound = !!compoundUnitType;
  const isBothTypes = unitType === "both";

  const getUnitTypes = () => {
    if (isCompound) {
      return fieldType === "weight" ? ["kg", "lb"] : ["cm", "in"];
    }
    if (isBothTypes) {
      return fieldType === "weight" ? ["kg", "lb"] : ["cm", "in"];
    }
    return [unitType];
  };

  const unitTypes = getUnitTypes();
  const maxMainLength = fieldType === "weight" ? 3 : 3;
  const maxSecondaryLength = fieldType === "height" ? 2 : 2;

  const handleMainValueChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");

    // Auto-format decimal for weight/height
    let formatted = numericText;
    if (numericText.length === 3 && !isCompound) {
      formatted = `${numericText.substring(0, 2)}.${numericText.substring(2)}`;
    } else if (numericText.length >= 4 && !isCompound) {
      formatted = `${numericText.substring(0, 3)}.${numericText.substring(3, 4)}`;
    }

    if (formatted.length <= maxMainLength + 1) {
      setMainValue(formatted);
      updateAnswer(formatted, secondaryValue);
    }
  };

  const handleSecondaryValueChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= maxSecondaryLength) {
      setSecondaryValue(numericText);
      updateAnswer(mainValue, numericText);
    }
  };

  const handleUnitChange = (index: number) => {
    if (index === 0) {
      setMainChecked(true);
      setSecondaryChecked(false);
    } else {
      setMainChecked(false);
      setSecondaryChecked(true);
    }
    updateAnswer(mainValue, secondaryValue);
  };

  const updateAnswer = (main: string, secondary: string) => {
    if (isCompound) {
      const answerObj: any = {
        value: {},
        type: compoundUnitType,
      };
      if (main) {
        answerObj.value[unitTypes[0]] = main;
      }
      if (secondary) {
        answerObj.value[unitTypes[1]] = secondary;
      }
      onChange(Object.keys(answerObj.value).length > 0 ? answerObj : "");
    } else {
      const selectedUnit = mainChecked
        ? unitTypes[0]
        : unitTypes[1] || unitTypes[0];
      if (main) {
        onChange(`${main} ${selectedUnit}`);
      } else {
        onChange("");
      }
    }
  };

  const getBorderStyle = () => {
    const displayStyle = othersStyle.fieldDisplayStyle || "line";
    switch (displayStyle) {
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
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            getBorderStyle(),
            errors.length > 0 && styles.inputError,
          ]}
          value={mainValue}
          onChangeText={handleMainValueChange}
          keyboardType="numeric"
          maxLength={maxMainLength + 1}
          placeholder="---"
          testID={`weight-height-main-${question.id}`}
        />
        <View style={styles.unitContainer}>
          {isBothTypes && !isCompound ? (
            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  mainChecked && styles.unitButtonSelected,
                ]}
                onPress={() => handleUnitChange(0)}
                testID={`weight-height-unit-0-${question.id}`}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    mainChecked && styles.unitButtonTextSelected,
                  ]}
                >
                  {unitTypes[0]}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  secondaryChecked && styles.unitButtonSelected,
                ]}
                onPress={() => handleUnitChange(1)}
                testID={`weight-height-unit-1-${question.id}`}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    secondaryChecked && styles.unitButtonTextSelected,
                  ]}
                >
                  {unitTypes[1]}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.unitText}>{unitTypes[0]}</Text>
          )}
        </View>
        {isCompound && (
          <>
            <TextInput
              style={[
                styles.input,
                getBorderStyle(),
                errors.length > 0 && styles.inputError,
              ]}
              value={secondaryValue}
              onChangeText={handleSecondaryValueChange}
              keyboardType="numeric"
              maxLength={maxSecondaryLength}
              placeholder="--"
              testID={`weight-height-secondary-${question.id}`}
            />
            <View style={styles.unitContainer}>
              <Text style={styles.unitText}>{unitTypes[1]}</Text>
            </View>
          </>
        )}
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
    fontSize: 16,
    fontWeight: "800",
    color: "#2f3542",
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
    borderColor: "#dfe4ea",
    backgroundColor: "#f8f9fa",
  },
  unitButtonSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#57606f",
  },
  unitButtonTextSelected: {
    color: "#ffffff",
  },
});
