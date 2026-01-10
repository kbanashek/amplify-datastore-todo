/**
 * Unit tests for logFormatter utility
 */

import {
  formatModelSyncLog,
  formatObjectForLog,
  parseJsonStrings,
} from "../logFormatter";

describe("logFormatter", () => {
  describe("formatObjectForLog", () => {
    it("should format simple object as multi-line string", () => {
      const data = {
        count: 10,
        status: "synced",
      };

      const result = formatObjectForLog(data);

      expect(result).toBe("  count: 10\n  status: synced");
    });

    it("should format nested objects as JSON strings", () => {
      const data = {
        counts: { new: 0, updated: 3 },
        status: "synced",
      };

      const result = formatObjectForLog(data);

      expect(result).toContain('counts: {"new":0,"updated":3}');
      expect(result).toContain("status: synced");
    });

    it("should return empty string for null data", () => {
      expect(formatObjectForLog(null)).toBe("");
    });

    it("should return empty string for undefined data", () => {
      expect(formatObjectForLog(undefined)).toBe("");
    });

    it("should return empty string for empty object", () => {
      expect(formatObjectForLog({})).toBe("");
    });

    it("should use custom indent", () => {
      const data = { key: "value" };
      const result = formatObjectForLog(data, "    ");

      expect(result).toBe("    key: value");
    });
  });

  describe("parseJsonStrings", () => {
    it("should parse JSON string data", () => {
      const data = '{"count":10,"status":"synced"}';
      const result = parseJsonStrings(data);

      expect(result).toEqual({ count: 10, status: "synced" });
    });

    it("should parse JSON strings in object properties", () => {
      const data = {
        counts: '{"new":0,"updated":3}',
        status: "ok",
      };

      const result = parseJsonStrings(data) as Record<string, unknown>;

      expect(result.counts).toEqual({ new: 0, updated: 3 });
      expect(result.status).toBe("ok");
    });

    it("should handle non-JSON strings", () => {
      const data = {
        message: "hello world",
        count: 10,
      };

      const result = parseJsonStrings(data);

      expect(result).toEqual(data);
    });

    it("should handle invalid JSON gracefully", () => {
      const data = '{"invalid json';
      const result = parseJsonStrings(data);

      expect(result).toBe(data);
    });

    it("should return null/undefined as-is", () => {
      expect(parseJsonStrings(null)).toBe(null);
      expect(parseJsonStrings(undefined)).toBe(undefined);
    });

    it("should parse array JSON strings", () => {
      const data = '["a","b","c"]';
      const result = parseJsonStrings(data);

      expect(result).toEqual(["a", "b", "c"]);
    });
  });

  describe("formatModelSyncLog", () => {
    it("should format full sync log", () => {
      const result = formatModelSyncLog("Task", {
        isFullSync: true,
        isDeltaSync: false,
        counts: { new: 5, updated: 3, deleted: 1 },
      });

      expect(result).toContain("syncType: Full Sync");
      expect(result).toContain("new: 5");
      expect(result).toContain("updated: 3");
      expect(result).toContain("deleted: 1");
    });

    it("should format delta sync log", () => {
      const result = formatModelSyncLog("Activity", {
        isFullSync: false,
        isDeltaSync: true,
        counts: { new: 0, updated: 2, deleted: 0 },
      });

      expect(result).toContain("syncType: Delta Sync");
      expect(result).toContain("new: 0");
      expect(result).toContain("updated: 2");
      expect(result).toContain("deleted: 0");
    });

    it("should handle missing counts", () => {
      const result = formatModelSyncLog("Task", {
        isFullSync: false,
        isDeltaSync: true,
      });

      expect(result).toContain("new: 0");
      expect(result).toContain("updated: 0");
      expect(result).toContain("deleted: 0");
    });

    it("should handle unknown sync type", () => {
      const result = formatModelSyncLog("Task", {
        counts: { new: 1, updated: 2, deleted: 3 },
      });

      expect(result).toContain("syncType: Unknown");
    });

    it("should handle partial counts", () => {
      const result = formatModelSyncLog("Task", {
        isFullSync: true,
        counts: { new: 5 }, // Missing updated and deleted
      });

      expect(result).toContain("new: 5");
      expect(result).toContain("updated: 0");
      expect(result).toContain("deleted: 0");
    });
  });
});
