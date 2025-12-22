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
  formatMetadataInline,
  formatSequenceDiagram,
  mapLogLevelToNativeSeverity,
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

  // Don't use react-native-logs - we format our own messages
  // react-native-logs adds its own prefixes which conflict with our standard format
  loggerInitialized = true;
  return null;
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

    // If react-native-logs is not available, NativeProvider should not log
    // ConsoleProvider will handle console logging, preventing duplicates
    if (!baseLogger) {
      return; // Skip logging - react-native-logs not available, ConsoleProvider handles console
    }

    const { level, message, metadata, platform, serviceName, step, icon } =
      entry;

    // New standard format: [Platform:task-system:ServiceName - STEP] : message (with icon inline)
    // Or: [Platform:task-system:ServiceName] : message (with icon inline)
    const iconPart = icon ? `${icon} ` : "";
    const messageWithIcon = `${iconPart}${message}`;
    const source = "task-system"; // Package source

    let formattedMessage: string;
    if (step) {
      // Initialization/data flow logs: [Platform:task-system:ServiceName - STEP] : message
      formattedMessage = `[${platform}:${source}:${serviceName} - ${step}] : ${messageWithIcon}`;
    } else {
      // Function logs: [Platform:task-system:ServiceName] : message
      formattedMessage = `[${platform}:${source}:${serviceName}] : ${messageWithIcon}`;
    }

    // Add inline metadata for single-line logs
    if (this.singleLine && metadata && Object.keys(metadata).length > 0) {
      formattedMessage += formatMetadataInline(
        metadata as Record<string, unknown>
      );
    }

    // Prepare log data object (only if not single-line or for fallback)
    const logData: Record<string, unknown> = {};
    if (!this.singleLine) {
      if (platform) logData.platform = platform;
      if (metadata && Object.keys(metadata).length > 0) {
        Object.assign(logData, metadata);
      }
    }

    // Use react-native-logs for native logging (not console)
    const serviceLogger = getServiceLogger(serviceName || "App", step);
    if (serviceLogger) {
      const severity = mapLogLevelToNativeSeverity(level);
      if (this.singleLine) {
        serviceLogger[severity](formattedMessage);
      } else {
        serviceLogger[severity](formattedMessage, logData);
      }
    }
  }
}
