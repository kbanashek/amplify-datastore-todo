/**
 * Console log provider
 * Outputs logs to the console (works in all environments)
 */

import type { LogEntry, LogProvider } from "../types";
import { LogLevel } from "../types";
import { formatMetadataInline, formatSequenceDiagram } from "../utils";

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
      // Add platform prefix if not in sequence format
      if (platform) {
        formattedMessage = `[${platform}] ${formattedMessage}`;
      }
    } else {
      // Standard format
      const stepPart = step ? `[${step}] ` : "";
      const servicePart = serviceName ? `${serviceName}: ` : "";
      const iconPart = icon ? `${icon} ` : "";
      formattedMessage = `${iconPart}[${platform}] ${stepPart}${servicePart}${message}`;
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
