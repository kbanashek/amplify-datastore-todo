/**
 * TimeInput component for time selection (Lumiere-style).
 *
 * Provides a native time picker with formatted display in a rounded button.
 * Shows time in 12-hour format with AM/PM indicator.
 *
 * @module TimeInput
 */

import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState, useMemo } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@components/ThemedText";
import { AppColors } from "@constants/AppColors";
import { useThemeColor } from "@hooks/useThemeColor";
import { useTaskTranslation } from "@translations/index";
import { isAndroid, isIOS } from "@utils/platform";
import { getFontStyle, FontWeights } from "@utils/fontUtils";

/**
 * Props for the TimeInput component
 */
export interface TimeInputProps {
  /** Current time value as Date object */
  value: Date | null;
  /** Callback when time is selected */
  onChange: (time: Date) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether to show error styling */
  error?: boolean;
  /** Test identifier for testing frameworks */
  testID?: string;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Font size for display */
  fontSize?: number;
}

/**
 * A component for time selection with native picker.
 *
 * Features:
 * - Native time picker (@react-native-community/datetimepicker)
 * - 12-hour format with AM/PM display
 * - Rounded button design matching Lumiere style
 * - Separate display for time and period
 * - Platform-aware (iOS modal, Android native)
 *
 * @param props - TimeInput component props
 * @returns Rendered time input component
 *
 * @example
 * ```tsx
 * <TimeInput
 *   value={selectedTime}
 *   onChange={(time) => {
 *     console.log(`Selected: ${time.toLocaleTimeString()}`);
 *   }}
 * />
 * ```
 */
export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  disabled = false,
  error: externalError = false,
  testID,
  style,
  fontSize = 16,
}) => {
  const { t } = useTaskTranslation();
  const textColor = useThemeColor({}, "text");
  const [showPicker, setShowPicker] = useState(false);

  // Format time for display
  const displayValue = useMemo(() => {
    if (!value) return null;

    // Get hours and minutes
    let hours = value.getHours();
    const minutes = value.getMinutes();

    // Determine AM/PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Format time string
    const timeStr = `${hours}:${minutes.toString().padStart(2, "0")}`;

    return { time: timeStr, period };
  }, [value]);

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (isIOS()) {
      // On iOS, keep picker open until dismissed
      if (event.type === "dismissed") {
        setShowPicker(false);
      } else if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // On Android, picker closes automatically
      setShowPicker(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    }
  };

  const handlePress = () => {
    if (disabled) return;

    if (isAndroid()) {
      // Android: Show native picker dialog
      DateTimePickerAndroid.open({
        value: value || new Date(),
        mode: "time",
        is24Hour: false,
        onChange: handlePickerChange,
      });
    } else {
      // iOS: Show modal picker
      setShowPicker(true);
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Label */}
      <ThemedText style={[styles.label, { fontSize: fontSize - 2 }]}>
        {t("dateTime.selectTime")}
      </ThemedText>

      {/* Time Display Button */}
      <Pressable
        style={[
          styles.displayButton,
          disabled && styles.disabled,
          externalError && styles.error,
        ]}
        onPress={handlePress}
        disabled={disabled}
        testID={`${testID}-button`}
      >
        {displayValue ? (
          <View style={styles.timeDisplay}>
            <ThemedText
              style={[styles.timeText, { fontSize, color: textColor }]}
            >
              {displayValue.time}
            </ThemedText>
            <ThemedText
              style={[
                styles.periodText,
                { fontSize: fontSize - 2, color: textColor },
              ]}
            >
              {displayValue.period}
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[styles.placeholder, { fontSize }]}>
            {t("dateTime.selectTime")}
          </ThemedText>
        )}
      </Pressable>

      {/* iOS Picker Modal */}
      {isIOS() && showPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Pressable
              style={styles.doneButton}
              onPress={() => setShowPicker(false)}
              testID={`${testID}-done`}
            >
              <ThemedText style={styles.doneButtonText}>
                {t("common.ok")}
              </ThemedText>
            </Pressable>
          </View>
          <DateTimePicker
            value={value || new Date()}
            mode="time"
            display="spinner"
            onChange={handlePickerChange}
            testID={`${testID}-picker`}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  label: {
    marginBottom: 8,
    ...getFontStyle(FontWeights.light, 14),
    opacity: 0.7,
  },
  displayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.powderGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  timeText: {
    ...getFontStyle(FontWeights.light, 16),
  },
  periodText: {
    ...getFontStyle(FontWeights.light, 16),
    opacity: 0.8,
  },
  placeholder: {
    ...getFontStyle(FontWeights.light, 16),
    opacity: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    borderWidth: 1,
    borderColor: AppColors.legacy.danger,
  },
  pickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.blackShadow10,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneButtonText: {
    color: AppColors.CIBlue,
    fontSize: 16,
    ...getFontStyle(FontWeights.medium, 16),
  },
});
