import { Amplify, Hub } from "@aws-amplify/core";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { initTaskSystem } from "@runtime/taskSystem";
import { logWithDevice } from "@utils/deviceLogger";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("useAmplifyState");

// NOTE: Amplify is configured by amplify-init-sync.ts in app/_layout.tsx
// This runs synchronously before any components mount, so Amplify is always
// configured with the correct DataStore settings before useAmplifyState runs.

// Define enums for network and sync states
export enum NetworkStatus {
  Online = "ONLINE",
  Offline = "OFFLINE",
}

export enum SyncState {
  NotSynced = "NOT_SYNCED",
  Syncing = "SYNCING",
  Synced = "SYNCED",
  Error = "ERROR",
}

// Define DataStore event types
export enum DataStoreEventType {
  NetworkStatus = "networkStatus",
  SyncQueriesStarted = "syncQueriesStarted",
  SyncQueriesReady = "syncQueriesReady",
  SyncQueriesError = "syncQueriesError",
  OutboxStatus = "outboxStatus",
  OutboxMutationEnqueued = "outboxMutationEnqueued",
  OutboxMutationProcessed = "outboxMutationProcessed",
  ConflictDetected = "conflictDetected",
}

export interface AmplifyState {
  isReady: boolean;
  networkStatus: NetworkStatus;
  syncState: SyncState;
  conflictCount: number;
  lastSyncedAt: Date | null;
  pendingSyncCount: number;
}

