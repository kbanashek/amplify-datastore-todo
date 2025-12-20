import { renderHook, act } from "@testing-library/react-native";

import { useDevOptions } from "../useDevOptions";

jest.mock("@orion/task-system", () => ({
  AppointmentService: {
    clearAppointments: jest.fn(),
    saveAppointments: jest.fn(),
  },
  FixtureImportService: {
    importTaskSystemFixture: jest.fn(),
  },
  SeededDataCleanupService: {
    clearAllSeededData: jest.fn(),
  },
  TaskService: {
    deleteAllTasks: jest.fn(),
  },
}));

jest.mock("../../utils/syncUtils", () => ({
  clearCacheAndResync: jest.fn(),
  forceFullSync: jest.fn(),
}));

jest.mock("../../../scripts/seed-appointment-data", () => ({
  seedAppointmentData: jest.fn(),
}));

import {
  AppointmentService,
  FixtureImportService,
  SeededDataCleanupService,
  TaskService,
} from "@orion/task-system";
import { clearCacheAndResync, forceFullSync } from "../../utils/syncUtils";
import { seedAppointmentData } from "../../../scripts/seed-appointment-data";

describe("useDevOptions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      FixtureImportService.importTaskSystemFixture as jest.Mock
    ).mockResolvedValue({
      activities: { created: 1, updated: 0, skipped: 0 },
      tasks: { created: 10, updated: 0, skipped: 0 },
      questions: { created: 0, updated: 0, skipped: 0 },
      appointments: { saved: true },
    });
  });

  it("imports fixture from repo with pruneNonFixture=true and local reset", async () => {
    const { result } = renderHook(() => useDevOptions());

    await act(async () => {
      await result.current.importFixtureFromRepo();
    });

    expect(clearCacheAndResync).toHaveBeenCalledTimes(1);
    expect(AppointmentService.clearAppointments).toHaveBeenCalledTimes(1);
    expect(FixtureImportService.importTaskSystemFixture).toHaveBeenCalled();

    const args = (FixtureImportService.importTaskSystemFixture as jest.Mock)
      .mock.calls[0];
    expect(args[1]).toEqual({
      updateExisting: true,
      pruneNonFixture: true,
      pruneDerivedModels: true,
    });
  });

  it("freshCloudResetAndImport performs cloud delete then local reset then import", async () => {
    const { result } = renderHook(() => useDevOptions());

    await act(async () => {
      await result.current.freshCloudResetAndImport();
    });

    expect(SeededDataCleanupService.clearAllSeededData).toHaveBeenCalledTimes(
      1
    );
    expect(clearCacheAndResync).toHaveBeenCalledTimes(1);
    expect(AppointmentService.clearAppointments).toHaveBeenCalledTimes(1);
    expect(FixtureImportService.importTaskSystemFixture).toHaveBeenCalled();
  });

  it("resetLocalAndImport best-effort calls forceFullSync", async () => {
    const { result } = renderHook(() => useDevOptions());

    await act(async () => {
      await result.current.resetLocalAndImport();
    });

    expect(forceFullSync).toHaveBeenCalledTimes(1);
  });

  it("seedAppointmentsOnly saves appointments and sets summary", async () => {
    (seedAppointmentData as jest.Mock).mockResolvedValue({
      clinicPatientAppointments: { clinicAppointments: { items: [] } },
      siteTimezoneId: "America/New_York",
    });

    const { result } = renderHook(() => useDevOptions());

    await act(async () => {
      await result.current.seedAppointmentsOnly();
    });

    expect(AppointmentService.saveAppointments).toHaveBeenCalledTimes(1);
    expect(result.current.appointmentSeedResult?.timezone).toBe(
      "America/New_York"
    );
  });

  it("deleteTasksOnly calls TaskService.deleteAllTasks", async () => {
    const { result } = renderHook(() => useDevOptions());

    await act(async () => {
      await result.current.deleteTasksOnly();
    });

    expect(TaskService.deleteAllTasks).toHaveBeenCalledTimes(1);
  });
});
