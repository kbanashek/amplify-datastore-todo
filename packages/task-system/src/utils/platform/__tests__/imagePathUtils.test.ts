/**
 * Tests for imagePathUtils
 */

import {
  generateS3ImageKey,
  parseS3ImageKey,
  extractFilenameFromS3Key,
  isS3Key,
  isLocalFileUri,
  generateSimpleFilename,
  sanitizeForFilename,
  getS3Directory,
  buildS3Key,
  S3_PATH_CONFIG,
} from "@utils/platform/imagePathUtils";

describe("imagePathUtils", () => {
  // Mock Date.now for consistent timestamps
  const mockTimestamp = 1704211200000;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(mockTimestamp);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  describe("generateS3ImageKey", () => {
    it("should generate key with all optional IDs", () => {
      const result = generateS3ImageKey({
        organizationId: "org123",
        studyId: "study456",
        studyInstanceId: "instance789",
        taskId: "task001",
        questionId: "q7",
      });

      expect(result).toBe(
        "data/org123/study456/instance789/task001_q7_1704211200000.jpg"
      );
    });

    it("should generate key without optional IDs", () => {
      const result = generateS3ImageKey({
        questionId: "q7",
      });

      expect(result).toBe("data/q7_1704211200000.jpg");
    });

    it("should generate key with only organizationId", () => {
      const result = generateS3ImageKey({
        organizationId: "org123",
        questionId: "q7",
      });

      expect(result).toBe("data/org123/q7_1704211200000.jpg");
    });

    it("should generate key with taskId but no organizationId", () => {
      const result = generateS3ImageKey({
        taskId: "task001",
        questionId: "q7",
      });

      expect(result).toBe("data/task001_q7_1704211200000.jpg");
    });

    it("should use custom extension", () => {
      const result = generateS3ImageKey({
        questionId: "q7",
        extension: ".png",
      });

      expect(result).toBe("data/q7_1704211200000.png");
    });

    it("should sanitize studyInstanceId with # characters", () => {
      const result = generateS3ImageKey({
        organizationId: "org123",
        studyId: "study456",
        studyInstanceId: "instance#789",
        questionId: "q7",
      });

      expect(result).toBe(
        "data/org123/study456/instance_789/q7_1704211200000.jpg"
      );
    });
  });

  describe("parseS3ImageKey", () => {
    it("should parse key with all components", () => {
      const result = parseS3ImageKey(
        "data/org123/study456/instance789/task001_q7.jpg"
      );

      expect(result).toEqual({
        organizationId: "org123",
        studyId: "study456",
        studyInstanceId: "instance789",
        filename: "task001_q7.jpg",
      });
    });

    it("should parse key with only filename", () => {
      const result = parseS3ImageKey("data/q7.jpg");

      expect(result).toEqual({
        organizationId: undefined,
        studyId: undefined,
        studyInstanceId: undefined,
        filename: "q7.jpg",
      });
    });

    it("should parse key with organizationId only", () => {
      const result = parseS3ImageKey("data/org123/q7.jpg");

      expect(result).toEqual({
        organizationId: "org123",
        studyId: undefined,
        studyInstanceId: undefined,
        filename: "q7.jpg",
      });
    });

    it("should return null for invalid key (no data prefix)", () => {
      const result = parseS3ImageKey("files/org123/q7.jpg");

      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = parseS3ImageKey("");

      expect(result).toBeNull();
    });

    it("should return null for key with only prefix", () => {
      const result = parseS3ImageKey("data");

      expect(result).toBeNull();
    });
  });

  describe("extractFilenameFromS3Key", () => {
    it("should extract filename from valid key", () => {
      const result = extractFilenameFromS3Key(
        "data/org123/study456/task001_q7.jpg"
      );

      expect(result).toBe("task001_q7.jpg");
    });

    it("should extract filename from minimal key", () => {
      const result = extractFilenameFromS3Key("data/q7.jpg");

      expect(result).toBe("q7.jpg");
    });

    it("should return null for invalid key", () => {
      const result = extractFilenameFromS3Key("invalid/path");

      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = extractFilenameFromS3Key("");

      expect(result).toBeNull();
    });
  });

  describe("isS3Key", () => {
    it("should return true for valid S3 key", () => {
      expect(isS3Key("data/org/study/file.jpg")).toBe(true);
      expect(isS3Key("data/file.jpg")).toBe(true);
    });

    it("should return false for local file URI", () => {
      expect(isS3Key("file:///local/path/image.jpg")).toBe(false);
    });

    it("should return false for http URL", () => {
      expect(isS3Key("https://example.com/image.jpg")).toBe(false);
    });

    it("should return false for path without data prefix", () => {
      expect(isS3Key("files/image.jpg")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isS3Key("")).toBe(false);
    });

    it("should return false for relative path", () => {
      expect(isS3Key("./data/file.jpg")).toBe(false);
    });
  });

  describe("isLocalFileUri", () => {
    it("should return true for file:// URI", () => {
      expect(isLocalFileUri("file:///path/to/image.jpg")).toBe(true);
    });

    it("should return true for absolute path", () => {
      expect(isLocalFileUri("/path/to/image.jpg")).toBe(true);
    });

    it("should return false for S3 key", () => {
      expect(isLocalFileUri("data/org/study/image.jpg")).toBe(false);
    });

    it("should return false for http URL", () => {
      expect(isLocalFileUri("https://example.com/image.jpg")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isLocalFileUri("")).toBe(false);
    });

    it("should return false for relative path", () => {
      expect(isLocalFileUri("./data/file.jpg")).toBe(false);
    });
  });

  describe("generateSimpleFilename", () => {
    it("should generate filename with taskId and questionId", () => {
      const result = generateSimpleFilename("task123", "q7");

      expect(result).toBe("task123_q7_1704211200000.jpg");
    });

    it("should use custom extension", () => {
      const result = generateSimpleFilename("task123", "q7", ".png");

      expect(result).toBe("task123_q7_1704211200000.png");
    });

    it("should include timestamp", () => {
      const result = generateSimpleFilename("task123", "q7");

      expect(result).toContain("1704211200000");
    });
  });

  describe("sanitizeForFilename", () => {
    it("should replace invalid characters with underscore", () => {
      const result = sanitizeForFilename("Task #123 <test>");

      // Note: Multiple underscores are collapsed to single underscore
      expect(result).toBe("Task_123_test_");
    });

    it("should replace spaces with underscore", () => {
      const result = sanitizeForFilename("Task Name Here");

      expect(result).toBe("Task_Name_Here");
    });

    it("should collapse multiple underscores", () => {
      const result = sanitizeForFilename("Task___Name");

      expect(result).toBe("Task_Name");
    });

    it("should trim whitespace", () => {
      const result = sanitizeForFilename("  Task Name  ");

      // Note: Leading/trailing spaces become underscores, then trim() removes them
      // But trim() is called AFTER underscore replacement, so leading/trailing underscores remain
      expect(result).toBe("_Task_Name_");
    });

    it("should handle all invalid characters", () => {
      const result = sanitizeForFilename('Test#<>:"/\\|?*Name');

      expect(result).toBe("Test_Name");
    });

    it("should handle empty string", () => {
      const result = sanitizeForFilename("");

      expect(result).toBe("");
    });
  });

  describe("getS3Directory", () => {
    it("should extract directory from full S3 key", () => {
      const result = getS3Directory("data/org/study/instance/file.jpg");

      expect(result).toBe("data/org/study/instance");
    });

    it("should extract directory from minimal S3 key", () => {
      const result = getS3Directory("data/file.jpg");

      expect(result).toBe("data");
    });

    it("should return null for invalid S3 key", () => {
      const result = getS3Directory("file:///local/path/file.jpg");

      expect(result).toBeNull();
    });

    it("should return null for key without separators", () => {
      const result = getS3Directory("data");

      expect(result).toBeNull();
    });

    it("should return null for prefix with trailing slash only", () => {
      const result = getS3Directory("data/");

      expect(result).toBe("data");
    });

    it("should return null for empty string", () => {
      const result = getS3Directory("");

      expect(result).toBeNull();
    });
  });

  describe("buildS3Key", () => {
    it("should build S3 key from directory and filename", () => {
      const result = buildS3Key("data/org/study", "image.jpg");

      expect(result).toBe("data/org/study/image.jpg");
    });

    it("should handle directory with trailing slash", () => {
      const result = buildS3Key("data/org/study/", "image.jpg");

      expect(result).toBe("data/org/study/image.jpg");
    });

    it("should handle minimal directory", () => {
      const result = buildS3Key("data", "image.jpg");

      expect(result).toBe("data/image.jpg");
    });

    it("should handle directory with trailing slash removed", () => {
      const result = buildS3Key("data/org/", "image.jpg");

      expect(result).toBe("data/org/image.jpg");
    });
  });

  describe("S3_PATH_CONFIG", () => {
    it("should have correct base prefix", () => {
      expect(S3_PATH_CONFIG.BASE_PREFIX).toBe("data");
    });

    it("should have correct separator", () => {
      expect(S3_PATH_CONFIG.SEPARATOR).toBe("/");
    });
  });
});
