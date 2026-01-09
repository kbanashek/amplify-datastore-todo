import { DataStore } from "@aws-amplify/datastore";

import { TaskTempAnswer } from "@models/index";
import { TempAnswerSyncService } from "@services/TempAnswerSyncService";

jest.mock("@aws-amplify/datastore");

// Mock the model constructor
jest.mock("@models/index", () => ({
  TaskTempAnswer: jest.fn().mockImplementation(props => props),
}));

describe("TempAnswerSyncService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveTempAnswers", () => {
    it("should save temp answers via DataStore", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      (DataStore.save as jest.Mock) = mockSave;

      await TempAnswerSyncService.saveTempAnswers(
        "TASK-123",
        "ACTIVITY-456",
        { question1: "answer1", question2: "answer2" },
        "2026-01-05T12:00:00Z"
      );

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          pk: "TASK-123",
          taskPk: "TASK-123",
          activityId: "ACTIVITY-456",
          answers: JSON.stringify({
            question1: "answer1",
            question2: "answer2",
          }),
          localtime: "2026-01-05T12:00:00Z",
          hashKey: "TASK-123",
        })
      );
    });

    it("should generate unique sk based on timestamp", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      (DataStore.save as jest.Mock) = mockSave;

      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      await TempAnswerSyncService.saveTempAnswers(
        "TASK-123",
        "ACTIVITY-456",
        {},
        "2026-01-05T12:00:00Z"
      );

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          sk: `TEMP#${now}`,
        })
      );
    });

    it("should handle complex answer objects", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      (DataStore.save as jest.Mock) = mockSave;

      const complexAnswers = {
        question1: { nested: "value", array: [1, 2, 3] },
        question2: "simple string",
        question3: 42,
        question4: true,
      };

      await TempAnswerSyncService.saveTempAnswers(
        "TASK-123",
        "ACTIVITY-456",
        complexAnswers,
        "2026-01-05T12:00:00Z"
      );

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          answers: JSON.stringify(complexAnswers),
        })
      );
    });
  });

  describe("getTempAnswers", () => {
    it("should query most recent temp answer by taskPk", async () => {
      const mockAnswer = {
        taskPk: "TASK-123",
        activityId: "ACTIVITY-456",
        answers: JSON.stringify({ question1: "answer1", question2: "answer2" }),
        localtime: "2026-01-05T12:00:00Z",
      };

      (DataStore.query as jest.Mock).mockResolvedValue([mockAnswer]);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-123");

      expect(DataStore.query).toHaveBeenCalledWith(
        TaskTempAnswer,
        expect.any(Function),
        expect.objectContaining({
          limit: 1,
        })
      );
      expect(result).toEqual({ question1: "answer1", question2: "answer2" });
    });

    it("should return null if no answers found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue([]);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-999");

      expect(result).toBeNull();
    });

    it("should return null if query returns undefined", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(undefined);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-999");

      expect(result).toBeNull();
    });

    it("should query with correct predicate", async () => {
      const mockPredicate = jest.fn();
      (DataStore.query as jest.Mock).mockImplementation(
        async (model, predicate, options) => {
          // Call the predicate to verify it's set up correctly
          const mockCriteria = {
            taskPk: {
              eq: jest.fn().mockReturnValue(true),
            },
          };
          predicate(mockCriteria);
          return [];
        }
      );

      await TempAnswerSyncService.getTempAnswers("TASK-123");

      expect(DataStore.query).toHaveBeenCalled();
    });

    it("should sort by localtime descending", async () => {
      const mockAnswers = [
        {
          taskPk: "TASK-123",
          answers: JSON.stringify({ question1: "latest" }),
          localtime: "2026-01-05T12:00:00Z",
        },
        {
          taskPk: "TASK-123",
          answers: JSON.stringify({ question1: "older" }),
          localtime: "2026-01-04T12:00:00Z",
        },
      ];

      (DataStore.query as jest.Mock).mockResolvedValue(mockAnswers);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-123");

      // Should return the first item (most recent due to DESCENDING sort)
      expect(result).toEqual({ question1: "latest" });
    });

    it("should handle complex nested answer objects", async () => {
      const complexAnswers = {
        question1: { nested: { deeply: "value" } },
        question2: [1, 2, { obj: "in array" }],
        question3: null,
      };

      const mockAnswer = {
        taskPk: "TASK-123",
        answers: JSON.stringify(complexAnswers),
      };

      (DataStore.query as jest.Mock).mockResolvedValue([mockAnswer]);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-123");

      expect(result).toEqual(complexAnswers);
    });

    it("should handle answers that are already parsed objects", async () => {
      const answersObject = { question1: "answer1", question2: "answer2" };

      const mockAnswer = {
        taskPk: "TASK-123",
        answers: answersObject, // Already an object, not a string
      };

      (DataStore.query as jest.Mock).mockResolvedValue([mockAnswer]);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-123");

      expect(result).toEqual(answersObject);
    });

    it("should return null if answers field is empty", async () => {
      const mockAnswer = {
        taskPk: "TASK-123",
        answers: null,
      };

      (DataStore.query as jest.Mock).mockResolvedValue([mockAnswer]);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-123");

      expect(result).toBeNull();
    });

    it("should handle JSON parse errors gracefully", async () => {
      const mockAnswer = {
        taskPk: "TASK-123",
        answers: "invalid json {{{",
      };

      (DataStore.query as jest.Mock).mockResolvedValue([mockAnswer]);

      const result = await TempAnswerSyncService.getTempAnswers("TASK-123");

      expect(result).toBeNull();
    });
  });
});
