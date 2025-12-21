import { Amplify } from "@aws-amplify/core";
import awsconfig from "../aws-exports";
import { logWithPlatform, logErrorWithPlatform } from "./utils/platformLogger";

// Configure Amplify
export const configureAmplify = (): void => {
  try {
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
        // Enable frequent periodic full sync for immediate cross-device updates
        // Full sync runs every 10 seconds (10000ms) to catch any missed real-time updates
        // This ensures iOS, Android, and web all show the same data almost immediately
        // Real-time subscriptions handle immediate updates, this is a safety net
        fullSyncInterval: 10000, // 10 seconds - very fast sync for immediate cross-device consistency
      },
      // Explicitly configure API key auth for AppSync
      // This ensures DataStore uses the API key from aws-exports.js
      aws_appsync_authenticationType:
        awsconfig.aws_appsync_authenticationType || "API_KEY",
      aws_appsync_apiKey: awsconfig.aws_appsync_apiKey,
    };

    Amplify.configure(config as any);

    const apiKeyPrefix = awsconfig.aws_appsync_apiKey?.substring(0, 10) + "...";
    logWithPlatform(
      "🔐",
      "",
      "AmplifyConfig",
      "Amplify configured with API_KEY authentication",
      {
        endpoint: awsconfig.aws_appsync_graphqlEndpoint,
        region: awsconfig.aws_appsync_region,
        authType: awsconfig.aws_appsync_authenticationType,
        apiKeyPrefix,
        hasApiKey: !!awsconfig.aws_appsync_apiKey,
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
