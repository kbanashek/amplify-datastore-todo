/**
 * HorizontalVASQuestion component module.
 *
 * @module HorizontalVASQuestion
 */

import Slider from "@react-native-community/slider";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Question } from "@task-types/ActivityConfig";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { ValidationType } from "@task-types/activity-config-enums";

/**
 * Props for the HorizontalVASQuestion component
 */
interface HorizontalVASQuestionProps {
  question: Question;
  value: string | number | null;
  onChange: (value: string) => void;
  displayProperties: Record<string, any>;
  errors: string[];
}

/**
 * HorizontalVASQuestion component.
 *
 * @param props - Component props
 * @returns Rendered HorizontalVASQuestion component
 */
export const HorizontalVASQuestion: React.FC<HorizontalVASQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const othersStyle = displayProperties?.others || {};
  const scaleMin = othersStyle.scaleMin || 0;
  const scaleMax = othersStyle.scaleMax || 100;
  const scaleIncrements = othersStyle.scaleIncrements || 1;
  const lowerRangei18nKey = othersStyle.lowerRangei18nKey || "";
  const upperRangei18nKey = othersStyle.upperRangei18nKey || "";

  const { translatedText: lowerRangeText } =
    useTranslatedText(lowerRangei18nKey);
  const { translatedText: upperRangeText } =
    useTranslatedText(upperRangei18nKey);

  // Parse value to number
  const getNumericValue = (): number => {
    if (value === null || value === undefined) {
      return scaleMin;
    }
    if (typeof value === "number") {
      return Math.max(scaleMin, Math.min(scaleMax, value));
    }
    const parsed = parseFloat(value.toString());
    return isNaN(parsed)
      ? scaleMin
      : Math.max(scaleMin, Math.min(scaleMax, parsed));
  };

  const [sliderValue, setSliderValue] = useState<number>(getNumericValue());

  useEffect(() => {
    const newValue = getNumericValue();
    if (newValue !== sliderValue) {
      setSliderValue(newValue);
    }
  }, [value, scaleMin, scaleMax]);

  const handleSliderChange = (newValue: number) => {
    const roundedValue =
      Math.round(newValue / scaleIncrements) * scaleIncrements;
    const clampedValue = Math.max(scaleMin, Math.min(scaleMax, roundedValue));
    setSliderValue(clampedValue);
    onChange(clampedValue.toString());
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <View style={styles.labelsRow}>
          {lowerRangeText && (
            <Text style={styles.rangeLabel}>{lowerRangeText}</Text>
          )}
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{sliderValue}</Text>
          </View>
          {upperRangeText && (
            <Text style={styles.rangeLabel}>{upperRangeText}</Text>
          )}
        </View>
        <Slider
          style={styles.slider}
          minimumValue={scaleMin}
          maximumValue={scaleMax}
          step={scaleIncrements}
          value={sliderValue}
          onValueChange={handleSliderChange}
          minimumTrackTintColor="AppColors.CIBlue"
          maximumTrackTintColor="AppColors.borderGray"
          thumbTintColor="AppColors.CIBlue"
          testID={`horizontal-vas-slider-${question.id}`}
        />
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>{scaleMin}</Text>
          <Text style={styles.scaleLabel}>{scaleMax}</Text>
        </View>
      </View>
      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sliderContainer: {
    paddingVertical: 16,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rangeLabel: {
    ...AppFonts.label,
    color: "AppColors.darkGray",
    flex: 1,
  },
  valueContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  valueText: {
    ...AppFonts.heading,
    color: "AppColors.CIBlue",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scaleLabel: {
    ...AppFonts.caption,
    color: "AppColors.iconGray",
  },
  errorContainer: {
    marginTop: 8,
  },
  errorText: {
    ...AppFonts.label,
    color: "AppColors.errorRed",
  },
});
