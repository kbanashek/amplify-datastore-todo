import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hub } from '@aws-amplify/core';
import { DataStore } from '@aws-amplify/datastore';
import NetInfo from '@react-native-community/netinfo';
import { configureAmplify } from '../amplify-config';

// Initialize Amplify with our configuration
configureAmplify();

// Define types for our context
type SyncState = 'NotStarted' | 'Syncing' | 'Synced' | 'Error';
type NetworkStatus = 'Online' | 'Offline';

interface AmplifyContextType {
  syncState: SyncState;
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isSynced: boolean;
  isSyncing: boolean;
  hasError: boolean;
}

// Create context
const AmplifyContext = createContext<AmplifyContextType | null>(null);

// Custom hook to use the Amplify context
export const useAmplify = (): AmplifyContextType => {
  const context = useContext(AmplifyContext);
  if (!context) {
    throw new Error('useAmplify must be used within an AmplifyProvider');
  }
  return context;
};

interface AmplifyProviderProps {
  children: ReactNode;
}

// Provider component
export const AmplifyProvider: React.FC<AmplifyProviderProps> = ({ children }) => {
  const [syncState, setSyncState] = useState<SyncState>('NotStarted');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('Online');

  useEffect(() => {
    // Subscribe to DataStore events
    const hubListener = Hub.listen('datastore', async (hubData: any) => {
      const { event, data } = hubData.payload;
      
      if (event === 'networkStatus') {
        setNetworkStatus(data.active ? 'Online' : 'Offline');
      }
      
      if (event === 'syncQueriesStarted') {
        setSyncState('Syncing');
      } else if (event === 'syncQueriesReady') {
        setSyncState('Synced');
      } else if (event === 'syncQueriesError') {
        setSyncState('Error');
      }
    });

    // Check initial network status using NetInfo instead of DataStore.networkStatus()
    NetInfo.fetch().then(state => {
      setNetworkStatus(state.isConnected ? 'Online' : 'Offline');
    });
    
    // Subscribe to network status changes
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setNetworkStatus(state.isConnected ? 'Online' : 'Offline');
    });

    // Start DataStore
    DataStore.start();

    return () => {
      hubListener();
      unsubscribeNetInfo();
    };
  }, []);

  // Value to be provided by the context
  const value: AmplifyContextType = {
    syncState,
    networkStatus,
    isOnline: networkStatus === 'Online',
    isSynced: syncState === 'Synced',
    isSyncing: syncState === 'Syncing',
    hasError: syncState === 'Error',
  };

  return (
    <AmplifyContext.Provider value={value}>
      {children}
    </AmplifyContext.Provider>
  );
};
