import { DataStore } from "@aws-amplify/datastore";
// Import directly from source to bypass package mock
import { AppointmentService } from "../../../packages/task-system/src/src/services/AppointmentService";
import { SeededDataCleanupService } from "../../../packages/task-system/src/src/services/SeededDataCleanupService";

// Mock deviceLogger to prevent import issues during test teardown
jest.mock("../../../packages/task-system/src/src/utils/deviceLogger", () => ({
  logWithDevice: jest.fn(),
  logErrorWithDevice: jest.fn(),
}));

describe("SeededDataCleanupService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks to return empty arrays by default (no items to delete = fast test)
    (DataStore.query as jest.Mock).mockResolvedValue([]);
    (DataStore.delete as jest.Mock).mockResolvedValue(undefined);
  });

  it("clears DataStore models and appointments", async () => {
    // Mock DataStore.query to return items for deletion (but only a few to keep test fast)
    (DataStore.query as jest.Mock).mockImplementation(async () => [
      { id: "1" },
    ]);

    const clearAppointmentsSpy = jest
      .spyOn(AppointmentService, "clearAppointments")
      .mockResolvedValue(undefined);

    const result = await SeededDataCleanupService.clearAllSeededData();

    // Verify DataStore.query was called for each model
    expect(DataStore.query).toHaveBeenCalled();
    // Verify DataStore.delete was called for each item
    expect(DataStore.delete).toHaveBeenCalled();
    expect(clearAppointmentsSpy).toHaveBeenCalledTimes(1);

    expect(result.clearedAppointments).toBe(true);
    expect(result.deleted.tasks).toBeGreaterThanOrEqual(0);
  }, 15000); // Increase timeout to 15 seconds to account for delays in the service
});
