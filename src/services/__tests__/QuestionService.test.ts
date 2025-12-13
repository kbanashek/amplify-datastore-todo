import { DataStore } from "@aws-amplify/datastore";
import { QuestionService } from "../QuestionService";
import { Question } from "../../../models";
import { createMockQuestion } from "../../__tests__/__mocks__/DataStore.mock";

jest.mock("@aws-amplify/datastore");

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
        text: "Test Question",
        type: "text",
        required: false,
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockQuestion);

      const result = await QuestionService.createQuestion(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(Question));
      expect(result).toEqual(mockQuestion);
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
  });

  describe("updateQuestion", () => {
    it("should update a question successfully", async () => {
      const originalQuestion = createMockQuestion({
        id: "test-id",
        text: "Original",
      });
      const updatedQuestion = createMockQuestion({
        id: "test-id",
        text: "Updated",
      });

      (DataStore.query as jest.Mock).mockResolvedValue(originalQuestion);
      (DataStore.save as jest.Mock).mockResolvedValue(updatedQuestion);

      const result = await QuestionService.updateQuestion("test-id", {
        text: "Updated",
      });

      expect(result.text).toBe("Updated");
    });
  });

  describe("deleteQuestion", () => {
    it("should delete a question successfully", async () => {
      const mockQuestion = createMockQuestion({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockQuestion);
      (DataStore.delete as jest.Mock).mockResolvedValue(mockQuestion);

      await QuestionService.deleteQuestion("test-id");

      expect(DataStore.delete).toHaveBeenCalledWith(mockQuestion);
    });
  });
});
