/**
 * This file provides synchronous Amplify initialization
 * It must be imported before any other imports that might use Amplify
 */
import { configureAmplify } from "./amplify-config";

// Use a self-executing function to ensure synchronous execution
(function initializeAmplify() {
  try {
    // Use the proper configureAmplify that includes DataStore configuration
    configureAmplify();
  } catch (error) {
    console.error("Failed to initialize Amplify synchronously:", error);
  }
})();

// Export a dummy value to ensure this file is not tree-shaken
export const AMPLIFY_INITIALIZED = true;
