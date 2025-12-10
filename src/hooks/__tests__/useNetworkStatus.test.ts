import { renderHook } from "@testing-library/react-native";
import { useNetworkStatus } from "../useNetworkStatus";
import { useAmplify } from "../../contexts/AmplifyContext";

const NetworkStatus = {
  Online: "ONLINE",
  Offline: "OFFLINE",
};

const SyncState = {
  NotSynced: "NOT_SYNCED",
  Syncing: "SYNCING",
  Synced: "SYNCED",
  Error: "ERROR",
};

jest.mock("../../contexts/AmplifyContext", () => ({
  useAmplify: jest.fn(),
}));
jest.mock("../useAmplifyState", () => ({
  NetworkStatus: {
    Online: "ONLINE",
    Offline: "OFFLINE",
  },
  SyncState: {
    NotSynced: "NOT_SYNCED",
    Syncing: "SYNCING",
    Synced: "SYNCED",
    Error: "ERROR",
  },
}));

describe("useNetworkStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return red color and 'Offline' text when offline", () => {
    (useAmplify as jest.Mock).mockReturnValue({
      networkStatus: NetworkStatus.Offline,
      syncState: SyncState.NotSynced,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.statusColor).toBe("#ff6b6b");
    expect(result.current.statusText).toBe("Offline");
  });

  it("should return yellow color and 'Syncing...' text when syncing", () => {
    (useAmplify as jest.Mock).mockReturnValue({
      networkStatus: NetworkStatus.Online,
      syncState: SyncState.Syncing,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.statusColor).toBe("#feca57");
    expect(result.current.statusText).toBe("Syncing...");
  });

  it("should return green color and 'Online & Synced' text when synced", () => {
    (useAmplify as jest.Mock).mockReturnValue({
      networkStatus: NetworkStatus.Online,
      syncState: SyncState.Synced,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.statusColor).toBe("#1dd1a1");
    expect(result.current.statusText).toBe("Online & Synced");
  });

  it("should return red color and 'Sync Error' text when error", () => {
    (useAmplify as jest.Mock).mockReturnValue({
      networkStatus: NetworkStatus.Online,
      syncState: SyncState.Error,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.statusColor).toBe("#ff6b6b");
    expect(result.current.statusText).toBe("Sync Error");
  });

  it("should return gray color and 'Connecting...' text for unknown state", () => {
    (useAmplify as jest.Mock).mockReturnValue({
      networkStatus: NetworkStatus.Online,
      syncState: SyncState.NotSynced,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.statusColor).toBe("#a5b1c2");
    expect(result.current.statusText).toBe("Connecting...");
  });
});

