import { useAmplify } from "@contexts/AmplifyContext";
import { NetworkStatus, SyncState } from "@hooks/useAmplifyState";

/**
 * Return type for the useNetworkStatus hook.
 */
interface NetworkStatusInfo {
  /** Color code for the status indicator (hex format) */
  statusColor: string;
  /** Human-readable status text */
  statusText: string;
}

/**
 * React hook for getting network and sync status display information.
 *
 * Provides color-coded status information based on the current
 * network connectivity and DataStore sync state.
 *
 * Status colors:
 * - Red (`#ff6b6b`): Offline or sync error
 * - Yellow (`#feca57`): Syncing in progress
 * - Green (`#1dd1a1`): Online and synced
 * - Gray (`#a5b1c2`): Unknown/connecting
 *
 * @returns Object containing status color and text for display
 *
 * @example
 * ```tsx
 * const { statusColor, statusText } = useNetworkStatus();
 *
 * return (
 *   <View style={{ backgroundColor: statusColor }}>
 *     <Text>{statusText}</Text>
 *   </View>
 * );
 * ```
 */
export const useNetworkStatus = (): NetworkStatusInfo => {
  const { networkStatus, syncState } = useAmplify();

  const getStatusColor = (): string => {
    if (networkStatus === NetworkStatus.Offline) return "#ff6b6b"; // Red for offline
    if (syncState === SyncState.Syncing) return "#feca57"; // Yellow for syncing
    if (syncState === SyncState.Synced) return "#1dd1a1"; // Green for synced
    if (syncState === SyncState.Error) return "#ff6b6b"; // Red for error
    return "#a5b1c2"; // Gray for unknown
  };

  const getStatusText = (): string => {
    if (networkStatus === NetworkStatus.Offline) return "Offline";
    if (syncState === SyncState.Syncing) return "Syncing...";
    if (syncState === SyncState.Synced) return "Online & Synced";
    if (syncState === SyncState.Error) return "Sync Error";
    return "Connecting...";
  };

  return {
    statusColor: getStatusColor(),
    statusText: getStatusText(),
  };
};
