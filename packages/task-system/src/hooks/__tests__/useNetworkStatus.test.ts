import { renderHook } from "@testing-library/react-native";
import { AppColors } from "@constants/AppColors";
import { useNetworkStatus } from "@hooks/useNetworkStatus";
import { NetworkStatus, SyncState } from "@hooks/useAmplifyState";

// Mock AmplifyContext
jest.mock("@contexts/AmplifyContext", () => ({
  useAmplify: jest.fn(),
}));

// Mock translation hook
jest.mock("@translations/useTaskTranslation", () => ({
  useTaskTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "status.offline": "Offline",
        "status.syncing": "Syncing...",
        "status.synced": "Online & Synced",
        "status.syncError": "Sync Error",
        "status.connecting": "Connecting...",
      };
      return translations[key] ?? key;
    },
  }),
}));

import { useAmplify } from "@contexts/AmplifyContext";

describe("useNetworkStatus", () => {
  const mockUseAmplify = useAmplify as jest.MockedFunction<typeof useAmplify>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("status color", () => {
    it("returns statusOffline color for offline status", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Offline,
        syncState: SyncState.NotSynced,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe(AppColors.statusOffline);
    });

    it("returns statusSyncing color for syncing state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Syncing,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe(AppColors.statusSyncing);
    });

    it("returns statusSynced color for synced state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Synced,
        isReady: true,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe(AppColors.statusSynced);
    });

    it("returns statusOffline color for error state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Error,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe(AppColors.statusOffline);
    });

    it("returns statusUnknown color for unknown state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.NotSynced,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe(AppColors.statusUnknown);
    });
  });

  describe("status text", () => {
    it("returns 'Offline' for offline status", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Offline,
        syncState: SyncState.NotSynced,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusText).toBe("Offline");
    });

    it("returns 'Syncing...' for syncing state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Syncing,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusText).toBe("Syncing...");
    });

    it("returns 'Online & Synced' for synced state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Synced,
        isReady: true,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusText).toBe("Online & Synced");
    });

    it("returns 'Sync Error' for error state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Error,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusText).toBe("Sync Error");
    });

    it("returns 'Connecting...' for unknown state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.NotSynced,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusText).toBe("Connecting...");
    });
  });

  describe("priority handling", () => {
    it("prioritizes offline status over sync state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Offline,
        syncState: SyncState.Synced,
        isReady: true,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe(AppColors.statusOffline);
      expect(result.current.statusText).toBe("Offline");
    });
  });
});
