import { renderHook } from "@testing-library/react-native";
import { useNetworkStatus } from "../useNetworkStatus";
import { NetworkStatus, SyncState } from "../useAmplifyState";

// Mock AmplifyContext
jest.mock("../../contexts/AmplifyContext", () => ({
  useAmplify: jest.fn(),
}));

import { useAmplify } from "../../contexts/AmplifyContext";

describe("useNetworkStatus", () => {
  const mockUseAmplify = useAmplify as jest.MockedFunction<typeof useAmplify>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("status color", () => {
    it("returns red for offline status", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Offline,
        syncState: SyncState.NotSynced,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe("#ff6b6b");
    });

    it("returns yellow for syncing state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Syncing,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe("#feca57");
    });

    it("returns green for synced state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Synced,
        isReady: true,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe("#1dd1a1");
    });

    it("returns red for error state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.Error,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe("#ff6b6b");
    });

    it("returns gray for unknown state", () => {
      mockUseAmplify.mockReturnValue({
        networkStatus: NetworkStatus.Online,
        syncState: SyncState.NotSynced,
        isReady: false,
        conflictCount: 0,
      } as any);
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.statusColor).toBe("#a5b1c2");
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
      expect(result.current.statusColor).toBe("#ff6b6b");
      expect(result.current.statusText).toBe("Offline");
    });
  });
});
