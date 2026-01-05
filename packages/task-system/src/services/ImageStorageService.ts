/**
 * Image Storage Service for S3 operations using Amplify Storage.
 *
 * Provides a unified interface for uploading, downloading, and managing
 * images in S3 with local file system caching. Integrates with AppSync/DataStore
 * for offline support and automatic sync.
 *
 * @module ImageStorageService
 */

import { uploadData, getUrl, remove, list } from "aws-amplify/storage";
import { getServiceLogger } from "@utils/serviceLogger";
import {
  copyImageToPermanentStorage,
  deleteLocalImage,
  localImageExists,
  getLocalImagePath,
  generateImageFilename,
  createBlobFromLocalFile,
} from "@utils/fileSystemUtils";
import {
  generateS3ImageKey,
  extractFilenameFromS3Key,
  isS3Key,
  isLocalFileUri,
  type S3ImagePathOptions,
} from "@utils/imagePathUtils";

const logger = getServiceLogger("ImageStorageService");

/**
 * Options for uploading an image
 */
export interface UploadImageOptions extends Partial<S3ImagePathOptions> {
  /** Source URI (from camera/gallery) */
  sourceUri: string;
  /** Question ID (required) */
  questionId: string;
  /** Task ID (optional) */
  taskId?: string;
  /** Task type (EPISODIC, SCHEDULED, TIMED) */
  taskType?: string;
  /** UUID for episodic tasks (taskInstanceId) */
  uuid?: string;
  /** Content type (default: image/jpeg) */
  contentType?: string;
  /** Whether to save locally even if upload fails */
  saveLocalOnFailure?: boolean;
}

/**
 * Result of an image upload operation
 */
export interface UploadImageResult {
  /** S3 key where image was uploaded */
  s3Key: string;
  /** Local filename */
  filename: string;
  /** Local file path */
  localPath: string;
  /** Whether image was uploaded to S3 (false if offline) */
  uploadedToS3: boolean;
}

/**
 * Options for downloading an image
 */
export interface DownloadImageOptions {
  /** S3 key of the image */
  s3Key: string;
  /** Whether to use cached version if available */
  useCache?: boolean;
  /** Expiration time for pre-signed URL in seconds (default: 900 = 15 minutes) */
  expiresIn?: number;
}

/**
 * Result of an image download operation
 */
export interface DownloadImageResult {
  /** Pre-signed URL for accessing the image */
  url: string;
  /** Local path if cached */
  localPath?: string;
  /** Whether result came from cache */
  fromCache: boolean;
  /** URL expiration timestamp */
  expiresAt: number;
}

/**
 * Image Storage Service class.
 *
 * Singleton service for managing image uploads, downloads, and caching.
 * Uses Amplify Storage for S3 operations and expo-file-system for local caching.
 */
export class ImageStorageService {
  private static instance: ImageStorageService;

  private constructor() {
    logger.info("ImageStorageService initialized");
  }

  /**
   * Gets the singleton instance of ImageStorageService.
   *
   * @returns ImageStorageService instance
   */
  public static getInstance(): ImageStorageService {
    if (!ImageStorageService.instance) {
      ImageStorageService.instance = new ImageStorageService();
    }
    return ImageStorageService.instance;
  }

