/**
 * File system utilities for image storage and management.
 *
 * Provides utilities for reading, writing, and managing image files
 * in the device's file system using expo-file-system.
 *
 * **IMPORTANT:** These utilities require expo-file-system native module.
 * Rebuild the app after adding expo-file-system to load the native module.
 *
 * @module fileSystemUtils
 */

import { getServiceLogger } from "@utils/logging/serviceLogger";
import * as FileSystem from "expo-file-system";

const logger = getServiceLogger("FileSystemUtils");

/**
 * Narrow unknown values to a basic object map.
 *
 * @param value - Value to check
 * @returns True if the value is a non-null object
 */
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

/**
 * Gets the Expo document directory URI across expo-file-system versions.
 *
 * expo-file-system v18 exports `documentDirectory` on the module.
 * expo-file-system v19 exports `Paths.document.uri`.
 *
 * @returns Document directory URI (always ends with "/")
 * @throws Error if the document directory cannot be determined
 */
const getDocumentDirectoryUri = (): string => {
  const fsUnknown: unknown = FileSystem;

  if (isRecord(fsUnknown)) {
    const paths = fsUnknown["Paths"];
    if (isRecord(paths)) {
      const document = paths["document"];
      if (isRecord(document)) {
        const uri = document["uri"];
        if (typeof uri === "string" && uri.length > 0) {
          return uri.endsWith("/") ? uri : `${uri}/`;
        }
      }
    }

    const documentDirectory = fsUnknown["documentDirectory"];
    if (typeof documentDirectory === "string" && documentDirectory.length > 0) {
      return documentDirectory.endsWith("/")
        ? documentDirectory
        : `${documentDirectory}/`;
    }
  }

  throw new Error("expo-file-system: unable to determine document directory");
};

/**
 * Determines whether we can use the expo-file-system v19+ object API (File/Directory).
 *
 * @returns True if v19+ API is available
 */
const hasV19ObjectApi = (): boolean => {
  const fsUnknown: unknown = FileSystem;
  if (!isRecord(fsUnknown)) return false;

  // Keep this check intentionally minimal and runtime-based.
  // We only use v19 path when Paths.document.uri is present.
  const paths = fsUnknown["Paths"];
  if (!isRecord(paths)) return false;
  const document = paths["document"];
  if (!isRecord(document)) return false;
  return typeof document["uri"] === "string";
};

/**
 * Returns true if a file/directory exists for the given URI.
 *
 * @param uri - File or directory URI
 * @returns Promise resolving to true if it exists
 */
const existsAtUri = async (uri: string): Promise<boolean> => {
  if (hasV19ObjectApi()) {
    const fsUnknown: unknown = FileSystem;
    if (isRecord(fsUnknown)) {
      const FileCtor = fsUnknown["File"];
      const DirectoryCtor = fsUnknown["Directory"];

      const isDir = uri.endsWith("/");

      if (typeof DirectoryCtor === "function" && isDir) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const dir = new (DirectoryCtor as new (...args: unknown[]) => unknown)(
          uri
        );
        if (isRecord(dir) && typeof dir["exists"] === "boolean") {
          return dir["exists"];
        }
      }

      if (typeof FileCtor === "function" && !isDir) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const file = new (FileCtor as new (...args: unknown[]) => unknown)(uri);
        if (isRecord(file) && typeof file["exists"] === "boolean") {
          return file["exists"];
        }
      }
    }
  }

  const info = await FileSystem.getInfoAsync(uri);
  return info.exists;
};

/**
 * Creates a directory at the given URI, including intermediates when supported.
 *
 * @param uri - Directory URI
 */
const createDirectoryAtUri = async (uri: string): Promise<void> => {
  if (hasV19ObjectApi()) {
    const fsUnknown: unknown = FileSystem;
    if (isRecord(fsUnknown)) {
      const DirectoryCtor = fsUnknown["Directory"];
      if (typeof DirectoryCtor === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const dir = new (DirectoryCtor as new (...args: unknown[]) => unknown)(
          uri
        );
        if (isRecord(dir) && typeof dir["create"] === "function") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          (dir["create"] as (options?: unknown) => unknown)({
            intermediates: true,
            idempotent: true,
          });
          return;
        }
      }
    }
  }

  await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
};

/**
 * Copies a file from `fromUri` to `toUri`.
 *
 * @param fromUri - Source file URI
 * @param toUri - Destination file URI
 */
