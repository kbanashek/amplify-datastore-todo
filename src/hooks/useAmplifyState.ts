import { useState, useEffect } from "react";
import { Hub } from "@aws-amplify/core";
import { DataStore } from "@aws-amplify/datastore";
import NetInfo from "@react-native-community/netinfo";
import { configureAmplify } from "../amplify-config";
import { TodoService } from "../services/TodoService";

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
    configureAmplify();
    // Configure custom conflict resolution strategy
    TodoService.configureConflictResolution();
    DataStore.start();

    // Subscribe to DataStore events
    const hubListener = Hub.listen("datastore", async (hubData: any) => {
      const { event, data } = hubData.payload;

      switch (event) {
        case DataStoreEventType.NetworkStatus:
          setNetworkStatus(
            data.active ? NetworkStatus.Online : NetworkStatus.Offline
          );
          break;
        case DataStoreEventType.ConflictDetected:

          // Increment conflict count when a conflict is detected
          setConflictCount((prevCount) => prevCount + 1);
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

    NetInfo.fetch().then((state) => {
      setNetworkStatus(
        state.isConnected ? NetworkStatus.Online : NetworkStatus.Offline
      );
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setNetworkStatus(
        state.isConnected ? NetworkStatus.Online : NetworkStatus.Offline
      );
    });

    DataStore.start();

    return () => {
      hubListener();
      unsubscribeNetInfo();
    };
  }, []);

  return {
    isReady,
    networkStatus,
    syncState,
    conflictCount,
  };
};
