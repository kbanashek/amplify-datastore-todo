/**
 * Sentry log provider (stub for future implementation)
 * Will integrate with @sentry/react-native when configured
 */

import type { LogEntry, LogProvider } from "@services/logging/types";
import { LogLevel } from "@services/logging/types";
import { mapLogLevelToSentrySeverity } from "@services/logging/utils";

export class SentryProvider implements LogProvider {
  private enabled: boolean = false;
  private sentryInitialized: boolean = false;
  private sentryChecked: boolean = false;

  constructor() {
    // Don't check Sentry availability in constructor to avoid Metro bundler errors
    // Sentry will be checked lazily when needed
    this.enabled = false;
    this.sentryInitialized = false;
  }

  private checkSentryAvailability(): void {
    // Only check once to avoid repeated require attempts
    if (this.sentryChecked) {
      return;
    }
    this.sentryChecked = true;

    try {
      // Use a dynamic require that Metro can't statically analyze
      // This prevents Metro from trying to resolve the module at build time
      const getSentryModule = () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("@sentry/react-native");
        } catch {
          return null;
        }
      };

      const Sentry = getSentryModule();
      if (Sentry && typeof Sentry.captureMessage === "function") {
        this.sentryInitialized = true;
        // Only enable if explicitly enabled via setEnabled() or initialize()
        this.enabled = false; // Disabled by default until explicitly enabled
      }
    } catch {
      // Sentry not installed or not configured - this is expected
      this.sentryInitialized = false;
      this.enabled = false;
    }
  }

  getName(): string {
    return "SentryProvider";
  }

  isEnabled(): boolean {
    return this.enabled && this.sentryInitialized;
  }

  setEnabled(enabled: boolean): void {
    // Check Sentry availability when trying to enable
    if (enabled && !this.sentryChecked) {
      this.checkSentryAvailability();
    }

    if (enabled && !this.sentryInitialized) {
      // Silently fail - Sentry is not installed, which is fine
      // Don't log warnings to avoid noise when Sentry isn't configured
      this.enabled = false;
      return;
    }
    this.enabled = enabled;
  }

  /**
   * Enable Sentry provider (call this after Sentry is initialized)
   */
  initialize(): void {
    this.checkSentryAvailability();
    if (this.sentryInitialized) {
      this.enabled = true;
    }
  }

  log(entry: LogEntry): void {
    if (!this.isEnabled()) {
      return;
    }

    // Check Sentry availability lazily when actually logging
    if (!this.sentryChecked) {
      this.checkSentryAvailability();
    }

    if (!this.sentryInitialized) {
      return; // Silently skip if Sentry not available
    }

    const { level, message, metadata } = entry;

    try {
      // Lazy load Sentry only when actually needed
      const getSentryModule = () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("@sentry/react-native");
        } catch {
          return null;
        }
      };

      const Sentry = getSentryModule();
      if (!Sentry) {
        return; // Sentry not available
      }

      // Map log levels to Sentry severity using shared utility
      const severity = mapLogLevelToSentrySeverity(level);

      // Add metadata as context
      if (metadata && Object.keys(metadata).length > 0) {
        Sentry.setContext("log_metadata", metadata);
      }

      // Capture message with appropriate level
      if (level === LogLevel.ERROR) {
        // For errors, create an Error object for better stack traces
        const error = new Error(message);
        Sentry.captureException(error, {
          level: severity,
        });
      } else {
        Sentry.captureMessage(message, {
          level: severity,
        });
      }

      // Clear context after logging
      if (metadata && Object.keys(metadata).length > 0) {
        Sentry.setContext("log_metadata", null);
      }
    } catch {
      // Silently fail if Sentry is not properly configured
      // This prevents logging errors from breaking the app
      // Don't log warnings - Sentry is optional and not configured yet
    }
  }
}
