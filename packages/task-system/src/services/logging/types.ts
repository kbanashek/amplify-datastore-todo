/**
 * Logging service types and interfaces
 */

/**
 * Log levels supported by the logging service
 */
export enum LogLevel {
  VERBOSE = "verbose",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Log level presets for common configurations
 */
export enum LogLevelPreset {
  VERBOSE = "verbose", // All logs (VERBOSE, DEBUG, INFO, WARN, ERROR)
  DEBUG = "debug", // DEBUG, INFO, WARN, ERROR
  INFO = "info", // INFO, WARN, ERROR (default in dev)
  WARN = "warn", // WARN, ERROR (default in prod)
  ERROR_ONLY = "error-only", // Only ERROR logs
}

/**
 * Metadata that can be attached to log entries
 */
export interface LogMetadata {
  [key: string]: unknown;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  timestamp: Date;
  platform: string;
  serviceName?: string;
  step?: string;
  icon?: string;
}

/**
 * Interface that all log providers must implement
 */
export interface LogProvider {
  /**
   * Log a message with the specified level
   * @param entry - The log entry to process
   */
  log(entry: LogEntry): void;

  /**
   * Get the name of this provider
   */
  getName(): string;

  /**
   * Check if this provider is enabled
   */
  isEnabled(): boolean;

  /**
   * Enable or disable this provider
   */
  setEnabled(enabled: boolean): void;
}

/**
 * Configuration for the logging service
 */
export interface LoggingConfig {
  /**
   * Minimum log level to process (logs below this level are ignored)
   * Can also use LogLevelPreset for convenience
   */
  minLevel?: LogLevel | LogLevelPreset;

  /**
   * Whether to include platform information in logs
   */
  includePlatform?: boolean;

  /**
   * Whether to include timestamps in logs
   */
  includeTimestamp?: boolean;

  /**
   * Default service name for logs without explicit service name
   */
  defaultServiceName?: string;

  /**
   * Format logs as single lines (inline metadata instead of separate objects)
   */
  singleLine?: boolean;

  /**
   * Use multi-line formatting for metadata (readable, one key per line)
   * When true, metadata is formatted as multi-line with automatic JSON parsing
   * When false, falls back to inline formatting
   */
  multiLineMetadata?: boolean;

  /**
   * Use sequence diagram formatting for initialization logs (with arrows/indentation)
   */
  sequenceDiagram?: boolean;
}
