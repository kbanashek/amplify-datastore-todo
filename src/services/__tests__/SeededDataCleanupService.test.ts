import { DataStore } from "@aws-amplify/datastore";
import { AppointmentService, SeededDataCleanupService } from "@orion/task-system";

describe("SeededDataCleanupService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("clears DataStore models and appointments", async () => {
    (DataStore.query as jest.Mock).mockImplementation(async () => [{}, {}]);
    (DataStore.delete as jest.Mock).mockImplementation(async () => undefined);

    const clearAppointmentsSpy = jest
      .spyOn(AppointmentService, "clearAppointments")
      .mockResolvedValue(undefined);

    const result = await SeededDataCleanupService.clearAllSeededData();

    expect(DataStore.query).toHaveBeenCalledTimes(9);
    expect(DataStore.delete).toHaveBeenCalledTimes(18);
    expect(clearAppointmentsSpy).toHaveBeenCalledTimes(1);

    expect(result.clearedAppointments).toBe(true);
    expect(result.deleted.tasks).toBe(2);
  });
});
