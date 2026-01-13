import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { getServiceLogger } from "@utils/logging/serviceLogger";

const logger = getServiceLogger("ErrorBoundary");

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional fallback UI to render when an error occurs
   */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  /**
   * Optional callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Optional name for this boundary (for logging)
   */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches React errors and displays a fallback UI.
 *
 * This prevents the entire app from crashing when a component throws an error.
 * Errors are logged via the centralized logging service.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <CustomErrorUI error={error} onReset={reset} />
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const boundaryName = this.props.name || "ErrorBoundary";

    // Log the error with proper signature
    logger.error(`Caught error: ${error.message}`, error, boundaryName, "❌");

    // Log component stack separately for debugging
    logger.info(
      "Component stack trace",
      { componentStack: errorInfo.componentStack },
      boundaryName,
      "🔍"
    );

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error.message || "An unexpected error occurred"}
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={this.resetError}
            >
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.powderGray,
    padding: 20,
  },
  errorBox: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: AppColors.errorRed,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bodyBold.fontFamily,
    color: AppColors.errorRed,
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: AppFonts.body.fontFamily,
    color: AppColors.mediumDarkGray,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: AppColors.CIBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: AppFonts.bodyMedium.fontFamily,
    color: AppColors.white,
  },
});
