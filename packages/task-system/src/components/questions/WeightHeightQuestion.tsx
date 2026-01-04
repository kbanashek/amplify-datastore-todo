/**
 * WeightHeightQuestion component module.
 *
 * @module WeightHeightQuestion
 */

import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { Question } from "@task-types/ActivityConfig";
import { getBorderStyle } from "@utils/borderStyleHelper";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Compound answer format for weight/height questions.
 * Used when a question requires both a main and secondary value (e.g., feet + inches).
 */
interface CompoundAnswer {
  /** Map of unit type to value (e.g., { "ft": "5", "in": "10" }) */
  value: { [key: string]: string };
  /** Type of compound unit (e.g., "feet-inches") */
  type: string;
}

/**
 * Configuration for field display properties in weight/height questions.
 */
interface FieldDisplayConfig {
  /** Type of field: "weight" or "height" */
  fieldType?: string;
  /** Unit type: "kg", "lb", "cm", "in", or "both" */
  unitType?: string;
  /** Compound unit type for multi-value inputs (e.g., "weight-height") */
  compoundUnitType?: string;
  /** Display style for field borders: "line", "rectangle", or "oval" */
  fieldDisplayStyle?: string;
}

/**
 * Props for the WeightHeightQuestion component
 */
interface WeightHeightQuestionProps {
  question: Question;
  value: string | CompoundAnswer | null;
  onChange: (value: string | CompoundAnswer) => void;
  displayProperties: { [key: string]: unknown };
  errors: string[];
}

/**
 * Type guard to check if an unknown value is a valid FieldDisplayConfig
 */
function isFieldDisplayConfig(value: unknown): value is FieldDisplayConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as { [key: string]: unknown };
  return (
    (obj.fieldType === undefined || typeof obj.fieldType === "string") &&
    (obj.unitType === undefined || typeof obj.unitType === "string") &&
    (obj.compoundUnitType === undefined ||
      typeof obj.compoundUnitType === "string") &&
    (obj.fieldDisplayStyle === undefined ||
      typeof obj.fieldDisplayStyle === "string")
  );
}

/**
 * WeightHeightQuestion component.
 *
 * @param props - Component props
 * @returns Rendered WeightHeightQuestion component
 */
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

  // Safely extract and validate display properties
  const othersValue = displayProperties?.others;
  const othersStyle: FieldDisplayConfig = isFieldDisplayConfig(othersValue)
    ? othersValue
    : {};

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
      const answerObj: CompoundAnswer = {
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

  const fieldDisplayStyle = othersStyle.fieldDisplayStyle || "line";

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            getBorderStyle(fieldDisplayStyle, styles),
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
                getBorderStyle(fieldDisplayStyle, styles),
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
    ...AppFonts.body,
    color: AppColors.darkGray,
    textAlign: "center",
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lineBorder: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: AppColors.borderGray,
    borderBottomColor: AppColors.borderGray,
    borderRadius: 0,
    backgroundColor: AppColors.powderGray,
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
    color: AppColors.darkGray,
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
    backgroundColor: AppColors.lightGray,
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
