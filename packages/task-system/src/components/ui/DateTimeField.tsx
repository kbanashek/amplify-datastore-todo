/**
 * DateTimeField component for selecting dates and times.
 *
 * Provides a platform-aware date/time picker with customizable display format.
 * Handles iOS and Android platform differences automatically.
 *
 * @module DateTimeField
 */

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@components/ThemedText";
import { AppColors } from "@constants/AppColors";
import { useThemeColor } from "@hooks/useThemeColor";
import { isAndroid, isIOS } from "@utils/platform";

/**
 * Date/time selection mode
 */
export type DateTimeFieldMode = "date" | "time" | "datetime";

/**
 * Props for the DateTimeField component
 */
export interface DateTimeFieldProps {
  /** Selection mode: date, time, or datetime */
  mode: DateTimeFieldMode;
  /** Current selected date/time value */
  value: Date | null;
  /** Callback when date/time is changed */
  onChange: (date: Date) => void;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Custom format function for displaying the date */
  format?: (date: Date) => string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether to show error styling */
  error?: boolean;
  /** Test identifier for testing frameworks */
  testID?: string;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
}

/**
 * A component for selecting dates and times with platform-specific handling.
 *
 * Automatically uses iOS modal picker or Android native picker based on platform.
 * Supports custom date formatting and themed styling.
 *
 * @param props - DateTimeField component props
 * @returns Rendered date/time picker field
 *
 * @example
 * ```tsx
 * // Date picker
 * <DateTimeField
 *   mode="date"
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 * />
 *
 * // Time picker with custom format
 * <DateTimeField
 *   mode="time"
 *   value={selectedTime}
 *   onChange={setSelectedTime}
 *   format={(date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
 * />
 * ```
 */
export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  mode,
  value,
  onChange,
  placeholder,
  format,
  disabled = false,
  error = false,
  testID,
  style,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const textColor = useThemeColor({}, "text");
  const background = useThemeColor({}, "background");
  const borderBase = useThemeColor({}, "icon");
  const tint = useThemeColor({}, "tint");

  const displayValue = useMemo(() => {
    if (!value)
      return (
        placeholder ??
        (mode === "datetime"
          ? "Select date/time"
          : mode === "time"
            ? "Select time"
            : "Select date")
      );
    if (format) return format(value);
    if (mode === "time") {
      return value.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (mode === "datetime") {
      return value.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [format, mode, placeholder, value]);

  const borderColor = error ? AppColors.legacy.danger : borderBase + "55";

  const handlePickerChange = (_event: unknown, date?: Date) => {
    setShowPicker(false);
    if (date) {
      onChange(date);
    }
  };

  return (
    <View style={style}>
      <Pressable
        testID={testID ? `${testID}-button` : undefined}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          if (isAndroid()) {
            // Avoid mounting the Android DateTimePicker component (it auto-opens and dismisses on unmount).
            // Using the imperative API prevents crashes when Material pickers are unavailable in the host.
            // Android doesn't support "datetime" mode - convert to "date" or "time"
            const androidMode = mode === "datetime" ? "date" : mode;
            DateTimePickerAndroid.open({
              value: value ?? new Date(),
              mode: androidMode,
              display: "default",
              onChange: (_event, selectedDate) => {
                if (selectedDate) {
                  // For datetime mode on Android, show time picker after date is selected
                  if (mode === "datetime") {
                    DateTimePickerAndroid.open({
                      value: selectedDate,
                      mode: "time",
                      display: "default",
                      onChange: (_timeEvent, selectedTime) => {
                        if (selectedTime) onChange(selectedTime);
                      },
                    });
                  } else {
                    onChange(selectedDate);
                  }
                }
              },
            });
            return;
          }
          setShowPicker(true);
        }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: background,
            borderColor,
            opacity: disabled ? 0.7 : 1,
          },
          pressed && !disabled ? styles.pressed : null,
        ]}
      >
        <ThemedText style={[styles.buttonText, { color: textColor }]}>
          {displayValue}
        </ThemedText>
      </Pressable>

      {isIOS() && showPicker ? (
        <DateTimePicker
          testID={testID ? `${testID}-picker` : undefined}
          value={value ?? new Date()}
          mode={mode}
          display="spinner"
          onChange={handlePickerChange}
        />
      ) : null}

      {isIOS() && showPicker ? (
        <View style={styles.iosActions}>
          <Pressable
            testID={testID ? `${testID}-done` : undefined}
            accessibilityRole="button"
            onPress={() => setShowPicker(false)}
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: tint },
              pressed ? styles.pressed : null,
            ]}
          >
            <ThemedText style={styles.doneButtonText}>Done</ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  iosActions: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
