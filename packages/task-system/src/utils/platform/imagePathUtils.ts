/**
 * Image path generation utilities for S3 storage.
 *
 * Provides utilities for generating S3 keys and managing image paths
 * in a hierarchical structure compatible with multi-tenant architecture.
 *
 * @module imagePathUtils
 */

/**
 * Configuration for S3 image paths
 */
export const S3_PATH_CONFIG = {
  /** Base prefix for all image data */
  BASE_PREFIX: "data",
  /** Separator for path components */
  SEPARATOR: "/",
} as const;

/**
 * Options for generating S3 image paths
 */
export interface S3ImagePathOptions {
  /** Organization or parent identifier */
  organizationId?: string;
  /** Study or project identifier */
  studyId?: string;
  /** Study instance identifier */
  studyInstanceId?: string;
  /** Task identifier */
  taskId?: string;
  /** Question identifier */
  questionId: string;
  /** File extension (default: .jpg) */
  extension?: string;
  /** Pre-generated filename to use instead of generating new one */
  filename?: string;
}

/**
 * Generates an S3 key for an image file.
 *
 * Creates a hierarchical path structure:
 * `data/{organizationId}/{studyId}/{studyInstanceId}/{imageUUID}_{questionId}.jpg`
 * where imageUUID = EPISODIC_{uuid} for episodic tasks or taskId for other tasks
 *
 * @param options - Path generation options
 * @returns S3 key string
 *
 * @example
 * ```typescript
 * const s3Key = generateS3ImageKey({
 *   organizationId: "org123",
 *   studyId: "study456",
 *   studyInstanceId: "instance789",
 *   filename: "EPISODIC_uuid123_q7.jpg",
 * });
 * // Returns: "data/org123/study456/instance789/EPISODIC_uuid123_q7.jpg"
 * ```
 */
