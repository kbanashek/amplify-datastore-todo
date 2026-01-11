/**
 * Utility for formatting log data into clean, readable multi-line strings.
 *
 * @module logFormatter
 */

/**
 * Formats an object into a clean, readable multi-line string.
 *
 * @param data - The data object to format
 * @param indent - The indentation string (default: "  ")
 * @returns A formatted multi-line string, or empty string if data is null/undefined
 *
 * @example
 * ```typescript
 * const data = { count: 10, status: "synced", items: ["a", "b"] };
 * const formatted = formatObjectForLog(data);
 * // Returns:
 * // "  count: 10
 * //   status: synced
 * //   items: ["a","b"]"
 * ```
 */
export const formatObjectForLog = (
  data: Record<string, unknown> | null | undefined,
  indent: string = "  "
): string => {
  if (!data || Object.keys(data).length === 0) {
    return "";
  }

  return Object.entries(data)
    .map(([key, value]) => {
      const valueStr =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value);
      return `${indent}${key}: ${valueStr}`;
    })
    .join("\n");
};

/**
 * Parses any JSON strings in a data object for clean logging.
 * Recursively parses nested JSON strings.
 *
 * @param data - The data object to parse
 * @returns A parsed object with JSON strings converted to objects
 *
 * @example
 * ```typescript
 * const data = { counts: '{"new":0,"updated":3}', status: "ok" };
 * const parsed = parseJsonStrings(data);
 * // Returns: { counts: { new: 0, updated: 3 }, status: "ok" }
 * ```
 */
export const parseJsonStrings = (
  data: unknown
): Record<string, unknown> | unknown => {
  if (!data) {
    return data;
  }

  try {
    // If data itself is a JSON string, parse it
    if (typeof data === "string") {
      if (data.startsWith("{") || data.startsWith("[")) {
        return JSON.parse(data);
      }
      return data;
    }

    // If data is an object, parse any JSON string properties
    if (typeof data === "object" && !Array.isArray(data)) {
      const parsed: Record<string, unknown> = {};
      for (const key in data as Record<string, unknown>) {
        const value = (data as Record<string, unknown>)[key];
        if (
          typeof value === "string" &&
          (value.startsWith("{") || value.startsWith("["))
        ) {
          try {
            parsed[key] = JSON.parse(value);
          } catch {
            parsed[key] = value; // Keep as string if parse fails
          }
        } else {
          parsed[key] = value;
        }
      }
      return parsed;
    }

    return data;
  } catch {
    return data; // Return original if any parsing fails
  }
};

/**
 * Formats model sync data into a clean, readable string.
 *
 * @param modelName - Name of the synced model
 * @param data - Sync data containing counts, isFullSync, isDeltaSync
 * @returns A formatted multi-line string
 *
 * @example
 * ```typescript
 * const formatted = formatModelSyncLog("Task", {
 *   isFullSync: false,
 *   isDeltaSync: true,
 *   counts: { new: 0, updated: 3, deleted: 0 }
 * });
 * // Returns:
 * // "syncType: Delta Sync
 * //   new: 0
 * //   updated: 3
 * //   deleted: 0"
 * ```
 */
export const formatModelSyncLog = (
  modelName: string,
  data: {
    isFullSync?: boolean;
    isDeltaSync?: boolean;
    counts?: { new?: number; updated?: number; deleted?: number };
  }
): string => {
  const syncType = data?.isFullSync
    ? "Full Sync"
    : data?.isDeltaSync
      ? "Delta Sync"
      : "Unknown";

  const counts = data?.counts || {};

  return (
    `syncType: ${syncType}\n` +
    `  new: ${counts.new || 0}\n` +
    `  updated: ${counts.updated || 0}\n` +
    `  deleted: ${counts.deleted || 0}`
  );
};
