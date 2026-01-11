import { Amplify } from "@aws-amplify/core";
import awsconfig from "../aws-exports";
import { logErrorWithPlatform, logWithPlatform } from "./utils/platformLogger";

// Note: @aws-amplify/api package is required for DataStore cloud sync
// but doesn't need explicit import/configure - Amplify.configure() handles it

// Configure Amplify
export const configureAmplify = (): void => {
  try {
    // Check if Amplify is already configured to avoid re-configuration
    const isConfigured = (Amplify as any).isConfigured;
    if (isConfigured) {
      // Amplify is already configured, skip re-configuration
      return;
    }

    // Verify API key is present before configuring
    if (!awsconfig.aws_appsync_apiKey) {
      throw new Error(
        "API key is missing from aws-exports.js. Run 'amplify pull' to refresh configuration."
      );
    }

    // Configure Amplify with the AWS exports and enable DataStore sync
    // CRITICAL: Ensure API key authentication is properly configured
    const config = {
      ...awsconfig,
      DataStore: {
        // Enable automatic sync when online
        syncExpressions: [],
        // FORCE FULL SYNC ALWAYS (NOT DELTA SYNC)
        // This fixes iOS sync metadata corruption where delta sync returns 0 items
        // even though iOS has empty cache
        fullSyncInterval: 5000, // 5 seconds - very fast full sync
        maxRecordsToSync: 10000, // Large limit forces full sync instead of delta
        syncPageSize: 1000, // Larger page size for full sync
      },
      // Explicitly configure API key auth for AppSync
      // This ensures DataStore uses the API key from aws-exports.js
      aws_appsync_authenticationType:
        awsconfig.aws_appsync_authenticationType || "API_KEY",
      aws_appsync_apiKey: awsconfig.aws_appsync_apiKey,
    };

    // CRITICAL: Amplify.configure() automatically configures all modules
    // including API (for DataStore cloud sync) if @aws-amplify/api is installed
    Amplify.configure(config as any);

    const apiKeyPrefix = awsconfig.aws_appsync_apiKey?.substring(0, 10) + "...";

    // Format metadata as readable list (like tasks/activities)
    const configDetails = [
      `  • endpoint: ${awsconfig.aws_appsync_graphqlEndpoint}`,
      `  • region: ${awsconfig.aws_appsync_region}`,
      `  • authType: ${awsconfig.aws_appsync_authenticationType}`,
      `  • apiKeyPrefix: ${apiKeyPrefix}`,
      `  • hasApiKey: ${!!awsconfig.aws_appsync_apiKey}`,
    ].join("\n");

    logWithPlatform(
      "🔐",
      "INIT-1",
      "AmplifyConfig",
      `Amplify configured with API_KEY authentication (includes API module for DataStore sync)\n${configDetails}`,
      {
        endpoint: awsconfig.aws_appsync_graphqlEndpoint,
        region: awsconfig.aws_appsync_region,
        authType: awsconfig.aws_appsync_authenticationType,
        apiKeyPrefix,
        hasApiKey: !!awsconfig.aws_appsync_apiKey,
        apiPackageInstalled: true, // @aws-amplify/api package enables DataStore cloud sync
      }
    );

    // Note: Amplify.getConfig() may not expose API key directly for security reasons
    // The API key is configured and used internally by Amplify/DataStore
    // If configuration succeeds, the API key should be available for DataStore operations

    // Note: We're not explicitly setting SQLiteAdapter here because
    // Amplify will use the appropriate adapter based on the platform
    // when using React Native. SQLite is used by default on mobile.
  } catch (error) {
    logErrorWithPlatform(
      "",
      "AmplifyConfig",
      "Failed to configure Amplify",
      error
    );
    throw error; // Re-throw to prevent silent failures
  }
};
