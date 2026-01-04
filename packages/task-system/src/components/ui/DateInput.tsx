/**
 * DateInput component for manual date entry (Lumiere-style).
 *
 * Provides separate inputs for day, month (picker), and year.
 * Validates date components and shows errors for invalid dates.
 *
 * @module DateInput
 */

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@components/ThemedText";
import { AppColors } from "@constants/AppColors";
import { useThemeColor } from "@hooks/useThemeColor";
import { useTaskTranslation } from "@translations/index";
import { isValidDate } from "@utils/dateTimeFormatting";
import { getFontStyle, FontWeights } from "@utils/fontUtils";

/**
 * Props for the DateInput component
 */
export interface DateInputProps {
  /** Current day value (1-31) */
  day: number | null;
  /** Current month index (0-11) */
  monthIndex: number | null;
  /** Current year value */
  year: number | null;
  /** Callback when date components change */
  onChange: (day: number, monthIndex: number, year: number) => void;
  /** Callback when validation error occurs */
  onError?: (error: string | null) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether to show error styling */
  error?: boolean;
  /** Test identifier for testing frameworks */
  testID?: string;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Font size for inputs */
  fontSize?: number;
}

/**
 * A component for manual date entry with separate day, month, and year inputs.
 *
 * Features:
 * - Manual text input for day and year
 * - Modal picker for month selection
 * - Real-time validation against valid dates
 * - Translated month names
 * - Error display for invalid dates
 *
 * @param props - DateInput component props
 * @returns Rendered date input component
 *
 * @example
 * ```tsx
 * <DateInput
 *   day={13}
 *   monthIndex={11}
 *   year={2024}
 *   onChange={(day, month, year) => {
 *     console.log(`Selected: ${day}/${month + 1}/${year}`);
 *   }}
 * />
 * ```
 */
