import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import { ThemedText } from "../ThemedText";
import { useThemeColor } from "../../hooks/useThemeColor";
import { isAndroid, isIOS } from "../../utils/platform";

export type DateTimeFieldMode = "date" | "time" | "datetime";

export interface DateTimeFieldProps {
  mode: DateTimeFieldMode;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  format?: (date: Date) => string;
  disabled?: boolean;
  error?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

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

  const borderColor = error ? "#d32f2f" : borderBase + "55";

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
            DateTimePickerAndroid.open({
              value: value ?? new Date(),
              mode,
              display: "default",
              design: "default",
              onChange: (_event, selectedDate) => {
                if (selectedDate) onChange(selectedDate);
              },
            } as any);
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
