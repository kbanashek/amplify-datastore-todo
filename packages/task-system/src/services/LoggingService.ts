/**
 * Centralized logging service
 * Manages multiple log providers and routes logs to all active providers
 */

import { ConsoleProvider } from "@services/logging/providers/ConsoleProvider";
import { NativeProvider } from "@services/logging/providers/NativeProvider";
import { SentryProvider } from "@services/logging/providers/SentryProvider";
import type {
  LogEntry,
  LogMetadata,
  LogProvider,
  LoggingConfig,
} from "@services/logging/types";
import { LogLevel, LogLevelPreset } from "@services/logging/types";
import { presetToLogLevel } from "@services/logging/utils";
import { getPlatformIcon } from "@utils/platformIcons";

/**
 * Get platform identifier for logging
 */
function getPlatformId(): string {
  return getPlatformIcon();
}

/**
 * Log level priority (lower number = higher priority)
 */
const LOG_LEVEL_PRIORITY: { [key in LogLevel]: number } = {
  [LogLevel.VERBOSE]: -1,
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

export class LoggingService {
  private providers: LogProvider[] = [];
  private config: LoggingConfig;
  private defaultServiceName: string = "App";
  private static hasLoggedInitialLevel = false; // Module-level deduplication

  constructor(config: LoggingConfig = {}) {
    // Convert preset to LogLevel if needed
    let minLevel: LogLevel;
    if (
      config.minLevel &&
      Object.values(LogLevelPreset).includes(config.minLevel as LogLevelPreset)
    ) {
      minLevel = presetToLogLevel(config.minLevel as LogLevelPreset);
    } else {
      minLevel =
        (config.minLevel as LogLevel) ??
        (__DEV__ ? LogLevel.INFO : LogLevel.WARN);
    }

    this.config = {
      minLevel,
      includePlatform: config.includePlatform ?? true,
      includeTimestamp: config.includeTimestamp ?? true,
      defaultServiceName: config.defaultServiceName ?? "App",
      singleLine: config.singleLine ?? true, // Default to single-line logs
      sequenceDiagram: config.sequenceDiagram ?? true, // Default to sequence diagram for init
    };

    this.defaultServiceName = this.config.defaultServiceName ?? "App";

    // Initialize default providers with config
    this.initializeDefaultProviders();

    // Log the configured log level as the first log (after providers are initialized)
    // Only log once per app lifecycle (module-level deduplication prevents duplicates)
    this.logInitialLogLevel();
  }

  /**
   * Log the current log level configuration
   * This is the first log that appears when the app initializes
   * Bypasses minLevel check to ensure it always appears
   * Uses module-level deduplication to prevent duplicate logs
   */
  private logInitialLogLevel(): void {
    // Prevent duplicate logs across multiple LoggingService instances
    if (LoggingService.hasLoggedInitialLevel) {
      return;
    }
    LoggingService.hasLoggedInitialLevel = true;

    const minLevel =
      this.config.minLevel ?? (__DEV__ ? LogLevel.INFO : LogLevel.WARN);
    const levelName = this.getLogLevelPreset();
    const platform = getPlatformId();

    // Format metadata as readable list
    const metadataList = [
      `  • minLevel: ${levelName.toLowerCase()}`,
      `  • preset: ${levelName}`,
    ].join("\n");

    // Create log entry directly, bypassing minLevel check
    // This ensures the log level message always appears first
    const entry = this.createLogEntry(
      LogLevel.INFO, // Use INFO level but bypass filtering
      `Log level set to ${levelName}\n${metadataList}`,
      { minLevel, preset: levelName },
      "LoggingService",
      "INIT-0",
      "📊"
    );

    // Route directly to all enabled providers (bypass minLevel check)
    for (const provider of this.providers) {
      if (provider.isEnabled()) {
        try {
          provider.log(entry);
        } catch (_error) {
          // If provider fails, fall back to console
          if (__DEV__) {
            console.error(
              `[${platform}::LoggingService - INIT-0] : 📊 Log level set to ${levelName}`
            );
          }
        }
      }
    }
  }

  /**
   * Get the current log level preset name for display
   */
  private getLogLevelPreset(): string {
    const minLevel =
      this.config.minLevel ?? (__DEV__ ? LogLevel.INFO : LogLevel.WARN);
    if (minLevel === LogLevel.VERBOSE) return "VERBOSE";
    if (minLevel === LogLevel.DEBUG) return "DEBUG";
    if (minLevel === LogLevel.INFO) return "INFO";
    if (minLevel === LogLevel.WARN) return "WARN";
    if (minLevel === LogLevel.ERROR) return "ERROR_ONLY";
    return "UNKNOWN";
  }

  /**
   * Initialize default log providers
   */
  private initializeDefaultProviders(): void {
    // Console provider is always enabled
    const consoleProvider = new ConsoleProvider({
      singleLine: this.config.singleLine ?? true,
      sequenceDiagram: this.config.sequenceDiagram ?? true,
    });
    this.addProvider(consoleProvider);

    // Native provider for offline testing (enabled in dev/test)
    if (__DEV__ || process.env.NODE_ENV === "test") {
      const nativeProvider = new NativeProvider({
        singleLine: this.config.singleLine ?? true,
        sequenceDiagram: this.config.sequenceDiagram ?? true,
      });
      this.addProvider(nativeProvider);
    }

    // Sentry provider (disabled by default, enable when Sentry is configured)
    const sentryProvider = new SentryProvider();
    this.addProvider(sentryProvider);
  }

  /**
   * Add a log provider
   */
  addProvider(provider: LogProvider): void {
    this.providers.push(provider);
  }

  /**
   * Remove a log provider by name
   */
  removeProvider(providerName: string): void {
    this.providers = this.providers.filter(p => p.getName() !== providerName);
  }

  /**
   * Get a provider by name
   */
  getProvider(providerName: string): LogProvider | undefined {
    return this.providers.find(p => p.getName() === providerName);
  }

  /**
   * Enable or disable a provider
   */
  setProviderEnabled(providerName: string, enabled: boolean): void {
    const provider = this.getProvider(providerName);
    if (provider) {
      provider.setEnabled(enabled);
    }
  }

  /**
   * Set minimum log level (can use LogLevel or LogLevelPreset)
   */
  setMinLevel(level: LogLevel | LogLevelPreset): void {
    if (Object.values(LogLevelPreset).includes(level as LogLevelPreset)) {
      this.config.minLevel = presetToLogLevel(level as LogLevelPreset);
    } else {
      this.config.minLevel = level as LogLevel;
    }
  }

  /**
   * Create a log entry and route it to all active providers
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    serviceName?: string,
    step?: string,
    icon?: string
  ): LogEntry {
    return {
      level,
      message,
      metadata,
      timestamp: new Date(),
      platform: this.config.includePlatform ? getPlatformId() : "",
      serviceName: serviceName ?? this.defaultServiceName,
      step,
      icon,
    };
  }

  /**
   * Internal log method that routes to all providers
   * Level is determined by which public method was called, not passed as parameter
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    serviceName?: string,
    step?: string,
    icon?: string
  ): void {
    // Check if log level meets minimum threshold from configuration
    const minLevel = this.config.minLevel;
    if (minLevel) {
      // Convert preset to LogLevel if needed
      const minLevelValue: LogLevel = Object.values(LogLevelPreset).includes(
        minLevel as LogLevelPreset
      )
        ? presetToLogLevel(minLevel as LogLevelPreset)
        : (minLevel as LogLevel);
      const minPriority = LOG_LEVEL_PRIORITY[minLevelValue];
      const logPriority = LOG_LEVEL_PRIORITY[level];
      if (logPriority < minPriority) {
        return; // Log level is below configured minimum, ignore
      }
    }

    const entry = this.createLogEntry(
      level,
      message,
      metadata,
      serviceName,
      step,
      icon
    );

    // Route to all enabled providers
    for (const provider of this.providers) {
      if (provider.isEnabled()) {
        try {
          provider.log(entry);
        } catch (error) {
          // If a provider fails, log the error but don't break the app
          if (__DEV__) {
            console.error(
              `[LoggingService] Provider ${provider.getName()} failed:`,
              error
            );
          }
        }
      }
    }
  }

  /**
   * Log a verbose message (most detailed, only in dev)
   */
  verbose(
    message: string,
    metadata?: LogMetadata,
    serviceName?: string,
    step?: string,
    icon?: string
  ): void {
    this.log(LogLevel.VERBOSE, message, metadata, serviceName, step, icon);
  }

  /**
   * Log a debug message
   */
  debug(
    message: string,
    metadata?: LogMetadata,
    serviceName?: string,
    step?: string,
    icon?: string
  ): void {
    this.log(LogLevel.DEBUG, message, metadata, serviceName, step, icon);
  }

  /**
   * Log an info message
   */
  info(
    message: string,
    metadata?: LogMetadata,
    serviceName?: string,
    step?: string,
    icon?: string
  ): void {
    this.log(LogLevel.INFO, message, metadata, serviceName, step, icon);
  }

  /**
   * Log a warning message
   */
  warn(
    message: string,
    metadata?: LogMetadata,
    serviceName?: string,
    step?: string,
    icon?: string
  ): void {
    this.log(LogLevel.WARN, message, metadata, serviceName, step, icon);
  }

  /**
   * Log an error message
   */
  error(
    message: string,
    error?: unknown,
    serviceName?: string,
    step?: string,
    icon?: string
  ): void {
    const errorMessage =
      error instanceof Error ? error.message : error ? String(error) : "";
    const fullMessage = errorMessage ? `${message} - ${errorMessage}` : message;

    const metadata: LogMetadata = {};
    if (error instanceof Error) {
      metadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      metadata.error = error;
    }

    this.log(
      LogLevel.ERROR,
      fullMessage,
      metadata,
      serviceName,
      step,
      icon || "❌"
    );
  }

  /**
   * Create a logger instance with a default service name
   * Useful for creating service-specific loggers
   */
  createLogger(serviceName: string) {
    return {
      verbose: (
        message: string,
        metadata?: LogMetadata,
        step?: string,
        icon?: string
      ) => this.verbose(message, metadata, serviceName, step, icon),
      debug: (
        message: string,
        metadata?: LogMetadata,
        step?: string,
        icon?: string
      ) => this.debug(message, metadata, serviceName, step, icon),
      info: (
        message: string,
        metadata?: LogMetadata,
        step?: string,
        icon?: string
      ) => this.info(message, metadata, serviceName, step, icon),
      warn: (
        message: string,
        metadata?: LogMetadata,
        step?: string,
        icon?: string
      ) => this.warn(message, metadata, serviceName, step, icon),
      error: (message: string, error?: unknown, step?: string, icon?: string) =>
        this.error(message, error, serviceName, step, icon),
    };
  }
}

// Export singleton instance (will be initialized by LoggingProvider)
export let loggingService: LoggingService | null = null;

/**
 * Initialize the logging service
 * Should be called once during app initialization
 */
export function initializeLoggingService(
  config?: LoggingConfig
): LoggingService {
  if (loggingService) {
    console.warn(
      "[LoggingService] Service already initialized, returning existing instance"
    );
    return loggingService;
  }

  loggingService = new LoggingService(config);
  return loggingService;
}

/**
 * Get the logging service instance
 * Throws if service is not initialized
 */
export function getLoggingService(): LoggingService {
  if (!loggingService) {
    throw new Error(
      "LoggingService not initialized. Call initializeLoggingService() first or use LoggingProvider."
    );
  }
  return loggingService;
}
