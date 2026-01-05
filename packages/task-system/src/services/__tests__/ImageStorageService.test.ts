/**
 * Tests for ImageStorageService
 */

import { ImageStorageService } from "@services/ImageStorageService";
import * as FileSystemUtils from "@utils/fileSystemUtils";
import * as ImagePathUtils from "@utils/imagePathUtils";

// Mock Amplify Storage with lazy import support
jest.mock("aws-amplify/storage", () => ({
  __esModule: true,
  uploadData: jest.fn(),
  getUrl: jest.fn(),
  remove: jest.fn(),
  list: jest.fn(),
}));

// Mock file system utilities
jest.mock("@utils/fileSystemUtils", () => ({
  copyImageToPermanentStorage: jest.fn(),
  readImageAsBase64: jest.fn(),
  createBlobFromLocalFile: jest.fn(),
  deleteLocalImage: jest.fn(),
  localImageExists: jest.fn(),
  getLocalImagePath: jest.fn(),
  generateImageFilename: jest.fn(),
}));

// Mock image path utilities
jest.mock("@utils/imagePathUtils", () => ({
  generateS3ImageKey: jest.fn(),
  extractFilenameFromS3Key: jest.fn(),
  isS3Key: jest.fn(),
  isLocalFileUri: jest.fn(),
}));