export const useAmplifyState = (options?: {
  /**
   * If true, this hook will start DataStore (after host has configured Amplify).
   * Default is true for this repo's harness. LX can set false and manage DataStore lifecycle itself.
   */
  autoStartDataStore?: boolean;
}): AmplifyState => {
  const autoStartDataStore = options?.autoStartDataStore ?? true;
  const [isReady, setIsReady] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    NetworkStatus.Online
  );
  const [syncState, setSyncState] = useState<SyncState>(SyncState.NotSynced);
  const [conflictCount, setConflictCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    let hubListener: any = null;
    let unsubscribeNetInfo: (() => void) | null = null;

    const initializeDataStore = async () => {
      try {
        // CRITICAL: Amplify is already configured by amplify-init-sync.ts in app/_layout.tsx
        // DO NOT call configureAmplify() again here as it may reset the auth configuration
        // The amplify-init-sync.ts runs synchronously before any components mount

        // Small delay to ensure Amplify configuration is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Subscribe to DataStore events BEFORE starting DataStore so we don't miss early events.
        hubListener = Hub.listen("datastore", async (hubData: any) => {
          if (!isMounted) return;

          const { event, data } = hubData.payload;

          // 🔍 LOG EVERY SINGLE DATASTORE EVENT FOR DEBUGGING
          logger.info(
            `🔍 DataStore Event: ${event}`,
            {
              event,
              data: data ? JSON.stringify(data, null, 2) : "no data",
              timestamp: new Date().toISOString(),
            },
            undefined,
            "🔍"
          );

          switch (event) {
            case DataStoreEventType.NetworkStatus:
              logger.info(
                `🌐 Network Status Changed: ${data.active ? "ONLINE" : "OFFLINE"}`,
                { active: data.active, data },
                undefined,
                "🌐"
              );
              setNetworkStatus(
                data.active ? NetworkStatus.Online : NetworkStatus.Offline
              );
              break;
            case DataStoreEventType.ConflictDetected:
              logger.warn("⚠️ Conflict Detected", { data }, undefined, "⚠️");
              // Increment conflict count when a conflict is detected
              setConflictCount(prevCount => prevCount + 1);
              break;
            case DataStoreEventType.SyncQueriesStarted:
              logger.info(
                "🔄 Sync Queries STARTED - DataStore is now syncing with AWS",
                {
                  event,
                  data,
                  timestamp: new Date().toISOString(),
                },
                undefined,
                "🔄"
              );
              setSyncState(SyncState.Syncing);
              break;
            case DataStoreEventType.SyncQueriesReady:
              logger.info(
                "✅ Sync Queries READY - DataStore sync completed successfully",
                {
                  event,
                  data,
                  timestamp: new Date().toISOString(),
                },
                undefined,
                "✅"
              );
              setSyncState(SyncState.Synced);
              setIsReady(true);
              setLastSyncedAt(new Date());
              // Reset pending count when sync completes successfully
              setPendingSyncCount(0);
              break;
            case DataStoreEventType.SyncQueriesError:
              setSyncState(SyncState.Error);

              // Log sync errors for debugging
              logger.error("DataStore sync error", {
                event,
                data,
                errorDetails: data?.error || data,
                note: "Check earlier logs for '[Amplify] ✅ Configured' to see API key being used",
                error: data?.error || data,
              });

              // Check if it's an auth error
              const isUnauthorized =
                data?.error?.message?.includes("Unauthorized") ||
                data?.error?.errors?.[0]?.message?.includes("Unauthorized") ||
                data?.error?.message?.includes("401") ||
                data?.error?.errors?.[0]?.message?.includes("401") ||
                String(data?.error || "").includes("Unauthorized");

              if (isUnauthorized) {
                logger.error(
                  "UNAUTHORIZED ERROR - API key issue detected!",
                  {
                    expectedApiKey: "da2-b655th...",
                    suggestion: [
                      "1. Check console logs for '[Amplify] ✅ Configured with API_KEY authentication'",
                      "2. Verify the API key prefix shown matches: da2-b655th...",
                      "3. Verify API key exists in AWS AppSync Console and is NOT expired",
                      "4. If API key is wrong, update aws-exports.js and restart app completely",
                      "5. If API key is correct but still failing, the key may not exist in AWS",
                      "6. Create a new API key in AWS Console if needed",
                    ],
                    error: data?.error,
                    errorMessage: data?.error?.message,
                    errorDetails: data?.error?.errors,
                    fullError: JSON.stringify(data?.error || data, null, 2),
                  },
                  undefined,
                  "⚠️"
                );
              }
              break;
            case DataStoreEventType.OutboxStatus:
              // OutboxStatus event indicates if outbox is empty or not
              // Use this to reset count when explicitly empty
              if (data?.isEmpty === true) {
                logger.debug("Outbox is empty", { event, data });
                setPendingSyncCount(0);
              }
              break;
            case DataStoreEventType.OutboxMutationEnqueued:
              // Increment count when new mutation is added to outbox
              setPendingSyncCount(prev => {
                const newCount = prev + 1;
                logger.debug("Mutation enqueued", {
                  event,
                  previousCount: prev,
                  newCount,
                });
                return newCount;
              });
              break;
            case DataStoreEventType.OutboxMutationProcessed:
              // Decrement count when mutation is successfully synced
              setPendingSyncCount(prev => {
                const newCount = Math.max(0, prev - 1);
                logger.debug("Mutation processed", {
                  event,
                  previousCount: prev,
                  newCount,
                });
                return newCount;
              });
              break;
            case "modelSynced":
              // Log model sync details to see if it's full sync or delta sync
              logger.info(
                `📦 Model Synced: ${data?.model?.name || "unknown"}`,
                {
                  isFullSync: data?.isFullSync,
                  isDeltaSync: data?.isDeltaSync,
                  counts: data?.counts,
                  model: data?.model?.name,
                  timestamp: new Date().toISOString(),
                },
                undefined,
                "📦"
              );
              break;
            default:
              break;
          }
        });

        // Initialize network status
        NetInfo.fetch().then(state => {
          if (isMounted) {
            setNetworkStatus(
              state.isConnected ? NetworkStatus.Online : NetworkStatus.Offline
            );
          }
        });

        unsubscribeNetInfo = NetInfo.addEventListener(state => {
          if (isMounted) {
            setNetworkStatus(
              state.isConnected ? NetworkStatus.Online : NetworkStatus.Offline
            );
          }
        });

        // Configure package-level DataStore options (conflict handler) and optionally start DataStore.
        // IMPORTANT: This does NOT call Amplify.configure() — the host owns Amplify.configure().
        logWithDevice("useAmplifyState", "Initializing task-system runtime...");

        // Verify Amplify config before starting DataStore
        // Check isConfigured flag directly to avoid triggering warning from getConfig()
        const isConfigured = (Amplify as any).isConfigured;
        if (!isConfigured) {
          logger.warn(
            "Amplify not configured yet - DataStore initialization may fail",
            undefined,
            undefined,
            "⚠️"
          );
          // Don't throw - let DataStore.start() handle the error gracefully
        } else {
          // Only call getConfig() if Amplify is configured to avoid warning
          try {
            const amplifyConfig = Amplify.getConfig();
            const hasConfig = !!amplifyConfig;
            logger.debug("Amplify config verified", {
              hasConfig,
              configType: typeof amplifyConfig,
            });

            // Note: Amplify.getConfig() may not expose API key directly
            // The API key is configured via Amplify.configure() and used internally
            // If we get here, Amplify was configured successfully
          } catch (configError) {
            logger.warn("Could not verify Amplify config", configError);
          }
        }

        // Log that we're starting DataStore
        // The API key was already configured in amplify-init-sync.ts
        // Check the console logs for "[Amplify] ✅ Configured with API_KEY authentication"
        // to see which API key is being used
        logWithDevice(
          "useAmplifyState",
          "Starting DataStore (if enabled) — API key configured by host Amplify.configure()..."
        );

        await initTaskSystem({ startDataStore: autoStartDataStore });
        logWithDevice("useAmplifyState", "task-system runtime initialized", {
          autoStartDataStore,
        });

        if (!isMounted) return;
      } catch (error) {
        logger.error("Error initializing DataStore", error);
        if (isMounted) {
          setSyncState(SyncState.Error);
        }
      }
    };

    initializeDataStore();

    return () => {
      isMounted = false;
      if (hubListener) {
        hubListener();
      }
      if (unsubscribeNetInfo) {
        unsubscribeNetInfo();
      }
    };
  }, [autoStartDataStore]);

  return {
    isReady,
    networkStatus,
    syncState,
    conflictCount,
    lastSyncedAt,
    pendingSyncCount,
  };
};
