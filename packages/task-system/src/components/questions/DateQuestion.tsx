/**
 * DateQuestion component module.
 *
 * @module DateQuestion
 */

import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Question } from "@task-types/ActivityConfig";
import { DateTimeFieldMode } from "@components/ui/DateTimeField";
import { DateTimeField } from "@components/ui/DateTimeField";

/**
 * Props for the DateQuestion component
 */
interface DateQuestionProps {
  question: Question;
  value: string | Date | null;
  onChange: (value: string) => void;
  displayProperties: Record<string, string>;
  errors: string[];
}

/**
 * DateQuestion component.
 *
 * @param props - Component props
 * @returns Rendered DateQuestion component
 */
export const DateQuestion: React.FC<DateQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const questionType = question.type?.toLowerCase() || "";

  // Parse value to Date
  const getDateValue = (): Date | null => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const initialDate = getDateValue();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ?? null
  );

  useEffect(() => {
    // Keep local state in sync if answer updates externally
    const next = getDateValue();
    if (next && (!selectedDate || next.getTime() !== selectedDate.getTime())) {
      setSelectedDate(next);
    }
  }, [value]);

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

  const mode: DateTimeFieldMode = useMemo(() => {
    if (questionType.includes("time") && !questionType.includes("date")) {
      return "time";
    }
    if (questionType.includes("date-time")) {
      return "datetime";
    }
    return "date";
  }, [questionType]);

  return (
    <View style={styles.container}>
      <DateTimeField
        mode={mode}
        value={selectedDate}
        onChange={date => {
          setSelectedDate(date);
          onChange(date.toISOString());
        }}
        format={formatDate}
        error={errors.length > 0}
        testID={`date-question-${question.id}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
});
