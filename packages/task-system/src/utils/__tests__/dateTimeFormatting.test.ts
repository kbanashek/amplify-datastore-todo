/**
 * Unit tests for dateTimeFormatting utilities
 */

import {
  isoToLumiereFormat,
  lumiereToIsoFormat,
  parseLumiereFormat,
  formatDateToLumiere,
  getMonthName,
  isValidDate,
  isValidTime,
  getTodayLumiereFormat,
  extractDateFromLumiere,
  extractTimeFromLumiere,
  combineDateAndTime,
} from "@utils/dateTimeFormatting";

describe("dateTimeFormatting", () => {
  describe("isoToLumiereFormat", () => {
    it("should convert ISO string to Lumiere format", () => {
      const iso = "2024-12-13T10:30:00.000Z";
      const result = isoToLumiereFormat(iso);

      expect(result).toContain("13");
      expect(result).toContain("December");
      expect(result).toContain("2024");
      expect(result).toContain("  "); // Double space separator
    });

    it("should return null for invalid ISO string", () => {
      expect(isoToLumiereFormat("invalid")).toBeNull();
      expect(isoToLumiereFormat("")).toBeNull();
      expect(isoToLumiereFormat(null)).toBeNull();
      expect(isoToLumiereFormat(undefined)).toBeNull();
    });

    it("should support custom month names", () => {
      const iso = "2024-12-13T10:30:00.000Z";
      const spanishMonths = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      const result = isoToLumiereFormat(iso, { monthNames: spanishMonths });

      expect(result).toContain("Diciembre");
    });

    it("should handle different time zones", () => {
      const iso = "2024-01-01T00:00:00.000Z";
      const result = isoToLumiereFormat(iso);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });
  });

  describe("lumiereToIsoFormat", () => {
    it("should convert Lumiere format to ISO string", () => {
      const lumiere = "13 December 2024  10:30 AM";
      const result = lumiereToIsoFormat(lumiere);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();

      const date = new Date(result!);
      expect(date.getDate()).toBe(13);
      expect(date.getMonth()).toBe(11); // December is month 11
      expect(date.getFullYear()).toBe(2024);
    });

    it("should handle PM times correctly", () => {
      const lumiere = "13 December 2024  2:30 PM";
      const result = lumiereToIsoFormat(lumiere);

      expect(result).not.toBeNull();

      const date = new Date(result!);
      const hours = date.getHours();
      expect(hours).toBe(14); // 2 PM = 14:00 in 24-hour
    });

    it("should handle 12:00 PM (noon) correctly", () => {
      const lumiere = "13 December 2024  12:00 PM";
      const result = lumiereToIsoFormat(lumiere);

      expect(result).not.toBeNull();

      const date = new Date(result!);
      expect(date.getHours()).toBe(12);
    });

    it("should handle 12:00 AM (midnight) correctly", () => {
      const lumiere = "13 December 2024  12:00 AM";
      const result = lumiereToIsoFormat(lumiere);

      expect(result).not.toBeNull();

      const date = new Date(result!);
      expect(date.getHours()).toBe(0);
    });

    it("should handle Spanish AM/PM format (p. m.)", () => {
      const lumiere = "13 Diciembre 2024  2:30 p. m.";
      const spanishMonths = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      const result = lumiereToIsoFormat(lumiere, { monthNames: spanishMonths });

      expect(result).not.toBeNull();

      const date = new Date(result!);
      expect(date.getHours()).toBe(14); // 2:30 PM
    });

    it("should return null for invalid format", () => {
      expect(lumiereToIsoFormat("invalid")).toBeNull();
      expect(lumiereToIsoFormat("13 December")).toBeNull();
      expect(lumiereToIsoFormat("")).toBeNull();
      expect(lumiereToIsoFormat(null)).toBeNull();
    });

    it("should handle single-space separator as invalid", () => {
      const lumiere = "13 December 2024 10:30 AM"; // Single space
      const result = lumiereToIsoFormat(lumiere);

      expect(result).toBeNull();
    });
  });

  describe("parseLumiereFormat", () => {
    it("should parse Lumiere format into components", () => {
      const lumiere = "13 December 2024  10:30 AM";
      const result = parseLumiereFormat(lumiere);

      expect(result).not.toBeNull();
      expect(result!.day).toBe(13);
      expect(result!.month).toBe("December");
      expect(result!.year).toBe(2024);
      expect(result!.hours).toBe(10);
      expect(result!.minutes).toBe(30);
      expect(result!.period).toBe("AM");
      expect(result!.date).toBe("13 December 2024");
      expect(result!.time).toBe("10:30 AM");
    });

    it("should return null for invalid format", () => {
      expect(parseLumiereFormat("invalid")).toBeNull();
      expect(parseLumiereFormat("")).toBeNull();
      expect(parseLumiereFormat(null)).toBeNull();
    });
  });

  describe("formatDateToLumiere", () => {
    it("should format Date object to Lumiere format", () => {
      const date = new Date("2024-12-13T10:30:00Z");
      const result = formatDateToLumiere(date);

      expect(result).toBeDefined();
      expect(result).toContain("13");
      expect(result).toContain("December");
      expect(result).toContain("2024");
    });

    it("should return null for invalid Date", () => {
      expect(formatDateToLumiere(null)).toBeNull();
      expect(formatDateToLumiere(undefined)).toBeNull();
      expect(formatDateToLumiere(new Date("invalid"))).toBeNull();
    });
  });

  describe("getMonthName", () => {
    it("should return correct month name", () => {
      const date = new Date("2024-12-13");
      expect(getMonthName(date)).toBe("December");
    });

    it("should support custom month names", () => {
      const date = new Date("2024-12-13");
      const spanishMonths = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      expect(getMonthName(date, spanishMonths)).toBe("Diciembre");
    });
  });

  describe("isValidDate", () => {
    it("should validate correct dates", () => {
      expect(isValidDate(13, 11, 2024)).toBe(true); // Dec 13, 2024
      expect(isValidDate(1, 0, 2024)).toBe(true); // Jan 1, 2024
      expect(isValidDate(31, 11, 2024)).toBe(true); // Dec 31, 2024
    });

    it("should reject invalid day values", () => {
      expect(isValidDate(0, 11, 2024)).toBe(false); // Day 0
      expect(isValidDate(32, 11, 2024)).toBe(false); // Day 32
      expect(isValidDate(-1, 11, 2024)).toBe(false); // Negative day
    });

    it("should reject invalid month values", () => {
      expect(isValidDate(13, -1, 2024)).toBe(false); // Month -1
      expect(isValidDate(13, 12, 2024)).toBe(false); // Month 12 (0-11)
    });

    it("should reject invalid year values", () => {
      expect(isValidDate(13, 11, 1899)).toBe(false); // Year < 1900
      expect(isValidDate(13, 11, 2101)).toBe(false); // Year > 2100
    });

    it("should handle month-specific day counts", () => {
      expect(isValidDate(31, 1, 2024)).toBe(false); // Feb 31 (invalid)
      expect(isValidDate(30, 1, 2024)).toBe(false); // Feb 30 (invalid)
      expect(isValidDate(29, 1, 2024)).toBe(true); // Feb 29, 2024 (leap year)
      expect(isValidDate(29, 1, 2023)).toBe(false); // Feb 29, 2023 (not leap year)
      expect(isValidDate(31, 3, 2024)).toBe(false); // Apr 31 (invalid)
      expect(isValidDate(30, 3, 2024)).toBe(true); // Apr 30 (valid)
    });
  });

  describe("isValidTime", () => {
    it("should validate correct 12-hour times", () => {
      expect(isValidTime(10, 30, "AM")).toBe(true);
      expect(isValidTime(12, 0, "PM")).toBe(true);
      expect(isValidTime(1, 59, "AM")).toBe(true);
    });

    it("should reject invalid hours in 12-hour format", () => {
      expect(isValidTime(0, 30, "AM")).toBe(false); // Hour 0
      expect(isValidTime(13, 30, "AM")).toBe(false); // Hour 13
      expect(isValidTime(-1, 30, "AM")).toBe(false); // Negative hour
    });

    it("should reject invalid minutes", () => {
      expect(isValidTime(10, -1, "AM")).toBe(false); // Minute -1
      expect(isValidTime(10, 60, "AM")).toBe(false); // Minute 60
    });

    it("should reject invalid period for 12-hour format", () => {
      expect(isValidTime(10, 30, "")).toBe(false); // Empty period
      expect(isValidTime(10, 30, "XM")).toBe(false); // Invalid period
    });

    it("should validate 24-hour times when use12Hour is false", () => {
      expect(isValidTime(0, 30, "", false)).toBe(true);
      expect(isValidTime(23, 59, "", false)).toBe(true);
      expect(isValidTime(13, 30, "", false)).toBe(true);
    });

    it("should reject invalid 24-hour times", () => {
      expect(isValidTime(24, 0, "", false)).toBe(false);
      expect(isValidTime(-1, 0, "", false)).toBe(false);
    });
  });

  describe("getTodayLumiereFormat", () => {
    it("should return today's date in Lumiere format", () => {
      const result = getTodayLumiereFormat();

      expect(result).toBeDefined();
      expect(result).toContain("  "); // Double space separator

      // Verify it's a valid Lumiere format
      const parsed = parseLumiereFormat(result);
      expect(parsed).not.toBeNull();
    });
  });

  describe("extractDateFromLumiere", () => {
    it("should extract date portion from Lumiere format", () => {
      const lumiere = "13 December 2024  10:30 AM";
      const result = extractDateFromLumiere(lumiere);

      expect(result).toBe("13 December 2024");
    });

    it("should return null for invalid format", () => {
      expect(extractDateFromLumiere("invalid")).toBeNull();
      expect(extractDateFromLumiere("")).toBeNull();
    });
  });

  describe("extractTimeFromLumiere", () => {
    it("should extract time portion from Lumiere format", () => {
      const lumiere = "13 December 2024  10:30 AM";
      const result = extractTimeFromLumiere(lumiere);

      expect(result).toBe("10:30 AM");
    });

    it("should return null for invalid format", () => {
      expect(extractTimeFromLumiere("invalid")).toBeNull();
      expect(extractTimeFromLumiere("")).toBeNull();
    });
  });

  describe("combineDateAndTime", () => {
    it("should combine date and time with double-space separator", () => {
      const result = combineDateAndTime("13 December 2024", "10:30 AM");

      expect(result).toBe("13 December 2024  10:30 AM");
      expect(result).toContain("  "); // Double space
    });

    it("should support custom separator", () => {
      const result = combineDateAndTime("13 December 2024", "10:30 AM", {
        separator: " | ",
      });

      expect(result).toBe("13 December 2024 | 10:30 AM");
    });
  });

  describe("Round-trip conversion", () => {
    it("should maintain data integrity through ISO → Lumiere → ISO", () => {
      const originalIso = "2024-12-13T10:30:00.000Z";

      // ISO → Lumiere
      const lumiere = isoToLumiereFormat(originalIso);
      expect(lumiere).not.toBeNull();

      // Lumiere → ISO
      const resultIso = lumiereToIsoFormat(lumiere!);
      expect(resultIso).not.toBeNull();

      // Verify dates are equal (comparing timestamps)
      const originalDate = new Date(originalIso);
      const resultDate = new Date(resultIso!);

      expect(originalDate.getDate()).toBe(resultDate.getDate());
      expect(originalDate.getMonth()).toBe(resultDate.getMonth());
      expect(originalDate.getFullYear()).toBe(resultDate.getFullYear());
      expect(originalDate.getHours()).toBe(resultDate.getHours());
      expect(originalDate.getMinutes()).toBe(resultDate.getMinutes());
    });
  });
});
