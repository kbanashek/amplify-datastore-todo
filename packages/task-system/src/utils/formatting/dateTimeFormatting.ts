/**
 * Date and time formatting utilities for question components.
 *
 * Provides conversion between:
 * - ISO 8601 strings (internal storage format)
 * - Lumiere display format ("DD Month YYYY  HH:MM AM/PM")
 * - Native Date objects
 *
 * @module dateTimeFormatting
 */

/**
 * Parsed date-time components
 */
export interface ParsedDateTime {
  /** Date portion: "DD Month YYYY" */
  date: string;
  /** Time portion: "HH:MM AM/PM" */
  time: string;
  /** Day of month (1-31) */
  day: number;
  /** Month name (translated) */
  month: string;
  /** 4-digit year */
  year: number;
  /** Hours (1-12) */
  hours: number;
  /** Minutes (0-59) */
  minutes: number;
  /** Period: "AM" or "PM" */
  period: string;
}

/**
 * Lumiere date-time format configuration
 */
export interface DateTimeFormatConfig {
  /** Separator between date and time (default: double space) */
  separator?: string;
  /** Month names for formatting */
  monthNames?: string[];
  /** Use 12-hour format with AM/PM (default: true) */
  use12Hour?: boolean;
}

/**
 * Default month names (English)
 */
const DEFAULT_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<DateTimeFormatConfig> = {
  separator: "  ", // Double space
  monthNames: DEFAULT_MONTH_NAMES,
  use12Hour: true,
};

/**
 * Converts ISO 8601 string to Lumiere display format.
 *
 * @param isoString - ISO 8601 date-time string (e.g., "2024-12-13T10:30:00Z")
 * @param config - Format configuration options
 * @returns Lumiere format string (e.g., "13 December 2024  10:30 AM") or null if invalid
 *
 * @example
 * ```typescript
 * const lumiere = isoToLumiereFormat("2024-12-13T10:30:00Z");
 * // Returns: "13 December 2024  10:30 AM"
 *
 * // With custom month names (Spanish)
 * const spanish = isoToLumiereFormat("2024-12-13T10:30:00Z", {
 *   monthNames: ["Enero", "Febrero", ..., "Diciembre"]
 * });
 * // Returns: "13 Diciembre 2024  10:30 AM"
 * ```
 */