const copyFile = async (fromUri: string, toUri: string): Promise<void> => {
  if (hasV19ObjectApi()) {
    const fsUnknown: unknown = FileSystem;
    if (isRecord(fsUnknown)) {
      const FileCtor = fsUnknown["File"];
      if (typeof FileCtor === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const fromFile = new (FileCtor as new (...args: unknown[]) => unknown)(
          fromUri
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const toFile = new (FileCtor as new (...args: unknown[]) => unknown)(
          toUri
        );
        if (isRecord(fromFile) && typeof fromFile["copy"] === "function") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          (fromFile["copy"] as (dest: unknown) => unknown)(toFile);
          return;
        }
      }
    }
  }

  await FileSystem.copyAsync({ from: fromUri, to: toUri });
};

/**
 * Reads a file as base64.
 *
 * @param uri - File URI
 * @returns Base64 string
 */
const readFileAsBase64 = async (uri: string): Promise<string> => {
  if (hasV19ObjectApi()) {
    const fsUnknown: unknown = FileSystem;
    if (isRecord(fsUnknown)) {
      const FileCtor = fsUnknown["File"];
      if (typeof FileCtor === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const file = new (FileCtor as new (...args: unknown[]) => unknown)(uri);
        if (isRecord(file) && typeof file["base64"] === "function") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          return (file["base64"] as () => Promise<string>)();
        }
      }
    }
  }

  // Use string encoding literal for cross-version compatibility.
  return FileSystem.readAsStringAsync(uri, { encoding: "base64" });
};

/**
 * Deletes a file at the given URI.
 *
 * @param uri - File URI
 */
const deleteFileAtUri = async (uri: string): Promise<void> => {
  if (hasV19ObjectApi()) {
    const fsUnknown: unknown = FileSystem;
    if (isRecord(fsUnknown)) {
      const FileCtor = fsUnknown["File"];
      if (typeof FileCtor === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const file = new (FileCtor as new (...args: unknown[]) => unknown)(uri);
        if (isRecord(file) && typeof file["delete"] === "function") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          (file["delete"] as () => unknown)();
          return;
        }
      }
    }
  }

  await FileSystem.deleteAsync(uri);
};

/**
 * Lists filenames in a directory URI.
 *
 * @param uri - Directory URI
 * @returns Array of filenames (not full URIs)
 */
const listDirectoryFilenames = async (uri: string): Promise<string[]> => {
  if (hasV19ObjectApi()) {
    const fsUnknown: unknown = FileSystem;
    if (isRecord(fsUnknown)) {
      const DirectoryCtor = fsUnknown["Directory"];
      if (typeof DirectoryCtor === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const dir = new (DirectoryCtor as new (...args: unknown[]) => unknown)(
          uri
        );
        if (isRecord(dir) && typeof dir["list"] === "function") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          const entries = (dir["list"] as () => unknown[])();
          return entries
            .map(entry => {
              if (isRecord(entry) && typeof entry["name"] === "string") {
                return entry["name"];
              }
              return null;
            })
            .filter((name): name is string => typeof name === "string");
        }
      }
    }
  }

  return FileSystem.readDirectoryAsync(uri);
};

/**
 * Image storage configuration
 */
export const IMAGE_STORAGE_CONFIG = {
  /** Directory name for image storage */
  DIRECTORY: "ImageCapture",
  /** File extension for images */
  EXTENSION: ".jpg",
  /** Image quality for compression (0-1) */
  QUALITY: 0.8,
} as const;

/**
 * Gets the full path to the image storage directory.
 *
 * @returns Full path to image directory
 *
 * @example
 * ```typescript
 * const dir = getImageDirectory();
 * // Returns: "file:///data/user/0/com.app/files/ImageCapture/"
 * ```
 */
export const getImageDirectory = (): string => {
  return `${getDocumentDirectoryUri()}${IMAGE_STORAGE_CONFIG.DIRECTORY}/`;
};

/**
 * Ensures the image storage directory exists, creating it if necessary.
 *
 * @returns Promise that resolves when directory is ready
 *
 * @example
 * ```typescript
 * await ensureImageDirectoryExists();
 * // Directory is now ready for use
 * ```
 */
