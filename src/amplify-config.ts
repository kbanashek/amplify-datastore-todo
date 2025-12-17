import { Amplify } from "aws-amplify";
import awsconfig from "../aws-exports";

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
    console.log("[Amplify] ✅ Configured with API_KEY authentication", {
      endpoint: awsconfig.aws_appsync_graphqlEndpoint,
      region: awsconfig.aws_appsync_region,
      authType: awsconfig.aws_appsync_authenticationType,
      apiKeyPrefix,
      apiKeyLength: awsconfig.aws_appsync_apiKey?.length,
      hasApiKey: !!awsconfig.aws_appsync_apiKey,
    });

    // Log the actual API key prefix for verification (first 10 chars)
    console.log("[Amplify] API Key (first 10 chars):", apiKeyPrefix);

    // Note: Amplify.getConfig() may not expose API key directly for security reasons
    // The API key is configured and used internally by Amplify/DataStore
    // If configuration succeeds, the API key should be available for DataStore operations

    // Note: We're not explicitly setting SQLiteAdapter here because
    // Amplify will use the appropriate adapter based on the platform
    // when using React Native. SQLite is used by default on mobile.
  } catch (error) {
    console.error("[Amplify] Error configuring Amplify:", error);
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error("[Amplify] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error; // Re-throw to prevent silent failures
  }
};