export const isoToLumiereFormat = (
  isoString: string | null | undefined,
  config: DateTimeFormatConfig = {}
): string | null => {
  if (!isoString) return null;

  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    const day = date.getDate();
    const month = cfg.monthNames[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes();
    let period = "AM";

    if (cfg.use12Hour) {
      period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert 0 to 12
    }

    const datePart = `${day} ${month} ${year}`;
    const timePart = `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;

    return `${datePart}${cfg.separator}${timePart}`;
  } catch {
    return null;
  }
};

/**
 * Converts Lumiere display format to ISO 8601 string.
 *
 * @param lumiereString - Lumiere format string (e.g., "13 December 2024  10:30 AM")
 * @param config - Format configuration options
 * @returns ISO 8601 string (e.g., "2024-12-13T10:30:00Z") or null if invalid
 *
 * @example
 * ```typescript
 * const iso = lumiereToIsoFormat("13 December 2024  10:30 AM");
 * // Returns: "2024-12-13T10:30:00.000Z"
 * ```
 */
export const lumiereToIsoFormat = (
  lumiereString: string | null | undefined,
  config: DateTimeFormatConfig = {}
): string | null => {
  if (!lumiereString) return null;

  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    // Split by separator (default: double space)
    const separatorRegex = new RegExp(`\\s{${cfg.separator.length},}`);
    const parts = lumiereString.split(separatorRegex);

    if (parts.length !== 2) return null;

    const [datePart, timePart] = parts;

    // Parse date: "DD Month YYYY"
    const dateComponents = datePart.trim().split(" ").filter(Boolean);
    if (dateComponents.length !== 3) return null;

    const day = parseInt(dateComponents[0], 10);
    const monthName = dateComponents[1];
    const year = parseInt(dateComponents[2], 10);

    // Find month index
    const monthIndex = cfg.monthNames.findIndex(
      m => m.toLowerCase() === monthName.toLowerCase()
    );
    if (monthIndex === -1) return null;

    // Parse time: "HH:MM AM/PM" or "HH:MM a. m./p. m." (Spanish)
    const timeComponents = timePart.trim().split(" ").filter(Boolean);
    if (timeComponents.length < 2) return null;

    const [hoursMinutes, ...periodParts] = timeComponents;
    const [hoursStr, minutesStr] = hoursMinutes.split(":");

    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Parse period (handle multi-part like "p. m.")
    const period = periodParts.join(" ").toLowerCase();
    const isPM =
      period.includes("pm") ||
      period.includes("p.m") ||
      period.includes("p. m");

    // Convert to 24-hour format
    if (cfg.use12Hour) {
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
    }

    // Create Date object (in local time)
    const date = new Date(year, monthIndex, day, hours, minutes, 0, 0);

    if (isNaN(date.getTime())) return null;

    return date.toISOString();
  } catch {
    return null;
  }
};

/**
 * Parses Lumiere format into individual components.
 *
 * @param lumiereString - Lumiere format string
 * @param config - Format configuration options
 * @returns Parsed date-time components or null if invalid
 *
 * @example
 * ```typescript
 * const parsed = parseLumiereFormat("13 December 2024  10:30 AM");
 * // Returns: {
 * //   date: "13 December 2024",
 * //   time: "10:30 AM",
 * //   day: 13,
 * //   month: "December",
 * //   year: 2024,
 * //   hours: 10,
 * //   minutes: 30,
 * //   period: "AM"
 * // }
 * ```
 */
export const parseLumiereFormat = (
  lumiereString: string | null | undefined,
  config: DateTimeFormatConfig = {}
): ParsedDateTime | null => {
  if (!lumiereString) return null;

  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const separatorRegex = new RegExp(`\\s{${cfg.separator.length},}`);
    const parts = lumiereString.split(separatorRegex);

    if (parts.length !== 2) return null;

    const [datePart, timePart] = parts;

    // Parse date
    const dateComponents = datePart.trim().split(" ").filter(Boolean);
    if (dateComponents.length !== 3) return null;

    const day = parseInt(dateComponents[0], 10);
    const month = dateComponents[1];
    const year = parseInt(dateComponents[2], 10);

    // Parse time
    const timeComponents = timePart.trim().split(" ").filter(Boolean);
    if (timeComponents.length < 2) return null;

    const [hoursMinutes, ...periodParts] = timeComponents;
    const [hoursStr, minutesStr] = hoursMinutes.split(":");

    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const period = periodParts.join(" ").toUpperCase();

    return {
      date: datePart.trim(),
      time: timePart.trim(),
      day,
      month,
      year,
      hours,
      minutes,
      period,
    };
  } catch {
    return null;
  }
};

/**
 * Formats a Date object to Lumiere display format.
 *
 * @param date - Date object to format
 * @param config - Format configuration options
 * @returns Lumiere format string or null if invalid
 *
 * @example
 * ```typescript
 * const date = new Date("2024-12-13T10:30:00Z");
 * const formatted = formatDateToLumiere(date);
 * // Returns: "13 December 2024  10:30 AM"
 * ```
 */
export const formatDateToLumiere = (
  date: Date | null | undefined,
  config: DateTimeFormatConfig = {}
): string | null => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  return isoToLumiereFormat(date.toISOString(), config);
};

/**
 * Gets translated month name for a date.
 *
 * @param date - Date object
 * @param monthNames - Array of translated month names (default: English)
 * @returns Month name (e.g., "December" or "Diciembre")
 *
 * @example
 * ```typescript
 * const date = new Date("2024-12-13");
 * const month = getMonthName(date);
 * // Returns: "December"
 *
 * // With Spanish names
 * const spanishMonth = getMonthName(date, ["Enero", ..., "Diciembre"]);
 * // Returns: "Diciembre"
 * ```
 */
export const getMonthName = (
  date: Date,
  monthNames: string[] = DEFAULT_MONTH_NAMES
): string => {
  return monthNames[date.getMonth()];
};

/**
 * Validates date components (day, month, year).
 *
 * @param day - Day of month (1-31)
 * @param monthIndex - Month index (0-11)
 * @param year - 4-digit year
 * @returns True if valid date, false otherwise
 *
 * @example
 * ```typescript
 * isValidDate(29, 1, 2024); // February 29, 2024 (leap year) → true
 * isValidDate(31, 1, 2024); // February 31, 2024 → false
 * isValidDate(31, 3, 2024); // April 31, 2024 → false
 * ```
 */
export const isValidDate = (
  day: number,
  monthIndex: number,
  year: number
): boolean => {
  if (day < 1 || day > 31) return false;
  if (monthIndex < 0 || monthIndex > 11) return false;
  if (year < 1900 || year > 2100) return false;

  // Check actual validity (handles month-specific day counts and leap years)
  const date = new Date(year, monthIndex, day);
  return (
    date.getDate() === day &&
    date.getMonth() === monthIndex &&
    date.getFullYear() === year
  );
};

/**
 * Validates time components (hours, minutes, period).
 *
 * @param hours - Hours (1-12 for 12-hour, 0-23 for 24-hour)
 * @param minutes - Minutes (0-59)
 * @param period - "AM" or "PM" (required for 12-hour format)
 * @param use12Hour - Whether using 12-hour format (default: true)
 * @returns True if valid time, false otherwise
 *
 * @example
 * ```typescript
 * isValidTime(10, 30, "AM"); // 10:30 AM → true
 * isValidTime(13, 30, "AM"); // 13:30 AM (invalid for 12-hour) → false
 * isValidTime(23, 30, "", false); // 23:30 (24-hour format) → true
 * ```
 */
export const isValidTime = (
  hours: number,
  minutes: number,
  period: string,
  use12Hour: boolean = true
): boolean => {
  if (minutes < 0 || minutes > 59) return false;

  if (use12Hour) {
    if (hours < 1 || hours > 12) return false;
    if (!period || (period !== "AM" && period !== "PM")) return false;
  } else {
    if (hours < 0 || hours > 23) return false;
  }

  return true;
};

/**
 * Gets today's date in Lumiere format with current time.
 *
 * @param config - Format configuration options
 * @returns Today's date-time in Lumiere format
 *
 * @example
 * ```typescript
 * const today = getTodayLumiereFormat();
 * // Returns: "2 January 2025  3:45 PM" (current date/time)
 * ```
 */
export const getTodayLumiereFormat = (
  config: DateTimeFormatConfig = {}
): string => {
  const now = new Date();
  return formatDateToLumiere(now, config) || "";
};

/**
 * Extracts only the date portion from Lumiere format.
 *
 * @param lumiereString - Lumiere format string
 * @param config - Format configuration options
 * @returns Date portion (e.g., "13 December 2024") or null
 *
 * @example
 * ```typescript
 * const datePart = extractDateFromLumiere("13 December 2024  10:30 AM");
 * // Returns: "13 December 2024"
 * ```
 */
export const extractDateFromLumiere = (
  lumiereString: string | null | undefined,
  config: DateTimeFormatConfig = {}
): string | null => {
  const parsed = parseLumiereFormat(lumiereString, config);
  return parsed ? parsed.date : null;
};

/**
 * Extracts only the time portion from Lumiere format.
 *
 * @param lumiereString - Lumiere format string
 * @param config - Format configuration options
 * @returns Time portion (e.g., "10:30 AM") or null
 *
 * @example
 * ```typescript
 * const timePart = extractTimeFromLumiere("13 December 2024  10:30 AM");
 * // Returns: "10:30 AM"
 * ```
 */
export const extractTimeFromLumiere = (
  lumiereString: string | null | undefined,
  config: DateTimeFormatConfig = {}
): string | null => {
  const parsed = parseLumiereFormat(lumiereString, config);
  return parsed ? parsed.time : null;
};

/**
 * Combines separate date and time strings into Lumiere format.
 *
 * @param dateString - Date string (e.g., "13 December 2024")
 * @param timeString - Time string (e.g., "10:30 AM")
 * @param config - Format configuration options
 * @returns Combined Lumiere format string
 *
 * @example
 * ```typescript
 * const combined = combineDateAndTime("13 December 2024", "10:30 AM");
 * // Returns: "13 December 2024  10:30 AM"
 * ```
 */
export const combineDateAndTime = (
  dateString: string,
  timeString: string,
  config: DateTimeFormatConfig = {}
): string => {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  return `${dateString}${cfg.separator}${timeString}`;
};