// Mock service logger
jest.mock("@utils/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Import mocked modules
import { uploadData, getUrl, remove, list } from "aws-amplify/storage";

describe("ImageStorageService", () => {
  let service: ImageStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = ImageStorageService.getInstance();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = ImageStorageService.getInstance();
      const instance2 = ImageStorageService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("uploadImage", () => {
    const mockUploadOptions = {
      sourceUri: "file:///tmp/image.jpg",
      questionId: "q7",
      taskId: "task123",
      organizationId: "org123",
      studyId: "study456",
    };

    beforeEach(() => {
      (FileSystemUtils.generateImageFilename as jest.Mock).mockReturnValue(
        "task123_q7_1704211200000.jpg"
      );
      (
        FileSystemUtils.copyImageToPermanentStorage as jest.Mock
      ).mockResolvedValue("file:///permanent/task123_q7_1704211200000.jpg");
      (FileSystemUtils.createBlobFromLocalFile as jest.Mock).mockResolvedValue(
        new Blob(["mock-image-data"], { type: "image/jpeg" })
      );
      (ImagePathUtils.generateS3ImageKey as jest.Mock).mockReturnValue(
        "data/org123/study456/task123_q7_1704211200000.jpg"
      );
    });

    it("should upload image successfully", async () => {
      (uploadData as jest.Mock).mockReturnValue({
        result: Promise.resolve({
          key: "data/org123/study456/task123_q7_1704211200000.jpg",
        }),
      });

      const result = await service.uploadImage(mockUploadOptions);

      expect(result).toEqual({
        s3Key: "data/org123/study456/task123_q7_1704211200000.jpg",
        filename: "task123_q7_1704211200000.jpg",
        localPath: "file:///permanent/task123_q7_1704211200000.jpg",
        uploadedToS3: true,
      });

      expect(FileSystemUtils.copyImageToPermanentStorage).toHaveBeenCalledWith(
        "file:///tmp/image.jpg",
        "task123_q7_1704211200000.jpg"
      );
      expect(uploadData).toHaveBeenCalled();
    });

    it("should save locally if S3 upload fails and saveLocalOnFailure is true", async () => {
      (uploadData as jest.Mock).mockReturnValue({
        result: Promise.reject(new Error("Network error")),
      });

      const result = await service.uploadImage({
        ...mockUploadOptions,
        saveLocalOnFailure: true,
      });

      expect(result).toEqual({
        s3Key: "data/org123/study456/task123_q7_1704211200000.jpg",
        filename: "task123_q7_1704211200000.jpg",
        localPath: "file:///permanent/task123_q7_1704211200000.jpg",
        uploadedToS3: false,
      });
    });

    it("should throw error if S3 upload fails and saveLocalOnFailure is false", async () => {
      (uploadData as jest.Mock).mockReturnValue({
        result: Promise.reject(new Error("Network error")),
      });

      await expect(
        service.uploadImage({
          ...mockUploadOptions,
          saveLocalOnFailure: false,
        })
      ).rejects.toThrow("Network error");
    });

    it("should handle file system errors", async () => {
      (
        FileSystemUtils.copyImageToPermanentStorage as jest.Mock
      ).mockRejectedValue(new Error("File system error"));

      await expect(service.uploadImage(mockUploadOptions)).rejects.toThrow(
        "File system error"
      );
    });
  });

  describe("downloadImage", () => {
    const mockS3Key = "data/org123/study456/task123_q7.jpg";
    const mockFilename = "task123_q7.jpg";

    beforeEach(() => {
      (ImagePathUtils.extractFilenameFromS3Key as jest.Mock).mockReturnValue(
        mockFilename
      );
    });

    it("should return cached image if available and useCache is true", async () => {
      (FileSystemUtils.localImageExists as jest.Mock).mockResolvedValue(true);
      (FileSystemUtils.getLocalImagePath as jest.Mock).mockReturnValue(
        "file:///local/task123_q7.jpg"
      );

      const result = await service.downloadImage({
        s3Key: mockS3Key,
        useCache: true,
      });

      expect(result.fromCache).toBe(true);
      expect(result.localPath).toBe("file:///local/task123_q7.jpg");
      expect(getUrl).not.toHaveBeenCalled();
    });

    it("should fetch from S3 if cache is disabled", async () => {
      (getUrl as jest.Mock).mockResolvedValue({
        url: new URL("https://s3.amazonaws.com/signed-url"),
      });

      const result = await service.downloadImage({
        s3Key: mockS3Key,
        useCache: false,
      });

      expect(result.fromCache).toBe(false);
      expect(result.url).toBe("https://s3.amazonaws.com/signed-url");
      expect(getUrl).toHaveBeenCalledWith({
        key: mockS3Key,
        options: {
          expiresIn: 900,
        },
      });
    });

    it("should fetch from S3 if not in cache", async () => {
      (FileSystemUtils.localImageExists as jest.Mock).mockResolvedValue(false);
      (getUrl as jest.Mock).mockResolvedValue({
        url: new URL("https://s3.amazonaws.com/signed-url"),
      });

      const result = await service.downloadImage({
        s3Key: mockS3Key,
        useCache: true,
      });

      expect(result.fromCache).toBe(false);
      expect(result.url).toBe("https://s3.amazonaws.com/signed-url");
    });

    it("should handle invalid S3 key format", async () => {
      (ImagePathUtils.extractFilenameFromS3Key as jest.Mock).mockReturnValue(
        null
      );

      await expect(
        service.downloadImage({ s3Key: "invalid-key" })
      ).rejects.toThrow("Invalid S3 key format");
    });

    it("should use custom expiration time", async () => {
      (FileSystemUtils.localImageExists as jest.Mock).mockResolvedValue(false);
      (getUrl as jest.Mock).mockResolvedValue({
        url: new URL("https://s3.amazonaws.com/signed-url"),
      });

      await service.downloadImage({
        s3Key: mockS3Key,
        expiresIn: 3600,
      });

      expect(getUrl).toHaveBeenCalledWith({
        key: mockS3Key,
        options: {
          expiresIn: 3600,
        },
      });
    });
  });

  describe("deleteImage", () => {
    const mockS3Key = "data/org123/study456/task123_q7.jpg";
    const mockFilename = "task123_q7.jpg";

    beforeEach(() => {
      (ImagePathUtils.extractFilenameFromS3Key as jest.Mock).mockReturnValue(
        mockFilename
      );
      (FileSystemUtils.deleteLocalImage as jest.Mock).mockResolvedValue(
        undefined
      );
      (remove as jest.Mock).mockResolvedValue(undefined);
    });

    it("should delete image from both local and S3", async () => {
      await service.deleteImage(mockS3Key);

      expect(FileSystemUtils.deleteLocalImage).toHaveBeenCalledWith(
        mockFilename
      );
      expect(remove).toHaveBeenCalledWith({ key: mockS3Key });
    });

    it("should continue if local deletion fails", async () => {
      (FileSystemUtils.deleteLocalImage as jest.Mock).mockRejectedValue(
        new Error("Local delete failed")
      );

      await service.deleteImage(mockS3Key);

      expect(remove).toHaveBeenCalledWith({ key: mockS3Key });
    });

    it("should throw error if S3 deletion fails", async () => {
      (remove as jest.Mock).mockRejectedValue(new Error("S3 delete failed"));

      await expect(service.deleteImage(mockS3Key)).rejects.toThrow(
        "S3 delete failed"
      );
    });
  });

  describe("listImages", () => {
    const mockPrefix = "data/org123/study456/";

    it("should list images from S3", async () => {
      (list as jest.Mock).mockResolvedValue({
        items: [
          { key: "data/org123/study456/image1.jpg" },
          { key: "data/org123/study456/image2.jpg" },
        ],
      });

      const result = await service.listImages(mockPrefix);

      expect(result).toEqual([
        "data/org123/study456/image1.jpg",
        "data/org123/study456/image2.jpg",
      ]);

      expect(list).toHaveBeenCalledWith({
        prefix: mockPrefix,
        options: {
          listAll: false,
          pageSize: 100,
        },
      });
    });

    it("should use custom maxResults", async () => {
      (list as jest.Mock).mockResolvedValue({ items: [] });

      await service.listImages(mockPrefix, 50);

      expect(list).toHaveBeenCalledWith({
        prefix: mockPrefix,
        options: {
          listAll: false,
          pageSize: 50,
        },
      });
    });

    it("should handle list errors", async () => {
      (list as jest.Mock).mockRejectedValue(new Error("List failed"));

      await expect(service.listImages(mockPrefix)).rejects.toThrow(
        "List failed"
      );
    });
  });

  describe("getDisplayUri", () => {
    it("should return null for null/undefined path", async () => {
      expect(await service.getDisplayUri(null)).toBeNull();
      expect(await service.getDisplayUri(undefined)).toBeNull();
    });

    it("should return local file URI as-is", async () => {
      (ImagePathUtils.isLocalFileUri as jest.Mock).mockReturnValue(true);

      const localUri = "file:///local/image.jpg";
      const result = await service.getDisplayUri(localUri);

      expect(result).toBe(localUri);
    });

    it("should download S3 image and return URL", async () => {
      (ImagePathUtils.isLocalFileUri as jest.Mock).mockReturnValue(false);
      (ImagePathUtils.isS3Key as jest.Mock).mockReturnValue(true);
      (ImagePathUtils.extractFilenameFromS3Key as jest.Mock).mockReturnValue(
        "image.jpg"
      );
      (FileSystemUtils.localImageExists as jest.Mock).mockResolvedValue(false);
      (getUrl as jest.Mock).mockResolvedValue({
        url: new URL("https://s3.amazonaws.com/signed-url"),
      });

      const result = await service.getDisplayUri("data/org/study/image.jpg");

      expect(result).toBe("https://s3.amazonaws.com/signed-url");
    });

    it("should return null for unknown path format", async () => {
      (ImagePathUtils.isLocalFileUri as jest.Mock).mockReturnValue(false);
      (ImagePathUtils.isS3Key as jest.Mock).mockReturnValue(false);

      const result = await service.getDisplayUri("unknown-format");

      expect(result).toBeNull();
    });

    it("should return null if download fails", async () => {
      (ImagePathUtils.isLocalFileUri as jest.Mock).mockReturnValue(false);
      (ImagePathUtils.isS3Key as jest.Mock).mockReturnValue(true);
      (ImagePathUtils.extractFilenameFromS3Key as jest.Mock).mockReturnValue(
        "image.jpg"
      );
      (FileSystemUtils.localImageExists as jest.Mock).mockResolvedValue(false);
      (getUrl as jest.Mock).mockRejectedValue(new Error("Download failed"));

      const result = await service.getDisplayUri("data/org/study/image.jpg");

      expect(result).toBeNull();
    });
  });
});
