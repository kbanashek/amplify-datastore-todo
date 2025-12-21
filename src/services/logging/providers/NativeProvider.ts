/**
 * Native log provider
 * Uses react-native-logs to write to native system logs
 * On Android: accessible via adb logcat
 * On iOS: accessible via system logs
 *
 * Follows react-native-logs conventions:
 * - Uses log.extend() for namespaced loggers
 * - Passes metadata as second parameter
 * - Formats messages according to react-native-logs best practices
 */

import type { LogEntry, LogProvider } from "../types";
import { LogLevel } from "../types";
import {
  NATIVE_SEVERITY,
  formatMetadataInline,
  formatSequenceDiagram,
} from "../utils";

interface NativeProviderConfig {
  singleLine?: boolean;
  sequenceDiagram?: boolean;
}

// Lazy load react-native-logs to avoid issues if not properly configured
let baseLogger: any = null;
let loggerInitialized = false;
const serviceLoggers = new Map<string, any>();

const initializeLogger = (): any => {
  if (loggerInitialized) {
    return baseLogger;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger, consoleTransport } = require("react-native-logs");
    const log = logger.createLogger({
      severity: __DEV__ ? NATIVE_SEVERITY.DEBUG : NATIVE_SEVERITY.WARN,
      // Use consoleTransport in dev, undefined in prod (no transport = no output)
      transport: __DEV__ ? consoleTransport : undefined,
      transportOptions: {
        colors: {
          info: "blueBright",
          warn: "yellowBright",
          error: "redBright",
          debug: "white",
        },
      },
      async: false,
      dateFormat: "time",
      printLevel: true,
      printDate: true,
      enabled: true,
    });

    baseLogger = log;
    loggerInitialized = true;
    return log;
  } catch (error) {
    // If react-native-logs is not properly configured, fall back to console
    console.warn(
      "[NativeProvider] react-native-logs not available, falling back to console",
      error
    );
    loggerInitialized = true;
    return null;
  }
};

/**
 * Get or create a namespaced logger for a service
 * Uses react-native-logs extend() method for proper namespacing
 */
const getServiceLogger = (serviceName: string, step?: string): any => {
  if (!baseLogger) {
    return null;
  }

  // Create tag from service name and optional step
  const tagParts: string[] = [];
  if (serviceName) tagParts.push(serviceName);
  if (step) tagParts.push(step);
  const tag = tagParts.join("|") || "App";

  // Cache service loggers to avoid recreating them
  if (!serviceLoggers.has(tag)) {
    serviceLoggers.set(tag, baseLogger.extend(tag));
  }

  return serviceLoggers.get(tag);
};

export class NativeProvider implements LogProvider {
  private enabled: boolean = true;
  private singleLine: boolean;
  private sequenceDiagram: boolean;

  constructor(config: NativeProviderConfig = {}) {
    this.singleLine = config.singleLine ?? true;
    this.sequenceDiagram = config.sequenceDiagram ?? true;
    initializeLogger();
  }

  getName(): string {
    return "NativeProvider";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  log(entry: LogEntry): void {
    if (!this.enabled) {
      return;
    }

    const { level, message, metadata, platform, serviceName, step, icon } =
      entry;

    // Format message based on configuration
    let formattedMessage: string;

    if (
      this.sequenceDiagram &&
      step &&
      (step.startsWith("INIT") || step.startsWith("DATA"))
    ) {
      // Use sequence diagram formatting for initialization logs
      formattedMessage = formatSequenceDiagram(
        step,
        serviceName || "App",
        message,
        icon
      );
    } else {
      // Standard format
      const iconPart = icon ? `${icon} ` : "";
      formattedMessage = `${iconPart}${message}`;
    }

    // Add inline metadata for single-line logs
    if (this.singleLine && metadata && Object.keys(metadata).length > 0) {
      formattedMessage += formatMetadataInline(
        metadata as Record<string, unknown>
      );
    }

    // Get namespaced logger for this service
    const serviceLogger = getServiceLogger(serviceName || "App", step);

    // Prepare log data object (only if not single-line or for fallback)
    const logData: Record<string, unknown> = {};
    if (!this.singleLine) {
      if (platform) logData.platform = platform;
      if (metadata && Object.keys(metadata).length > 0) {
        Object.assign(logData, metadata);
      }
    }

    // Use react-native-logs if available
    if (serviceLogger && baseLogger) {
      try {
        switch (level) {
          case LogLevel.VERBOSE:
          case LogLevel.DEBUG:
            if (!this.singleLine && Object.keys(logData).length > 0) {
              serviceLogger.debug(formattedMessage, logData);
            } else {
              serviceLogger.debug(formattedMessage);
            }
            break;
          case LogLevel.INFO:
            if (!this.singleLine && Object.keys(logData).length > 0) {
              serviceLogger.info(formattedMessage, logData);
            } else {
              serviceLogger.info(formattedMessage);
            }
            break;
          case LogLevel.WARN:
            if (!this.singleLine && Object.keys(logData).length > 0) {
              serviceLogger.warn(formattedMessage, logData);
            } else {
              serviceLogger.warn(formattedMessage);
            }
            break;
          case LogLevel.ERROR:
            if (!this.singleLine && Object.keys(logData).length > 0) {
              serviceLogger.error(formattedMessage, logData);
            } else {
              serviceLogger.error(formattedMessage);
            }
            break;
        }
      } catch (error) {
        // Fallback to console if native logging fails
        console.warn(
          `[NativeProvider] Failed to log to native, falling back to console:`,
          error
        );
        this.fallbackToConsole(
          level,
          serviceName || "App",
          formattedMessage,
          logData
        );
      }
    } else {
      // Fallback to console if react-native-logs is not available
      const tag = serviceName
        ? `${serviceName}${step ? `|${step}` : ""}`
        : "App";
      this.fallbackToConsole(level, tag, formattedMessage, logData);
    }
  }

  private fallbackToConsole(
    level: LogLevel,
    tag: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    let formattedMessage = `[${tag}] ${message}`;

    // Add inline metadata for single-line logs
    if (this.singleLine && data && Object.keys(data).length > 0) {
      formattedMessage += formatMetadataInline(data);
    }

    switch (level) {
      case LogLevel.VERBOSE:
      case LogLevel.DEBUG:
        if (__DEV__) {
          if (!this.singleLine && data && Object.keys(data).length > 0) {
            console.log(formattedMessage, data);
          } else {
            console.log(formattedMessage);
          }
        }
        break;
      case LogLevel.INFO:
        if (!this.singleLine && data && Object.keys(data).length > 0) {
          console.log(formattedMessage, data);
        } else {
          console.log(formattedMessage);
        }
        break;
      case LogLevel.WARN:
        if (!this.singleLine && data && Object.keys(data).length > 0) {
          console.warn(formattedMessage, data);
        } else {
          console.warn(formattedMessage);
        }
        break;
      case LogLevel.ERROR:
        if (!this.singleLine && data && Object.keys(data).length > 0) {
          console.error(formattedMessage, data);
        } else {
          console.error(formattedMessage);
        }
        break;
    }
  }
}
