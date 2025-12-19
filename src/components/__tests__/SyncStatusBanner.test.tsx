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
    });

    const screen = render(<SyncStatusBanner />);
    expect(
      screen.getByTestId("sync-status-value").props.children.join("")
    ).toContain("Conflicts: 2");
  });
});
