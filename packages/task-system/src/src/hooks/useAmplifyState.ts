import { Hub } from "@aws-amplify/core";
import { DataStore } from "@aws-amplify/datastore";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
// configureAmplify should be provided by the consuming app
// Import from main app's amplify-config or provide as parameter
// For now, we'll make it optional and let the consuming app handle it
let configureAmplifyFn: (() => void) | null = null;

export function setConfigureAmplify(fn: () => void): void {
  configureAmplifyFn = fn;
}

function configureAmplify(): void {
  if (configureAmplifyFn) {
    configureAmplifyFn();
  } else {
    console.warn("[useAmplifyState] configureAmplify not set. Call setConfigureAmplify() from consuming app.");
  }
}
import { ConflictResolution } from "@orion/task-system";

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
  ConflictDetected = "conflictDetected",
}

export interface AmplifyState {
  isReady: boolean;
  networkStatus: NetworkStatus;
  syncState: SyncState;
  conflictCount: number;
}

export const useAmplifyState = (): AmplifyState => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    NetworkStatus.Online
  );
  const [syncState, setSyncState] = useState<SyncState>(SyncState.NotSynced);
  const [conflictCount, setConflictCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    let hubListener: any = null;
    let unsubscribeNetInfo: (() => void) | null = null;

    const initializeDataStore = async () => {
      try {
        configureAmplify();
        // Configure unified conflict resolution strategy for all models
        ConflictResolution.configure();

        // Start DataStore with sync enabled
        await DataStore.start();

        if (!isMounted) return;

        // Subscribe to DataStore events
        hubListener = Hub.listen("datastore", async (hubData: any) => {
          if (!isMounted) return;

          const { event, data } = hubData.payload;

          switch (event) {
            case DataStoreEventType.NetworkStatus:
              setNetworkStatus(
                data.active ? NetworkStatus.Online : NetworkStatus.Offline
              );
              break;
            case DataStoreEventType.ConflictDetected:
              // Increment conflict count when a conflict is detected
              setConflictCount(prevCount => prevCount + 1);
              break;
            case DataStoreEventType.SyncQueriesStarted:
              setSyncState(SyncState.Syncing);
              break;
            case DataStoreEventType.SyncQueriesReady:
              setSyncState(SyncState.Synced);
              setIsReady(true);
              break;
            case DataStoreEventType.SyncQueriesError:
              setSyncState(SyncState.Error);
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
      } catch (error) {
        console.error("Error initializing DataStore:", error);
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
  }, []);

  return {
    isReady,
    networkStatus,
    syncState,
    conflictCount,
  };
};
