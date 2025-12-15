import { Amplify } from "aws-amplify";
import awsconfig from "../aws-exports";

// Configure Amplify
export const configureAmplify = (): void => {
  try {
    // Configure Amplify with the AWS exports and enable DataStore sync
    Amplify.configure({
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
    } as any);

    // Note: We're not explicitly setting SQLiteAdapter here because
    // Amplify will use the appropriate adapter based on the platform
    // when using React Native. SQLite is used by default on mobile.
  } catch (error) {
    console.error("Error configuring Amplify:", error);
  }
};