export const ensureImageDirectoryExists = async (): Promise<void> => {
  const directory = getImageDirectory();

  try {
    const exists = await existsAtUri(directory);

    if (!exists) {
      logger.info("Creating image storage directory", { directory });
      await createDirectoryAtUri(directory);
      logger.info("Image storage directory created", { directory });
    }
  } catch (error) {
    logger.error(
      `Failed to ensure image directory exists: ${directory}`,
      error
    );
    throw error;
  }
};

/**
 * Generates a unique filename for an image following Lumiere convention with timestamp.
 *
 * Format: {baseName}_{questionId}_{timestamp}.jpg
 * where baseName = EPISODIC_{uuid} for episodic tasks or {taskId} for other tasks
 *
 * @param questionId - Question identifier
 * @param taskId - Task identifier (required for non-episodic tasks)
 * @param taskType - Task type (EPISODIC, SCHEDULED, TIMED)
 * @param uuid - UUID for episodic tasks (taskInstanceId)
 * @returns Unique filename with timestamp and extension
 *
 * @example
 * ```typescript
 * // Episodic task
 * const filename1 = generateImageFilename("q7", "task123", "EPISODIC", "uuid-abc-123");
 * // Returns: "EPISODIC_uuid-abc-123_q7_1704211200000.jpg"
 *
 * // Regular task
 * const filename2 = generateImageFilename("q7", "task123", "SCHEDULED");
 * // Returns: "task123_q7_1704211200000.jpg"
 *
 * // Fallback (no task context)
 * const filename3 = generateImageFilename("q7");
 * // Returns: "q7_1704211200000.jpg"
 * ```
 */
export const generateImageFilename = (
  questionId: string,
  taskId?: string,
  taskType?: string,
  uuid?: string
): string => {
  // Build baseName based on taskType
  let baseName: string;

  if (taskType === "EPISODIC" && uuid) {
    baseName = `EPISODIC_${uuid}`;
  } else if (taskId) {
    baseName = taskId;
  } else {
    // No baseName - just use questionId
    baseName = "";
  }

  // Generate timestamp
  const timestamp = Date.now();

  // Construct filename: baseName_questionId_timestamp.ext or questionId_timestamp.ext
  if (baseName) {
    return `${baseName}_${questionId}_${timestamp}${IMAGE_STORAGE_CONFIG.EXTENSION}`;
  } else {
    return `${questionId}_${timestamp}${IMAGE_STORAGE_CONFIG.EXTENSION}`;
  }
};

/**
 * Gets the full local path for an image file.
 *
 * @param filename - Image filename
 * @returns Full local file path
 *
 * @example
 * ```typescript
 * const path = getLocalImagePath("image.jpg");
 * // Returns: "file:///data/user/0/com.app/files/ImageCapture/image.jpg"
 * ```
 */
export const getLocalImagePath = (filename: string): string => {
  return `${getImageDirectory()}${filename}`;
};

/**
 * Copies an image from a temporary location to permanent storage.
 *
 * @param sourceUri - Source URI (from camera/gallery)
 * @param filename - Destination filename
 * @returns Promise resolving to the permanent file path
 *
 * @example
 * ```typescript
 * const permanentPath = await copyImageToPermanentStorage(
 *   "file:///tmp/image.jpg",
 *   "task123_q7.jpg"
 * );
 * ```
 */
export const copyImageToPermanentStorage = async (
  sourceUri: string,
  filename: string
): Promise<string> => {
  try {
    // Ensure directory exists
    await ensureImageDirectoryExists();

    const destinationPath = getLocalImagePath(filename);

    logger.info("Copying image to permanent storage", {
      sourceUri,
      destinationPath,
    });

    await copyFile(sourceUri, destinationPath);

    logger.info("Image copied successfully", { destinationPath });

    return destinationPath;
  } catch (error) {
    logger.error(
      `Failed to copy image to permanent storage: ${sourceUri} -> ${filename}`,
      error
    );
    throw error;
  }
};

/**
 * Reads an image file as base64 string.
 *
 * @param filepath - Full path to image file
 * @returns Promise resolving to base64 string
 *
 * @example
 * ```typescript
 * const base64 = await readImageAsBase64("file:///path/to/image.jpg");
 * // Use base64 for upload
 * ```
 */
export const readImageAsBase64 = async (filepath: string): Promise<string> => {
  try {
    logger.info("Reading image as base64", { filepath });

    const base64 = await readFileAsBase64(filepath);

    logger.info("Image read successfully", {
      filepath,
      size: base64.length,
    });

    return base64;
  } catch (error) {
    logger.error(`Failed to read image as base64: ${filepath}`, error);
    throw error;
  }
};