  /**
   * Uploads an image to S3 with local caching.
   *
   * Process:
   * 1. Copy image to permanent local storage
   * 2. Create blob from local file
   * 3. Upload to S3 using Amplify Storage
   * 4. Return S3 key and local path
   *
   * If offline, image is saved locally and will be uploaded when connection is restored
   * via AppSync/DataStore sync.
   *
   * @param options - Upload options
   * @returns Promise resolving to upload result
   *
   * @example
   * ```typescript
   * const result = await ImageStorageService.getInstance().uploadImage({
   *   sourceUri: "file:///tmp/image.jpg",
   *   questionId: "q7",
   *   taskId: "task123",
   *   organizationId: "org123",
   *   studyId: "study456",
   * });
   *
   * console.log(result.s3Key);  // "data/org123/study456/task123_q7_1704211200000.jpg"
   * console.log(result.localPath);  // Local cached path
   * ```
   */
  public async uploadImage(
    options: UploadImageOptions
  ): Promise<UploadImageResult> {
    const {
      sourceUri,
      questionId,
      taskId,
      taskType,
      uuid,
      organizationId,
      studyId,
      studyInstanceId,
      contentType = "image/jpeg",
      saveLocalOnFailure = true,
    } = options;

    logger.info("Starting image upload", {
      questionId,
      taskId,
      taskType,
      uuid,
      organizationId,
      studyId,
    });

    try {
      // Step 1: Generate filename and copy to permanent storage
      const filename = generateImageFilename(
        questionId,
        taskId,
        taskType,
        uuid
      );
      const localPath = await copyImageToPermanentStorage(sourceUri, filename);

      logger.info("Image copied to permanent storage", { localPath, filename });

      // Step 2: Generate S3 key using same filename for consistency
      const s3Key = generateS3ImageKey({
        organizationId,
        studyId,
        studyInstanceId,
        taskId,
        questionId,
        filename, // Use same filename to ensure local and S3 paths match
      });

      logger.info("Generated S3 key", { s3Key });

      // Step 3: Create blob from local file
      const blob = await createBlobFromLocalFile(localPath, contentType);

      // Step 4: Upload to S3 using Amplify Storage
      try {
        const uploadResult = await uploadData({
          key: s3Key,
          data: blob,
          options: {
            contentType,
          },
        }).result;

        logger.info("Image uploaded to S3 successfully", {
          s3Key,
          size: blob.size,
        });

        return {
          s3Key,
          filename,
          localPath,
          uploadedToS3: true,
        };
      } catch (uploadError) {
        logger.warn("S3 upload failed, image saved locally for later sync", {
          error:
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError),
          s3Key,
        });

        // If upload fails but we want to save locally, return result
        // AppSync/DataStore will handle syncing the image reference
        // and we can retry upload later
        if (saveLocalOnFailure) {
          return {
            s3Key,
            filename,
            localPath,
            uploadedToS3: false,
          };
        }

        throw uploadError;
      }
    } catch (error) {
      logger.error(
        `Failed to upload image: questionId=${questionId}, taskId=${taskId}, sourceUri=${sourceUri}`,
        error
      );
      throw error;
    }
  }

  /**
   * Downloads an image from S3 or returns cached version.
   *
   * Process:
   * 1. Check if image exists in local cache
   * 2. If cached and useCache=true, return local path
   * 3. Otherwise, get pre-signed URL from S3
   * 4. Return URL for display
   *
   * @param options - Download options
   * @returns Promise resolving to download result
   *
   * @example
   * ```typescript
   * const result = await ImageStorageService.getInstance().downloadImage({
   *   s3Key: "data/org/study/task123_q7.jpg",
   *   useCache: true,
   * });
   *
   * // Use result.url in Image component
   * <Image source={{ uri: result.url }} />
   * ```
   */
  public async downloadImage(
    options: DownloadImageOptions
  ): Promise<DownloadImageResult> {
    const { s3Key, useCache = true, expiresIn = 900 } = options;

    logger.info("Downloading image", { s3Key, useCache });

    try {
      // Extract filename from S3 key
      const filename = extractFilenameFromS3Key(s3Key);

      if (!filename) {
        throw new Error(`Invalid S3 key format: ${s3Key}`);
      }

      // Check local cache first
      if (useCache) {
        const exists = await localImageExists(filename);

        if (exists) {
          const localPath = getLocalImagePath(filename);
          logger.info("Image found in local cache", { localPath });

          return {
            url: localPath,
            localPath,
            fromCache: true,
            expiresAt: Date.now() + expiresIn * 1000,
          };
        }
      }

      // Get pre-signed URL from S3
      logger.info("Fetching pre-signed URL from S3", { s3Key });

      const urlResult = await getUrl({
        key: s3Key,
        options: {
          expiresIn,
        },
      });

      const expiresAt = Date.now() + expiresIn * 1000;

      logger.info("Pre-signed URL generated", {
        s3Key,
        expiresAt: new Date(expiresAt).toISOString(),
      });

      return {
        url: urlResult.url.toString(),
        fromCache: false,
        expiresAt,
      };
    } catch (error) {
      logger.error(`Failed to download image: ${s3Key}`, error);
      throw error;
    }
  }

  /**
   * Deletes an image from both S3 and local cache.
   *
   * @param s3Key - S3 key of image to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * ```typescript
   * await ImageStorageService.getInstance().deleteImage(
   *   "data/org/study/task123_q7.jpg"
   * );
   * ```
   */
  public async deleteImage(s3Key: string): Promise<void> {
    logger.info("Deleting image", { s3Key });

    try {
      // Extract filename
      const filename = extractFilenameFromS3Key(s3Key);

      // Delete from local cache
      if (filename) {
        try {
          await deleteLocalImage(filename);
          logger.info("Image deleted from local cache", { filename });
        } catch (localError) {
          logger.warn("Failed to delete local image, continuing", {
            error:
              localError instanceof Error
                ? localError.message
                : String(localError),
          });
        }
      }

      // Delete from S3
      await remove({ key: s3Key });

      logger.info("Image deleted from S3", { s3Key });
    } catch (error) {
      logger.error(`Failed to delete image: ${s3Key}`, error);
      throw error;
    }
  }

  /**
   * Lists images in S3 for a given prefix.
   *
   * @param prefix - S3 key prefix to search
   * @param maxResults - Maximum number of results (default: 100)
   * @returns Promise resolving to array of S3 keys
   *
   * @example
   * ```typescript
   * const images = await ImageStorageService.getInstance().listImages(
   *   "data/org123/study456/"
   * );
   * ```
   */
  public async listImages(
    prefix: string,
    maxResults: number = 100
  ): Promise<string[]> {
    logger.info("Listing images", { prefix, maxResults });

    try {
      const result = await list({
        prefix,
        options: {
          listAll: false,
          pageSize: maxResults,
        },
      });

      const keys = result.items.map(item => item.key);

      logger.info("Images listed successfully", {
        prefix,
        count: keys.length,
      });

      return keys;
    } catch (error) {
      logger.error(`Failed to list images: ${prefix}`, error);
      throw error;
    }
  }

  /**
   * Gets the appropriate URI for displaying an image.
   *
   * Handles both S3 keys and local file URIs.
   * For S3 keys, checks local cache first, then falls back to S3.
   *
   * @param path - S3 key or local file URI
   * @param useCache - Whether to use cached version
   * @returns Promise resolving to displayable URI
   *
   * @example
   * ```typescript
   * const uri = await ImageStorageService.getInstance().getDisplayUri(
   *   "data/org/study/task123_q7.jpg"
   * );
   *
   * <Image source={{ uri }} />
   * ```
   */
  public async getDisplayUri(
    path: string | null | undefined,
    useCache: boolean = true
  ): Promise<string | null> {
    if (!path) return null;

    // If already a local file URI, return as-is
    if (isLocalFileUri(path)) {
      return path;
    }

    // If S3 key, download/get URL
    if (isS3Key(path)) {
      try {
        const result = await this.downloadImage({
          s3Key: path,
          useCache,
        });
        return result.url;
      } catch (error) {
        logger.error(`Failed to get display URI for S3 key: ${path}`, error);
        return null;
      }
    }

    // Unknown format
    logger.warn("Unknown path format", { path });
    return null;
  }
}

/**
 * Convenience function to get the ImageStorageService instance.
 *
 * @returns ImageStorageService instance
 */
export const getImageStorageService = (): ImageStorageService => {
  return ImageStorageService.getInstance();
};
