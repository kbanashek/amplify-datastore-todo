import { DataStore } from "@aws-amplify/datastore";
import { Question } from "../../models";
import { QuestionService } from "../QuestionService";

jest.mock("@aws-amplify/datastore");

const createMockQuestion = (overrides: Partial<Question> = {}): Question =>
  ({
    id: "test-question-id",
    pk: "test-pk",
    sk: "test-sk",
    question: "Test Question",
    questionId: "q1",
    friendlyName: "Test Question",
    controlType: "text",
    type: "text",
    version: 1,
    index: 0,
    ...overrides,
  }) as Question;

describe("QuestionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createQuestion", () => {
    it("should create a question successfully", async () => {
      const mockQuestion = createMockQuestion();
      const input = {
        pk: "test-pk",
        sk: "test-sk",
        question: "Test Question",
        questionId: "q1",
        friendlyName: "Test Question",
        controlType: "text",
        type: "text",
        version: 1,
        index: 0,
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockQuestion);

      const result = await QuestionService.createQuestion(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(Question));
      expect(result).toEqual(mockQuestion);
    });

    it("should throw error on create failure", async () => {
      const input = {
        pk: "test-pk",
        sk: "test-sk",
        question: "Test Question",
        questionId: "q1",
        friendlyName: "Test Question",
        controlType: "text",
        type: "text",
        version: 1,
        index: 0,
      };

      const error = new Error("Create failed");
      (DataStore.save as jest.Mock).mockRejectedValue(error);

      await expect(QuestionService.createQuestion(input)).rejects.toThrow(
        "Create failed"
      );
    });
  });

  describe("getQuestions", () => {
    it("should return all questions", async () => {
      const mockQuestions = [
        createMockQuestion({ id: "1" }),
        createMockQuestion({ id: "2" }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockQuestions);

      const result = await QuestionService.getQuestions();

      expect(DataStore.query).toHaveBeenCalledWith(Question);
      expect(result).toEqual(mockQuestions);
    });
  });

  describe("getQuestion", () => {
    it("should return a question by id", async () => {
      const mockQuestion = createMockQuestion({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockQuestion);

      const result = await QuestionService.getQuestion("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(Question, "test-id");
      expect(result).toEqual(mockQuestion);
    });

    it("should return null if question not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      const result = await QuestionService.getQuestion("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("updateQuestion", () => {
    it("should update a question successfully", async () => {
      const originalQuestion = createMockQuestion({
        id: "test-id",
        question: "Original",
      });
      const updatedQuestion = createMockQuestion({
        id: "test-id",
        question: "Updated",
      });

      (DataStore.query as jest.Mock).mockResolvedValue(originalQuestion);
      (DataStore.save as jest.Mock).mockResolvedValue(updatedQuestion);

      const result = await QuestionService.updateQuestion("test-id", {
        question: "Updated",
      });

      expect(DataStore.query).toHaveBeenCalledWith(Question, "test-id");
      expect(DataStore.save).toHaveBeenCalled();
      expect(result.question).toBe("Updated");
    });

    it("should throw error if question not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(
        QuestionService.updateQuestion("non-existent", { question: "Updated" })
      ).rejects.toThrow("Question with id non-existent not found");
    });
  });

  describe("deleteQuestion", () => {
    it("should delete a question successfully", async () => {
      const mockQuestion = createMockQuestion({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockQuestion);
      (DataStore.delete as jest.Mock).mockResolvedValue(mockQuestion);

      await QuestionService.deleteQuestion("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(Question, "test-id");
      expect(DataStore.delete).toHaveBeenCalledWith(mockQuestion);
    });

    it("should throw error if question not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(
        QuestionService.deleteQuestion("non-existent")
      ).rejects.toThrow("Question with id non-existent not found");
    });
  });

  describe("subscribeQuestions", () => {
    it("should subscribe to question changes", () => {
      const mockQuestions = [createMockQuestion({ id: "1" })];
      const mockSubscription = {
        subscribe: jest.fn(callback => {
          callback({ items: mockQuestions, isSynced: true });
          return { unsubscribe: jest.fn() };
        }),
      };

      (DataStore.observeQuery as jest.Mock).mockReturnValue(mockSubscription);
      (DataStore.observe as jest.Mock).mockReturnValue({
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      });

      const callback = jest.fn();
      const result = QuestionService.subscribeQuestions(callback);

      expect(DataStore.observeQuery).toHaveBeenCalledWith(Question);
      expect(callback).toHaveBeenCalledWith(mockQuestions, true);
      expect(result).toHaveProperty("unsubscribe");
    });
  });
});
