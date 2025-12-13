import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Question } from "../../types/ActivityConfig";

interface DateQuestionProps {
  question: Question;
  value: string | Date | null;
  onChange: (value: string) => void;
  displayProperties: Record<string, string>;
  errors: string[];
}

export const DateQuestion: React.FC<DateQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const questionType = question.type?.toLowerCase() || "";

  // Parse value to Date
  const getDateValue = (): Date => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getDateValue());

  const formatDate = (date: Date): string => {
    if (questionType.includes("time")) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (questionType.includes("date-time")) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    console.log("📅 [DateQuestion] Date picker changed", {
      questionId: question.id,
      date: date?.toISOString(),
      platform: Platform.OS,
      questionType: questionType,
    });

    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (date) {
      setSelectedDate(date);
      onChange(date.toISOString());
      console.log("✅ [DateQuestion] Date value updated", {
        questionId: question.id,
        isoString: date.toISOString(),
        formatted: formatDate(date),
      });
    }
  };

  const displayValue = value ? formatDate(getDateValue()) : "Select date/time";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dateButton, errors.length > 0 && styles.dateButtonError]}
        onPress={() => {
          console.log("📅 [DateQuestion] Date button pressed", {
            questionId: question.id,
            currentValue: value,
            questionType: questionType,
          });
          setShowPicker(true);
        }}
      >
        <Text style={styles.dateButtonText}>{displayValue}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode={
            questionType.includes("time") && !questionType.includes("date")
              ? "time"
              : questionType.includes("date-time")
                ? "datetime"
                : "date"
          }
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === "ios" && showPicker && (
        <View style={styles.iosPickerContainer}>
          <TouchableOpacity
            style={styles.iosPickerButton}
            onPress={() => {
              console.log("✅ [DateQuestion] Done button pressed (iOS)", {
                questionId: question.id,
                selectedDate: selectedDate.toISOString(),
                formatted: formatDate(selectedDate),
              });
              setShowPicker(false);
            }}
          >
            <Text style={styles.iosPickerButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  dateButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  dateButtonError: {
    borderColor: "#e74c3c",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#2f3542",
  },
  iosPickerContainer: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  iosPickerButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  iosPickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
