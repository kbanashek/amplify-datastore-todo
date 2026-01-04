/**
 * DateQuestion component module.
 *
 * Supports two display modes:
 * - **native** (default): Uses native date/time pickers
 * - **lumiere**: Uses manual input with separate day/month/year and time picker
 *
 * Display mode can be controlled via displayProperties.displayMode.
 *
 * @module DateQuestion
 */

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";
import { Question } from "@task-types/ActivityConfig";
import { DateTimeFieldMode } from "@components/ui/DateTimeField";
import { DateTimeField } from "@components/ui/DateTimeField";
import { DateInput } from "@components/ui/DateInput";
import { TimeInput } from "@components/ui/TimeInput";
import { useTaskTranslation } from "@translations/index";
import {
  isoToLumiereFormat,
  lumiereToIsoFormat,
  parseLumiereFormat,
  combineDateAndTime,
  getMonthName,
  getTodayLumiereFormat,
} from "@utils/dateTimeFormatting";

/**
 * Display mode for date/time questions
 */
export type DateQuestionDisplayMode = "native" | "lumiere";

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
 * Supports both native pickers and Lumiere-style manual input.
 * Value is always stored as ISO 8601 string internally for compatibility.
 *
 * @param props - Component props
 * @returns Rendered DateQuestion component
 *
 * @example
 * ```tsx
 * // Native mode (default)
 * <DateQuestion
 *   question={{ id: '1', type: 'date-time-field', text: 'When?' }}
 *   value="2024-12-13T10:30:00Z"
 *   onChange={(iso) => console.log(iso)}
 *   displayProperties={{}}
 *   errors={[]}
 * />
 *
 * // Lumiere mode
 * <DateQuestion
 *   question={{ id: '1', type: 'date-time-field', text: 'When?' }}
 *   value="2024-12-13T10:30:00Z"
 *   onChange={(iso) => console.log(iso)}
 *   displayProperties={{ displayMode: 'lumiere' }}
 *   errors={[]}
 * />
 * ```
 */
export const DateQuestion: React.FC<DateQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const { t } = useTaskTranslation();
  const questionType = question.type?.toLowerCase() || "";

  // Determine display mode from displayProperties
  const displayMode: DateQuestionDisplayMode =
    (displayProperties.displayMode as DateQuestionDisplayMode) || "native";

  // Get translated month names for Lumiere mode
  const monthNames = t("dateTime.months", { returnObjects: true }) as string[];

  // Parse value to Date - memoized to prevent infinite loops
  const getDateValue = useCallback((): Date | null => {
    if (!value) return null; // Return null instead of new Date() to avoid creating new objects on each render
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, [value]);

  const initialDate = getDateValue();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ?? null
  );

  // Track previous value to prevent processing same value multiple times
  const prevValueRef = useRef<string | Date | null>(value);

  // Lumiere mode state (for manual input)
  const [day, setDay] = useState<number | null>(null);
  const [monthIndex, setMonthIndex] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  // Initialize Lumiere state from value
  useEffect(() => {
    if (displayMode === "lumiere" && value) {
      const isoString = typeof value === "string" ? value : value.toISOString();
      const lumiereString = isoToLumiereFormat(isoString, { monthNames });

      if (lumiereString) {
        const parsed = parseLumiereFormat(lumiereString, { monthNames });
        if (parsed) {
          setDay(parsed.day);
          setMonthIndex(monthNames.findIndex(m => m === parsed.month));
          setYear(parsed.year);

          // Create time Date object
          const timeDate = new Date();
          let hours = parsed.hours;
          if (parsed.period === "PM" && hours !== 12) {
            hours += 12;
          } else if (parsed.period === "AM" && hours === 12) {
            hours = 0;
          }
          timeDate.setHours(hours, parsed.minutes, 0, 0);
          setTime(timeDate);
        }
      }
    }
  }, [value, displayMode, monthNames]);

  useEffect(() => {
    // Keep local state in sync if answer updates externally (native mode)
    if (displayMode !== "native") {
      return;
    }

    // Only process if value actually changed
    if (prevValueRef.current === value) {
      return;
    }

    prevValueRef.current = value;
    const next = getDateValue();

    // Use functional update to avoid needing selectedDate in dependencies
    setSelectedDate(current => {
      // If both are null/falsy, no update needed
      if (!next && !current) {
        return current;
      }

      // If next exists and current doesn't, or times are different, update
      if (next && (!current || next.getTime() !== current.getTime())) {
        return next;
      }

      // Otherwise keep current
      return current;
    });
    // Only depend on value and displayMode, not getDateValue
    // getDateValue is stable via useCallback and only changes when value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, displayMode]);

  const formatDate = (date: Date): string => {
    if (questionType.includes("time") && !questionType.includes("date")) {
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

  // Handle date change in Lumiere mode
  const handleDateChange = useCallback(
    (newDay: number, newMonthIndex: number, newYear: number) => {
      setDay(newDay);
      setMonthIndex(newMonthIndex);
      setYear(newYear);

      // If we have time and complete date, combine and emit ISO
      if (mode === "datetime" && time) {
        const datePart = `${newDay} ${monthNames[newMonthIndex]} ${newYear}`;
        const hours = time.getHours();
        const minutes = time.getMinutes();
        let period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const timePart = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;

        const lumiereString = combineDateAndTime(datePart, timePart);
        const isoString = lumiereToIsoFormat(lumiereString, { monthNames });

        if (isoString) {
          onChange(isoString);
        }
      } else if (mode === "date") {
        // Date only - set time to midnight
        const date = new Date(newYear, newMonthIndex, newDay, 0, 0, 0, 0);
        onChange(date.toISOString());
      }
    },
    [mode, time, monthNames, onChange]
  );

  // Handle time change in Lumiere mode
  const handleTimeChange = useCallback(
    (newTime: Date) => {
      setTime(newTime);

      // If we have complete date and time, combine and emit ISO
      if (
        mode === "datetime" &&
        day !== null &&
        monthIndex !== null &&
        year !== null
      ) {
        const datePart = `${day} ${monthNames[monthIndex]} ${year}`;
        const hours = newTime.getHours();
        const minutes = newTime.getMinutes();
        let period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const timePart = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;

        const lumiereString = combineDateAndTime(datePart, timePart);
        const isoString = lumiereToIsoFormat(lumiereString, { monthNames });

        if (isoString) {
          onChange(isoString);
        }
      } else if (mode === "time") {
        // Time only - use today's date
        const today = new Date();
        const combined = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          newTime.getHours(),
          newTime.getMinutes(),
          0,
          0
        );
        onChange(combined.toISOString());
      }
    },
    [mode, day, monthIndex, year, monthNames, onChange]
  );

  // Render based on display mode
  if (displayMode === "lumiere") {
    const fontSize = displayProperties.fontSize
      ? parseInt(displayProperties.fontSize, 10)
      : 16;

    return (
      <View style={styles.container}>
        {/* Date input for date/datetime modes */}
        {mode !== "time" && (
          <DateInput
            day={day}
            monthIndex={monthIndex}
            year={year}
            onChange={handleDateChange}
            error={errors.length > 0}
            fontSize={fontSize}
            testID={`date-question-${question.id}-date`}
          />
        )}

        {/* Time input for time/datetime modes */}
        {mode !== "date" && (
          <TimeInput
            value={time}
            onChange={handleTimeChange}
            error={errors.length > 0}
            fontSize={fontSize}
            testID={`date-question-${question.id}-time`}
          />
        )}
      </View>
    );
  }

  // Default: Native mode
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
