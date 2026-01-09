import React from "react";
import { render } from "@testing-library/react-native";

import { SyncStatusBanner } from "../SyncStatusBanner";

jest.mock("@orion/task-system", () => ({
  NetworkStatus: { Online: "ONLINE", Offline: "OFFLINE" },
  SyncState: {
    NotSynced: "NOT_SYNCED",
    Syncing: "SYNCING",
    Synced: "SYNCED",
    Error: "ERROR",
  },
  useAmplify: jest.fn(),
}));

const { useAmplify } = jest.requireMock("@orion/task-system") as {
  useAmplify: jest.Mock;
};

describe("SyncStatusBanner", () => {
  it("renders synced/online status", () => {
    useAmplify.mockReturnValue({
      networkStatus: "ONLINE",
      syncState: "SYNCED",
      conflictCount: 0,
      isReady: true,
      lastSyncedAt: new Date(),
      pendingSyncCount: 0,
    });

    const screen = render(<SyncStatusBanner />);
    expect(screen.getByTestId("sync-status-title").props.children).toBe(
      "Sync Status"
    );
    expect(
      screen.getByTestId("sync-status-value").props.children.join("")
    ).toContain("Synced");
  });

  it("renders conflict count when present", () => {
    useAmplify.mockReturnValue({
      networkStatus: "ONLINE",
      syncState: "SYNCED",
      conflictCount: 2,
      isReady: true,
      lastSyncedAt: new Date(),
      pendingSyncCount: 0,
    });

    const screen = render(<SyncStatusBanner />);
    expect(
      screen.getByTestId("sync-status-value").props.children.join("")
    ).toContain("Conflicts: 2");
  });

  it("renders last synced timestamp when available and no pending items", () => {
    const lastSyncedAt = new Date();
    useAmplify.mockReturnValue({
      networkStatus: "ONLINE",
      syncState: "SYNCED",
      conflictCount: 0,
      isReady: true,
      lastSyncedAt,
      pendingSyncCount: 0,
    });

    const screen = render(<SyncStatusBanner />);
    expect(screen.getByTestId("last-synced-timestamp")).toBeTruthy();
    expect(
      screen.getByTestId("last-synced-timestamp").props.children.join("")
    ).toContain("Last synced:");
  });

  it("does not render timestamp when lastSyncedAt is null", () => {
    useAmplify.mockReturnValue({
      networkStatus: "ONLINE",
      syncState: "SYNCED",
      conflictCount: 0,
      isReady: true,
      lastSyncedAt: null,
      pendingSyncCount: 0,
    });

    const screen = render(<SyncStatusBanner />);
    expect(screen.queryByTestId("last-synced-timestamp")).toBeNull();
  });

  it("renders pending sync count when items are waiting", () => {
    useAmplify.mockReturnValue({
      networkStatus: "OFFLINE",
      syncState: "SYNCED",
      conflictCount: 0,
      isReady: true,
      lastSyncedAt: new Date(),
      pendingSyncCount: 3,
    });

    const screen = render(<SyncStatusBanner />);
    const queueText = screen.getByTestId("pending-sync-count");
    expect(queueText).toBeTruthy();
    expect(queueText.props.children.join("")).toContain(
      "3 items waiting to sync"
    );
  });

  it("uses singular 'item' when only 1 pending", () => {
    useAmplify.mockReturnValue({
      networkStatus: "OFFLINE",
      syncState: "SYNCED",
      conflictCount: 0,
      isReady: true,
      lastSyncedAt: new Date(),
      pendingSyncCount: 1,
    });

    const screen = render(<SyncStatusBanner />);
    const queueText = screen.getByTestId("pending-sync-count");
    expect(queueText.props.children.join("")).toContain(
      "1 item waiting to sync"
    );
  });

  it("prioritizes queue count over timestamp", () => {
    useAmplify.mockReturnValue({
      networkStatus: "OFFLINE",
      syncState: "SYNCED",
      conflictCount: 0,
      isReady: true,
      lastSyncedAt: new Date(),
      pendingSyncCount: 2,
    });

    const screen = render(<SyncStatusBanner />);
    // Queue should be shown
    expect(screen.getByTestId("pending-sync-count")).toBeTruthy();
    // Timestamp should NOT be shown
    expect(screen.queryByTestId("last-synced-timestamp")).toBeNull();
  });

  it("does not render queue count when pendingSyncCount is 0", () => {
    useAmplify.mockReturnValue({
      networkStatus: "ONLINE",
      syncState: "SYNCED",
      conflictCount: 0,
      isReady: true,
      lastSyncedAt: new Date(),
      pendingSyncCount: 0,
    });

    const screen = render(<SyncStatusBanner />);
    expect(screen.queryByTestId("pending-sync-count")).toBeNull();
  });
});
