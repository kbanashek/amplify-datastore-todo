import { useAmplify } from '../contexts/AmplifyContext';
import { NetworkStatus, SyncState } from './useAmplifyState';

interface NetworkStatusInfo {
  statusColor: string;
  statusText: string;
}

export const useNetworkStatus = (): NetworkStatusInfo => {
  const { networkStatus, syncState } = useAmplify();
  
  const getStatusColor = (): string => {
    if (networkStatus === NetworkStatus.Offline) return '#ff6b6b'; // Red for offline
    if (syncState === SyncState.Syncing) return '#feca57';     // Yellow for syncing
    if (syncState === SyncState.Synced) return '#1dd1a1';      // Green for synced
    if (syncState === SyncState.Error) return '#ff6b6b';       // Red for error
    return '#a5b1c2';                                  // Gray for unknown
  };
  
  const getStatusText = (): string => {
    if (networkStatus === NetworkStatus.Offline) return 'Offline';
    if (syncState === SyncState.Syncing) return 'Syncing...';
    if (syncState === SyncState.Synced) return 'Online & Synced';
    if (syncState === SyncState.Error) return 'Sync Error';
    return 'Connecting...';
  };

  return {
    statusColor: getStatusColor(),
    statusText: getStatusText()
  };
};
