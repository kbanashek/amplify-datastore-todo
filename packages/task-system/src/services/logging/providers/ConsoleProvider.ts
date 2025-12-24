/**
 * Console log provider
 * Outputs logs to the console (works in all environments)
 */

import type { LogEntry, LogProvider } from "@services/logging/types";
import { LogLevel } from "@services/logging/types";
import {
  formatMetadataInline,
  formatSequenceDiagram,
} from "@services/logging/utils";

interface ConsoleProviderConfig {
  singleLine?: boolean;
  sequenceDiagram?: boolean;
}

export class ConsoleProvider implements LogProvider {
  private enabled: boolean = true;
  private singleLine: boolean;
  private sequenceDiagram: boolean;

  constructor(config: ConsoleProviderConfig = {}) {
    this.singleLine = config.singleLine ?? true;
    this.sequenceDiagram = config.sequenceDiagram ?? true;
  }

  getName(): string {
    return "ConsoleProvider";
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

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.VERBOSE:
      case LogLevel.DEBUG:
        if (__DEV__) {
          // Only log verbose/debug in development
          console.log(formattedMessage);
        }
        break;
      case LogLevel.INFO:
        console.log(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }
}