/**
 * Creates a Blob from a local file URI.
 *
 * This is the React Native compatible way to create blobs for S3 uploads.
 * Uses the fetch API which properly handles local file URIs in React Native.
 *
 * @param filepath - Local file URI (e.g., "file:///path/to/image.jpg")
 * @param contentType - Optional MIME type (default: "image/jpeg")
 * @returns Promise resolving to Blob
 *
 * @example
 * ```typescript
 * const blob = await createBlobFromLocalFile(
 *   "file:///path/to/image.jpg",
 *   "image/jpeg"
 * );
 * // Use blob for S3 upload
 * ```
 */
export const createBlobFromLocalFile = async (
  filepath: string,
  contentType: string = "image/jpeg"
): Promise<Blob> => {
  try {
    logger.info("Creating blob from local file", { filepath, contentType });

    const response = await fetch(filepath);
    const blob = await response.blob();

    logger.info("Blob created from local file", {
      filepath,
      size: blob.size,
      type: blob.type,
    });

    return blob;
  } catch (error) {
    logger.error(`Failed to create blob from local file: ${filepath}`, error);
    throw error;
  }
};

/**
 * Deletes an image file from local storage.
 *
 * @param filename - Image filename to delete
 * @returns Promise that resolves when deletion is complete
 *
 * @example
 * ```typescript
 * await deleteLocalImage("task123_q7.jpg");
 * ```
 */
export const deleteLocalImage = async (filename: string): Promise<void> => {
  try {
    const filepath = getLocalImagePath(filename);

    logger.info("Deleting local image", { filepath });

    const exists = await existsAtUri(filepath);

    if (exists) {
      await deleteFileAtUri(filepath);
      logger.info("Image deleted successfully", { filepath });
    } else {
      logger.warn("Image file does not exist", { filepath });
    }
  } catch (error) {
    logger.error(`Failed to delete local image: ${filename}`, error);
    throw error;
  }
};

/**
 * Checks if a local image file exists.
 *
 * @param filename - Image filename to check
 * @returns Promise resolving to true if file exists
 *
 * @example
 * ```typescript
 * const exists = await localImageExists("task123_q7.jpg");
 * if (exists) {
 *   // Use local file
 * }
 * ```
 */
export const localImageExists = async (filename: string): Promise<boolean> => {
  try {
    const filepath = getLocalImagePath(filename);
    return await existsAtUri(filepath);
  } catch (error) {
    logger.error(`Failed to check if local image exists: ${filename}`, error);
    return false;
  }
};

/**
 * Gets information about a local image file.
 *
 * @param filename - Image filename
 * @returns Promise resolving to file info or null if not found
 *
 * @example
 * ```typescript
 * const info = await getLocalImageInfo("task123_q7.jpg");
 * console.log(info?.size, info?.modificationTime);
 * ```
 */
export const getLocalImageInfo = async (
  filename: string
): Promise<FileSystem.FileInfo | null> => {
  try {
    const filepath = getLocalImagePath(filename);
    // In v19+, `getInfoAsync` exists but is deprecated/throws; we only call it in
    // environments where the legacy API is available.
    const fileInfo = await FileSystem.getInfoAsync(filepath);

    if (fileInfo.exists) {
      return fileInfo;
    }

    return null;
  } catch (error) {
    logger.error(`Failed to get local image info: ${filename}`, error);
    return null;
  }
};

/**
 * Clears all images from local storage.
 * Use with caution - this deletes all cached images.
 *
 * @returns Promise resolving to number of files deleted
 *
 * @example
 * ```typescript
 * const deletedCount = await clearAllLocalImages();
 * console.log(`Deleted ${deletedCount} images`);
 * ```
 */
export const clearAllLocalImages = async (): Promise<number> => {
  try {
    const directory = getImageDirectory();

    logger.info("Clearing all local images", { directory });

    const exists = await existsAtUri(directory);

    if (!exists) {
      logger.info("Image directory does not exist, nothing to clear");
      return 0;
    }

    const files = await listDirectoryFilenames(directory);

    logger.info("Found images to delete", { count: files.length });

    for (const file of files) {
      await deleteFileAtUri(`${directory}${file}`);
    }

    logger.info("All local images cleared", { count: files.length });

    return files.length;
  } catch (error) {
    logger.error("Failed to clear all local images", error);
    throw error;
  }
};
