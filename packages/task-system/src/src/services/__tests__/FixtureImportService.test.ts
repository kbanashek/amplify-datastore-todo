import { DataStore } from "@aws-amplify/datastore";
import { FixtureImportService } from "../FixtureImportService";

jest.mock("@aws-amplify/datastore");
jest.mock("../../models", () => ({
  Activity: { copyOf: (_: any, mutator: any) => mutator({}) },
  Task: { copyOf: (_: any, mutator: any) => mutator({}) },
  Question: { copyOf: (_: any, mutator: any) => mutator({}) },
}));

const mockCreateActivity = jest.fn();
const mockCreateTask = jest.fn();
const mockCreateQuestion = jest.fn();
jest.mock("../ActivityService", () => ({
  ActivityService: {
    createActivity: (...args: any[]) => mockCreateActivity(...args),
  },
}));
jest.mock("../TaskService", () => ({
  TaskService: { createTask: (...args: any[]) => mockCreateTask(...args) },
}));
jest.mock("../QuestionService", () => ({
  QuestionService: {
    createQuestion: (...args: any[]) => mockCreateQuestion(...args),
  },
}));

const mockSaveAppointments = jest.fn();
jest.mock("../AppointmentService", () => ({
  AppointmentService: {
    saveAppointments: (...args: any[]) => mockSaveAppointments(...args),
  },
}));

describe("FixtureImportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (DataStore.query as jest.Mock).mockResolvedValue([]);
    (DataStore.save as jest.Mock).mockResolvedValue({});
  });

  it("throws for unsupported fixture versions", async () => {
    await expect(
      FixtureImportService.importTaskSystemFixture({ version: 999 } as any)
    ).rejects.toThrow("Unsupported fixture version");
  });

  it("creates activities and tasks when none exist", async () => {
    mockCreateActivity.mockResolvedValue({ pk: "A1", id: "a1" });
    mockCreateTask.mockResolvedValue({ pk: "T1", id: "t1" });

    const fixture = {
      version: 1,
      activities: [{ pk: "A1", sk: "SK-A1", name: "Act" }],
      tasks: [
        {
          pk: "T1",
          sk: "SK-T1",
          title: "Task",
          taskType: "SCHEDULED",
          status: "OPEN",
        },
      ],
    };

    const result = await FixtureImportService.importTaskSystemFixture(
      fixture as any
    );

    expect(mockCreateActivity).toHaveBeenCalledTimes(1);
    expect(mockCreateTask).toHaveBeenCalledTimes(1);
    expect(result.activities.created).toBe(1);
    expect(result.tasks.created).toBe(1);
  });

  it("updates existing records when updateExisting=true", async () => {
    // DataStore.query called for Activity, Task, Question in that order in the service
    (DataStore.query as jest.Mock)
      .mockResolvedValueOnce([
        { id: "a-id", pk: "A1", sk: "SK-A1", name: "Old" },
      ]) // Activity
      .mockResolvedValueOnce([
        { id: "t-id", pk: "T1", sk: "SK-T1", title: "Old" },
      ]) // Task
      .mockResolvedValueOnce([]); // Question

    const fixture = {
      version: 1,
      activities: [{ pk: "A1", sk: "SK-A1", name: "New" }],
      tasks: [
        {
          pk: "T1",
          sk: "SK-T1",
          title: "New",
          taskType: "SCHEDULED",
          status: "OPEN",
        },
      ],
    };

    const result = await FixtureImportService.importTaskSystemFixture(
      fixture as any,
      {
        updateExisting: true,
      }
    );

    expect(DataStore.save).toHaveBeenCalled();
    expect(result.activities.updated).toBe(1);
    expect(result.tasks.updated).toBe(1);
  });

  it("skips updates when updateExisting=false", async () => {
    (DataStore.query as jest.Mock)
      .mockResolvedValueOnce([{ id: "a-id", pk: "A1", sk: "SK-A1" }]) // Activity
      .mockResolvedValueOnce([{ id: "t-id", pk: "T1", sk: "SK-T1" }]) // Task
      .mockResolvedValueOnce([]); // Question

    const fixture = {
      version: 1,
      activities: [{ pk: "A1", sk: "SK-A1", name: "New" }],
      tasks: [
        {
          pk: "T1",
          sk: "SK-T1",
          title: "New",
          taskType: "SCHEDULED",
          status: "OPEN",
        },
      ],
    };

    const result = await FixtureImportService.importTaskSystemFixture(
      fixture as any,
      {
        updateExisting: false,
      }
    );

    expect(DataStore.save).not.toHaveBeenCalled();
    expect(result.activities.skipped).toBe(1);
    expect(result.tasks.skipped).toBe(1);
  });

  it("saves appointments when provided", async () => {
    const fixture = {
      version: 1,
      activities: [],
      tasks: [],
      appointments: {
        clinicPatientAppointments: { clinicAppointments: { items: [] } },
        siteTimezoneId: "UTC",
      },
    };

    const result = await FixtureImportService.importTaskSystemFixture(
      fixture as any
    );

    expect(mockSaveAppointments).toHaveBeenCalled();
    expect(result.appointments.saved).toBe(true);
  });

  it("creates questions when provided", async () => {
    mockCreateQuestion.mockResolvedValue({ pk: "Q1", id: "q1" });

    const fixture = {
      version: 1,
      activities: [],
      tasks: [],
      questions: [
        {
          pk: "Q1",
          sk: "SK-Q1",
          question: "Q",
          questionId: "Q1",
          friendlyName: "Q",
          controlType: "text",
          version: 1,
          index: 0,
        },
      ],
    };

    const result = await FixtureImportService.importTaskSystemFixture(
      fixture as any
    );

    expect(mockCreateQuestion).toHaveBeenCalledTimes(1);
    expect(result.questions.created).toBe(1);
  });
});
