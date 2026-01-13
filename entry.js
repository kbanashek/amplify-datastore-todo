// CRITICAL: Import polyfills FIRST for Hermes compatibility
import "react-native-get-random-values"; // Required for crypto operations
import "react-native-url-polyfill/auto"; // Required for URL parsing in AWS SDK

// Initialize Amplify before anything else
// NOTE: This MUST be imported before expo-router/entry to ensure Amplify
// is configured before any modules that use Amplify services are loaded.
import "./src/amplify-init-sync";

// Import Expo Router at the top level
import "expo-router/entry";
