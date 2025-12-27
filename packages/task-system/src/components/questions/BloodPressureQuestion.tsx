import React, { useEffect, useState } from "react";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { Question } from "@task-types/ActivityConfig";

interface BloodPressureQuestionProps {
  question: Question;
  value: string | null;
  onChange: (value: string) => void;
  displayProperties: Record<string, any>;
  errors: string[];
}

const MMHG = "mmHg";

export const BloodPressureQuestion: React.FC<BloodPressureQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const [systolicValue, setSystolicValue] = useState("");
  const [diastolicValue, setDiastolicValue] = useState("");

  // Parse saved answer (format: "120/80" or "120/80 mmHg")
  useEffect(() => {
    if (value) {
      const parts = value.split(" ")[0].split("/");
      setSystolicValue(parts[0] || "");
      setDiastolicValue(parts[1] || "");
    }
  }, [value]);

  // Get display properties
  const bloodPressureStyle = displayProperties?.bloodPressure || {};
  const unitText = bloodPressureStyle?.uniti18nKey || MMHG;
  const systolicLabel = bloodPressureStyle?.leftLabeli18nKey || "Systolic";
  const diastolicLabel = bloodPressureStyle?.rightLabeli18nKey || "Diastolic";

  const { translatedText: translatedUnit } = useTranslatedText(unitText);
  const { translatedText: translatedSystolicLabel } =
    useTranslatedText(systolicLabel);
  const { translatedText: translatedDiastolicLabel } =
    useTranslatedText(diastolicLabel);

  const displayType = bloodPressureStyle?.displayType || "line";

  const handleSystolicChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 3) {
      setSystolicValue(numericText);
      updateAnswer(numericText, diastolicValue);
    }
  };

  const handleDiastolicChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 3) {
      setDiastolicValue(numericText);
      updateAnswer(systolicValue, numericText);
    }
  };

  const updateAnswer = (systolic: string, diastolic: string) => {
    if (systolic && diastolic) {
      onChange(`${systolic}/${diastolic} ${translatedUnit || MMHG}`);
    } else if (systolic || diastolic) {
      onChange(`${systolic}/${diastolic}`);
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
      <View style={styles.labelContainer}>
        <View style={styles.labelRow}>
          <View style={styles.labelColumn}>
            <Text style={styles.labelText}>{translatedSystolicLabel}</Text>
          </View>
          <View style={styles.labelColumn}>
            <Text style={styles.labelText}>{translatedDiastolicLabel}</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              getBorderStyle(),
              errors.length > 0 && styles.inputError,
            ]}
            value={systolicValue}
            onChangeText={handleSystolicChange}
            keyboardType="numeric"
            maxLength={3}
            placeholder="---"
            testID={`blood-pressure-systolic-${question.id}`}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            style={[
              styles.input,
              getBorderStyle(),
              errors.length > 0 && styles.inputError,
            ]}
            value={diastolicValue}
            onChangeText={handleDiastolicChange}
            keyboardType="numeric"
            maxLength={3}
            placeholder="---"
            testID={`blood-pressure-diastolic-${question.id}`}
          />
          <View style={styles.unitContainer}>
            <Text style={styles.unitText}>{translatedUnit || MMHG}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  labelContainer: {
    flexDirection: "column",
  },
  labelRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 8,
  },
  labelColumn: {
    width: "50%",
    paddingRight: 12,
  },
  labelText: {
    ...AppFonts.label,
    color: "AppColors.gray",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
  separator: {
    ...AppFonts.subheading,
    color: "AppColors.gray",
    marginHorizontal: 8,
  },
  unitContainer: {
    marginLeft: 8,
  },
  unitText: {
    ...AppFonts.label,
    color: "AppColors.darkGray",
  },
});
