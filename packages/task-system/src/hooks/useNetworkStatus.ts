import { AppColors } from "@constants/AppColors";
import { useAmplify } from "@contexts/AmplifyContext";
import { NetworkStatus, SyncState } from "@hooks/useAmplifyState";
import { useTaskTranslation } from "@translations/useTaskTranslation";

/**
 * Return type for the useNetworkStatus hook.
 */
interface NetworkStatusInfo {
  /** Color code for the status indicator (from AppColors) */
  statusColor: string;
  /** Human-readable, translated status text */
  statusText: string;
}

/**
 * React hook for getting network and sync status display information.
 *
 * Provides color-coded status information based on the current
 * network connectivity and DataStore sync state. Uses centralized
 * colors from AppColors and translated strings.
 *
 * Status colors (from AppColors):
 * - statusOffline: Offline or sync error
 * - statusSyncing: Syncing in progress
 * - statusSynced: Online and synced
 * - statusUnknown: Unknown/connecting
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
  const { t } = useTaskTranslation();

  const SYNC_STATE_COLORS: Record<SyncState, string> = {
    [SyncState.Syncing]: AppColors.statusSyncing,
    [SyncState.Synced]: AppColors.statusSynced,
    [SyncState.Error]: AppColors.statusOffline,
    [SyncState.NotSynced]: AppColors.statusUnknown,
  } as const;

  const SYNC_STATE_TEXTS: Record<SyncState, string> = {
    [SyncState.Syncing]: t("status.syncing"),
    [SyncState.Synced]: t("status.synced"),
    [SyncState.Error]: t("status.syncError"),
    [SyncState.NotSynced]: t("status.connecting"),
  } as const;

  const getStatusColor = (): string => {
    if (networkStatus === NetworkStatus.Offline) {
      return AppColors.statusOffline;
    }
    return SYNC_STATE_COLORS[syncState] ?? AppColors.statusUnknown;
  };

  const getStatusText = (): string => {
    if (networkStatus === NetworkStatus.Offline) {
      return t("status.offline");
    }
    return SYNC_STATE_TEXTS[syncState] ?? t("status.connecting");
  };

  return {
    statusColor: getStatusColor(),
    statusText: getStatusText(),
  };
};
