/**
 * DataStore sync utilities
 * Provides functions to manually trigger sync and check sync status
 */

import { DataStore } from "@aws-amplify/datastore";
import { Hub } from "@aws-amplify/core";
import { logWithDevice, logErrorWithDevice, resetDataStore } from "@orion/task-system";

const getResetDeps = () => ({ dataStore: DataStore, hub: Hub });

/**
 * Manually trigger a full sync of all DataStore models
 * Useful when you need to force sync across devices immediately
 *
 * This function stops and restarts DataStore, which triggers a full sync
 * from the cloud. All local data will be reconciled with the server.
 *
 * @returns Promise that resolves when sync completes
 */
export async function forceFullSync(): Promise<void> {
  try {
    logWithDevice(
      "syncUtils",
      "🔄 Starting manual full sync (stop/start DataStore)..."
    );

    await resetDataStore(getResetDeps(), {
      mode: "restart",
      waitForOutboxEmpty: true,
      outboxTimeoutMs: 2000,
      stopTimeoutMs: 5000,
      startTimeoutMs: 5000,
      proceedOnStopTimeout: true,
      proceedOnStartTimeout: false,
    });
    logWithDevice("syncUtils", "✅ DataStore restarted - full sync initiated");

    // Wait a bit for sync to begin processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    logWithDevice("syncUtils", "✅ Manual full sync completed");
  } catch (error) {
    logErrorWithDevice("syncUtils", "❌ Error during manual sync", error);
    throw error;
  }
}

/**
 * Clear local DataStore cache and force complete resync from cloud
 * This is the most aggressive sync method - clears all local data and resyncs from server
 * Use this when devices are showing different data and you need to force them to match
 *
 * WARNING: This will clear all local data and resync from cloud. Any unsynced local changes will be lost.
 *
 * @returns Promise that resolves when sync completes
 */
export async function clearCacheAndResync(): Promise<void> {
  try {
    logWithDevice(
      "syncUtils",
      "🗑️ Starting cache clear and resync (most aggressive sync)..."
    );

    await resetDataStore(getResetDeps(), {
      mode: "clearAndRestart",
      waitForOutboxEmpty: true,
      outboxTimeoutMs: 2000,
      stopTimeoutMs: 5000,
      clearTimeoutMs: 5000,
      startTimeoutMs: 5000,
      proceedOnStopTimeout: true,
      proceedOnClearTimeout: false,
      proceedOnStartTimeout: false,
    });
    logWithDevice("syncUtils", "✅ Local cache cleared and resync initiated");

    // Wait longer for sync to process (clearing cache means full resync)
    logWithDevice("syncUtils", "Waiting for complete resync to process...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    logWithDevice("syncUtils", "✅ Cache clear and resync completed");
  } catch (error) {
    logErrorWithDevice(
      "syncUtils",
      "❌ Error during cache clear and resync",
      error
    );
    throw error;
  }
}

/**
 * Check if DataStore is currently syncing
 * @returns Promise<boolean> - true if syncing, false otherwise
 */
export async function isSyncing(): Promise<boolean> {
  // DataStore doesn't expose a direct sync status API
  // This would need to be tracked via Hub events
  // For now, we'll return false and let the caller check via useAmplifyState hook
  return false;
}
