import { useAmplify } from '../contexts/AmplifyContext';

interface NetworkStatusInfo {
  statusColor: string;
  statusText: string;
}

export const useNetworkStatus = (): NetworkStatusInfo => {
  const { networkStatus, syncState } = useAmplify();
  
  const getStatusColor = (): string => {
    if (networkStatus === 'Offline') return '#ff6b6b'; // Red for offline
    if (syncState === 'Syncing') return '#feca57';     // Yellow for syncing
    if (syncState === 'Synced') return '#1dd1a1';      // Green for synced
    if (syncState === 'Error') return '#ff6b6b';       // Red for error
    return '#a5b1c2';                                  // Gray for unknown
  };
  
  const getStatusText = (): string => {
    if (networkStatus === 'Offline') return 'Offline';
    if (syncState === 'Syncing') return 'Syncing...';
    if (syncState === 'Synced') return 'Online & Synced';
    if (syncState === 'Error') return 'Sync Error';
    return 'Connecting...';
  };

  return {
    statusColor: getStatusColor(),
    statusText: getStatusText()
  };
};