export const DateInput: React.FC<DateInputProps> = ({
  day,
  monthIndex,
  year,
  onChange,
  onError,
  disabled = false,
  error: externalError = false,
  testID,
  style,
  fontSize = 16,
}) => {
  const { t } = useTaskTranslation();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");

  // Local state for input values
  const [dayText, setDayText] = useState(day?.toString() || "");
  const [yearText, setYearText] = useState(year?.toString() || "");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get translated month names
  const monthNames = t("dateTime.months", { returnObjects: true }) as string[];

  // Update local state when props change
  useEffect(() => {
    setDayText(day?.toString() || "");
  }, [day]);

  useEffect(() => {
    setYearText(year?.toString() || "");
  }, [year]);

  // Validate date whenever components change
  useEffect(() => {
    if (dayText && monthIndex !== null && yearText && yearText.length === 4) {
      const dayNum = parseInt(dayText, 10);
      const yearNum = parseInt(yearText, 10);

      if (!isValidDate(dayNum, monthIndex, yearNum)) {
        const error = t("dateTime.invalidDate");
        setValidationError(error);
        onError?.(error);
      } else {
        setValidationError(null);
        onError?.(null);
      }
    }
  }, [dayText, monthIndex, yearText, t, onError]);

  const handleDayChange = (text: string) => {
    // Only allow numbers
    const filtered = text.replace(/[^0-9]/g, "");
    setDayText(filtered);

    if (filtered && monthIndex !== null && yearText.length === 4) {
      const dayNum = parseInt(filtered, 10);
      const yearNum = parseInt(yearText, 10);

      if (dayNum >= 1 && dayNum <= 31) {
        onChange(dayNum, monthIndex, yearNum);
      }
    }
  };

  const handleYearChange = (text: string) => {
    // Only allow numbers, max 4 digits
    const filtered = text.replace(/[^0-9]/g, "").substring(0, 4);
    setYearText(filtered);

    if (filtered.length === 4 && dayText && monthIndex !== null) {
      const dayNum = parseInt(dayText, 10);
      const yearNum = parseInt(filtered, 10);

      if (dayNum >= 1 && dayNum <= 31 && yearNum >= 1900 && yearNum <= 2100) {
        onChange(dayNum, monthIndex, yearNum);
      }
    }
  };

  const handleMonthSelect = (index: number) => {
    setShowMonthPicker(false);

    if (dayText && yearText.length === 4) {
      const dayNum = parseInt(dayText, 10);
      const yearNum = parseInt(yearText, 10);

      onChange(dayNum, index, yearNum);
    }
  };

  const hasError = externalError || validationError !== null;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.inputRow}>
        {/* Year Input */}
        <View style={styles.inputWrapper}>
          <ThemedText style={[styles.label, { fontSize: fontSize - 2 }]}>
            {t("dateTime.year")}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: hasError
                  ? AppColors.legacy.danger
                  : borderColor + "55",
                fontSize,
              },
              disabled && styles.disabled,
            ]}
            value={yearText}
            onChangeText={handleYearChange}
            keyboardType="number-pad"
            maxLength={4}
            placeholder={t("dateTime.yearPlaceholder")}
            placeholderTextColor={borderColor + "55"}
            editable={!disabled}
            testID={`${testID}-year`}
          />
        </View>

        {/* Month Picker */}
        <View style={styles.inputWrapper}>
          <ThemedText style={[styles.label, { fontSize: fontSize - 2 }]}>
            {t("dateTime.month")}
          </ThemedText>
          <Pressable
            style={[
              styles.input,
              styles.pickerButton,
              {
                borderColor: hasError
                  ? AppColors.legacy.danger
                  : borderColor + "55",
              },
              disabled && styles.disabled,
            ]}
            onPress={() => !disabled && setShowMonthPicker(true)}
            disabled={disabled}
            testID={`${testID}-month-button`}
          >
            <ThemedText
              style={[
                styles.pickerText,
                { fontSize },
                monthIndex === null && styles.placeholder,
              ]}
            >
              {monthIndex !== null
                ? monthNames[monthIndex]
                : t("dateTime.monthPlaceholder")}
            </ThemedText>
            <ThemedText style={styles.dropdownIcon}>▼</ThemedText>
          </Pressable>
        </View>

        {/* Day Input */}
        <View style={styles.inputWrapper}>
          <ThemedText style={[styles.label, { fontSize: fontSize - 2 }]}>
            {t("dateTime.day")}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.dayInput,
              {
                color: textColor,
                borderColor: hasError
                  ? AppColors.legacy.danger
                  : borderColor + "55",
                fontSize,
              },
              disabled && styles.disabled,
            ]}
            value={dayText}
            onChangeText={handleDayChange}
            keyboardType="number-pad"
            maxLength={2}
            placeholder={t("dateTime.dayPlaceholder")}
            placeholderTextColor={borderColor + "55"}
            editable={!disabled}
            testID={`${testID}-day`}
          />
        </View>
      </View>

      {/* Validation Error */}
      {validationError && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{validationError}</ThemedText>
        </View>
      )}

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMonthPicker(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {t("dateTime.month")}
              </ThemedText>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowMonthPicker(false)}
                testID={`${testID}-month-close`}
              >
                <ThemedText style={styles.closeButtonText}>✕</ThemedText>
              </Pressable>
            </View>
            <ScrollView>
              {monthNames.map((month, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.monthOption,
                    index === monthIndex && styles.monthOptionSelected,
                  ]}
                  onPress={() => handleMonthSelect(index)}
                  testID={`${testID}-month-${index}`}
                >
                  <ThemedText
                    style={[
                      styles.monthOptionText,
                      index === monthIndex && styles.monthOptionTextSelected,
                    ]}
                  >
                    {month}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    ...getFontStyle(FontWeights.light, 14),
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dayInput: {
    textAlign: "center",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    flex: 1,
    ...getFontStyle(FontWeights.regular, 16),
  },
  placeholder: {
    opacity: 0.5,
  },
  dropdownIcon: {
    fontSize: 10,
    opacity: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  errorContainer: {
    marginTop: 4,
  },
  errorText: {
    color: AppColors.legacy.danger,
    fontSize: 12,
    ...getFontStyle(FontWeights.regular, 12),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.blackShadow10,
  },
  modalTitle: {
    fontSize: 18,
    ...getFontStyle(FontWeights.medium, 18),
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    opacity: 0.5,
  },
  monthOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.blackShadow10,
  },
  monthOptionSelected: {
    backgroundColor: AppColors.CIBlue + "20",
  },
  monthOptionText: {
    fontSize: 16,
    ...getFontStyle(FontWeights.regular, 16),
  },
  monthOptionTextSelected: {
    ...getFontStyle(FontWeights.medium, 16),
    color: AppColors.CIBlue,
  },
});
