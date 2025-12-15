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
        // Enable periodic full sync to ensure all devices stay in sync
        // Full sync runs every 1 minute (60000ms) to catch any missed real-time updates
        // This ensures iOS, Android, and web all show the same data more quickly
        fullSyncInterval: 60000, // 1 minute - faster sync for better cross-device consistency
      },
    } as any);

    // Note: We're not explicitly setting SQLiteAdapter here because
    // Amplify will use the appropriate adapter based on the platform
    // when using React Native. SQLite is used by default on mobile.
  } catch (error) {
    console.error("Error configuring Amplify:", error);
  }
};
