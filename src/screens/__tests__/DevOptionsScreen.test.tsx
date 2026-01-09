import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { DevOptionsScreen } from "../DevOptionsScreen";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../components/SyncStatusBanner", () => ({
  SyncStatusBanner: () => null,
}));

jest.mock("@orion/task-system", () => ({
  GlobalHeader: ({ title }: { title: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return <Text>{title}</Text>;
  },
}));

const mockUseDevOptions = jest.fn();
jest.mock("../../hooks/useDevOptions", () => ({
  useDevOptions: () => mockUseDevOptions(),
}));

describe("DevOptionsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDevOptions.mockReturnValue({
      isBusy: false,
      isImportingFixture: false,
      isSeedingAppointments: false,
      isDeleting: false,
      isForceSyncing: false,
      seedResult: null,
      appointmentSeedResult: null,
      generatedFixtureJson: "",
      lastError: null,
      generateFixtureJson: jest.fn(),
      importFixtureFromRepo: jest.fn().mockResolvedValue(undefined),
      generateFixtureAndImport: jest.fn().mockResolvedValue(undefined),
      freshCloudResetAndImport: jest.fn().mockResolvedValue(undefined),
      resetLocalAndImport: jest.fn().mockResolvedValue(undefined),
      seedAppointmentsOnly: jest.fn().mockResolvedValue(undefined),
      deleteTasksOnly: jest.fn().mockResolvedValue(undefined),
      deleteAppointmentsOnly: jest.fn().mockResolvedValue(undefined),
      nuclearDeleteCloud: jest.fn().mockResolvedValue(undefined),
      forceSyncThisDevice: jest.fn().mockResolvedValue(undefined),
      quickImportFixture: jest.fn().mockResolvedValue(undefined),
    });
  });

  it("renders main actions", () => {
    const screen = render(<DevOptionsScreen />);

    expect(screen.getByText("Dev Options")).toBeTruthy();
    expect(screen.getByText("✅ Safe Operations")).toBeTruthy();
    expect(screen.getByText("🗑️ Delete Operations")).toBeTruthy();
    expect(screen.getAllByText(/Add 10 Test Tasks/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Delete All Tasks/).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Delete All Appointments/).length
    ).toBeGreaterThan(0);
  });
});
