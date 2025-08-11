import { useState, useEffect } from 'react';
import { Hub } from '@aws-amplify/core';
import { DataStore } from '@aws-amplify/datastore';
import NetInfo from '@react-native-community/netinfo';
import { configureAmplify } from '../amplify-config';

// Define enums instead of string literals
export enum SyncState {
  NotStarted = 'NotStarted',
  Syncing = 'Syncing',
  Synced = 'Synced',
  Error = 'Error'
}

export enum NetworkStatus {
  Online = 'Online',
  Offline = 'Offline'
}

// Define DataStore event types
export enum DataStoreEventType {
  NetworkStatus = 'networkStatus',
  SyncQueriesStarted = 'syncQueriesStarted',
  SyncQueriesReady = 'syncQueriesReady',
  SyncQueriesError = 'syncQueriesError'
}

export interface AmplifyStateResult {
  syncState: SyncState;
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isSynced: boolean;
  isSyncing: boolean;
  hasError: boolean;
}

export const useAmplifyState = (): AmplifyStateResult => {
  const [syncState, setSyncState] = useState<SyncState>(SyncState.NotStarted);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(NetworkStatus.Online);

  useEffect(() => {
    // Initialize Amplify if not already initialized
    configureAmplify();
    
    // Subscribe to DataStore events
    const hubListener = Hub.listen('datastore', async (hubData: any) => {
      const { event, data } = hubData.payload;
      
      if (event === DataStoreEventType.NetworkStatus) {
        setNetworkStatus(data.active ? NetworkStatus.Online : NetworkStatus.Offline);
      }
      
      if (event === DataStoreEventType.SyncQueriesStarted) {
        setSyncState(SyncState.Syncing);
      } else if (event === DataStoreEventType.SyncQueriesReady) {
        setSyncState(SyncState.Synced);
      } else if (event === DataStoreEventType.SyncQueriesError) {
        setSyncState(SyncState.Error);
      }
    });

    // Check initial network status using NetInfo
    NetInfo.fetch().then(state => {
      setNetworkStatus(state.isConnected ? NetworkStatus.Online : NetworkStatus.Offline);
    });
    
    // Subscribe to network status changes
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setNetworkStatus(state.isConnected ? NetworkStatus.Online : NetworkStatus.Offline);
    });

    // Start DataStore
    DataStore.start();

    return () => {
      hubListener();
      unsubscribeNetInfo();
    };
  }, []);

  return {
    syncState,
    networkStatus,
    isOnline: networkStatus === NetworkStatus.Online,
    isSynced: syncState === SyncState.Synced,
    isSyncing: syncState === SyncState.Syncing,
    hasError: syncState === SyncState.Error,
  };
};
