/**
 * This file provides synchronous Amplify initialization
 * It must be imported before any other imports that might use Amplify
 */
import { Amplify } from "@aws-amplify/core";
import { configureAmplify } from "./amplify-config";
import { logErrorWithPlatform, logWithPlatform } from "./utils/platformLogger";

// Use a self-executing function to ensure synchronous execution
(function initializeAmplify() {
  try {
    logWithPlatform(
      "🚀",
      "",
      "AmplifyInit",
      "Starting Amplify configuration (synchronous)"
    );
    // Use the proper configureAmplify that includes DataStore configuration
    configureAmplify();

    // Verify configuration was successful
    const isConfigured = (Amplify as any).isConfigured;
    if (!isConfigured) {
      throw new Error("Amplify configuration did not complete successfully");
    }

    logWithPlatform("✅", "", "AmplifyInit", "Amplify configuration complete");
  } catch (error) {
    logErrorWithPlatform(
      "",
      "AmplifyInit",
      "Failed to initialize Amplify synchronously",
      error
    );
    // Re-throw to prevent app from continuing with unconfigured Amplify
    throw error;
  }
})();

// Export a dummy value to ensure this file is not tree-shaken
export const AMPLIFY_INITIALIZED = true;