export const generateS3ImageKey = (options: S3ImagePathOptions): string => {
  const {
    organizationId,
    studyId,
    studyInstanceId,
    taskId,
    questionId,
    extension = ".jpg",
    filename: providedFilename,
  } = options;

  // Use provided filename if available, otherwise generate new one
  const filename =
    providedFilename ||
    (() => {
      const timestamp = Date.now();
      return taskId
        ? `${taskId}_${questionId}_${timestamp}${extension}`
        : `${questionId}_${timestamp}${extension}`;
    })();

  const pathComponents: string[] = [S3_PATH_CONFIG.BASE_PREFIX];

  if (organizationId) {
    pathComponents.push(organizationId);
  }

  if (studyId) {
    pathComponents.push(studyId);
  }

  if (studyInstanceId) {
    // Replace # with _ for filesystem compatibility
    const sanitizedInstanceId = studyInstanceId.replace(/#/g, "_");
    pathComponents.push(sanitizedInstanceId);
  }

  pathComponents.push(filename);

  return pathComponents.join(S3_PATH_CONFIG.SEPARATOR);
};

/**
 * Parses an S3 key to extract components.
 *
 * @param s3Key - S3 key to parse
 * @returns Parsed components or null if invalid
 *
 * @example
 * ```typescript
 * const parsed = parseS3ImageKey("data/org123/study456/instance789/EPISODIC_uuid_q7.jpg");
 * // Returns: {
 * //   organizationId: "org123",
 * //   studyId: "study456",
 * //   studyInstanceId: "instance789",
 * //   filename: "EPISODIC_uuid_q7.jpg"
 * // }
 * ```
 */
export const parseS3ImageKey = (
  s3Key: string
): {
  organizationId?: string;
  studyId?: string;
  studyInstanceId?: string;
  filename: string;
} | null => {
  if (!s3Key || !s3Key.startsWith(S3_PATH_CONFIG.BASE_PREFIX)) {
    return null;
  }

  const components = s3Key.split(S3_PATH_CONFIG.SEPARATOR);

  // Remove base prefix
  components.shift();

  if (components.length === 0) {
    return null;
  }

  // Last component is always filename
  const filename = components.pop()!;

  // Remaining components are hierarchy (optional)
  const [organizationId, studyId, studyInstanceId] = components;

  return {
    organizationId,
    studyId,
    studyInstanceId,
    filename,
  };
};

/**
 * Extracts the filename from an S3 key.
 *
 * @param s3Key - S3 key
 * @returns Filename or null if invalid
 *
 * @example
 * ```typescript
 * const filename = extractFilenameFromS3Key("data/org/study/EPISODIC_uuid_q7.jpg");
 * // Returns: "EPISODIC_uuid_q7.jpg"
 * ```
 */
export const extractFilenameFromS3Key = (s3Key: string): string | null => {
  const parsed = parseS3ImageKey(s3Key);
  return parsed?.filename || null;
};

/**
 * Checks if a string is a valid S3 key format.
 *
 * @param path - Path to check
 * @returns True if valid S3 key format
 *
 * @example
 * ```typescript
 * isS3Key("data/org/study/image.jpg");  // true
 * isS3Key("file:///local/path/image.jpg"); // false
 * isS3Key("image.jpg");                    // false
 * ```
 */
export const isS3Key = (path: string): boolean => {
  if (!path) return false;

  // S3 keys start with the base prefix
  if (!path.startsWith(S3_PATH_CONFIG.BASE_PREFIX)) {
    return false;
  }

  // Should not contain file:// or other protocols
  if (path.includes("://")) {
    return false;
  }

  return true;
};

/**
 * Checks if a string is a local file URI.
 *
 * @param path - Path to check
 * @returns True if local file URI
 *
 * @example
 * ```typescript
 * isLocalFileUri("file:///path/to/image.jpg");  // true
 * isLocalFileUri("data/org/study/image.jpg"); // false
 * ```
 */
export const isLocalFileUri = (path: string): boolean => {
  if (!path) return false;
  return path.startsWith("file://") || path.startsWith("/");
};

/**
 * Generates a simple filename from task and question IDs.
 *
 * @param taskId - Task identifier
 * @param questionId - Question identifier
 * @param extension - File extension (default: .jpg)
 * @returns Filename string
 *
 * @example
 * ```typescript
 * const filename = generateSimpleFilename("task123", "q7");
 * // Returns: "task123_q7_1704211200000.jpg"
 * ```
 */
export const generateSimpleFilename = (
  taskId: string,
  questionId: string,
  extension: string = ".jpg"
): string => {
  const timestamp = Date.now();
  return `${taskId}_${questionId}_${timestamp}${extension}`;
};

/**
 * Sanitizes a string for use in file paths.
 * Removes or replaces characters that are invalid in filenames.
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 *
 * @example
 * ```typescript
 * const safe = sanitizeForFilename("Task #123");
 * // Returns: "Task_123"
 * ```
 */
export const sanitizeForFilename = (input: string): string => {
  return input
    .replace(/[#<>:"/\\|?*]/g, "_") // Replace invalid chars with underscore
    .replace(/\s+/g, "_") // Replace spaces with underscore
    .replace(/_+/g, "_") // Collapse multiple underscores
    .trim();
};

/**
 * Gets the directory portion of an S3 key (without filename).
 *
 * @param s3Key - S3 key
 * @returns Directory path or null
 *
 * @example
 * ```typescript
 * const dir = getS3Directory("data/org/study/instance/file.jpg");
 * // Returns: "data/org/study/instance"
 * ```
 */
export const getS3Directory = (s3Key: string): string | null => {
  if (!isS3Key(s3Key)) {
    return null;
  }

  const lastSlashIndex = s3Key.lastIndexOf(S3_PATH_CONFIG.SEPARATOR);

  if (lastSlashIndex === -1) {
    return null;
  }

  return s3Key.substring(0, lastSlashIndex);
};

/**
 * Builds an S3 key from directory and filename.
 *
 * @param directory - S3 directory path
 * @param filename - Filename
 * @returns Complete S3 key
 *
 * @example
 * ```typescript
 * const key = buildS3Key("data/org/study", "image.jpg");
 * // Returns: "data/org/study/image.jpg"
 * ```
 */
export const buildS3Key = (directory: string, filename: string): string => {
  // Remove trailing slash from directory if present
  const cleanDir = directory.endsWith(S3_PATH_CONFIG.SEPARATOR)
    ? directory.slice(0, -1)
    : directory;

  return `${cleanDir}${S3_PATH_CONFIG.SEPARATOR}${filename}`;
};
