import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

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
    });
  });

  it("renders main actions and can open advanced tools", () => {
    const screen = render(<DevOptionsScreen />);

    expect(screen.getByText("Dev Options")).toBeTruthy();
    expect(screen.getByText("Fresh Database")).toBeTruthy();
    expect(screen.getByText("Generate + Import (This Device)")).toBeTruthy();
    expect(screen.getByText("Force Sync (This Device)")).toBeTruthy();

    fireEvent.press(screen.getByText("Show"));
    expect(screen.getByText("Import Fixture From Repo File")).toBeTruthy();
  });
});
