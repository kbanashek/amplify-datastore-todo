/**
 * Adversarial tests for useQuestionSubmission
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useQuestionSubmission } from "../useQuestionSubmission";
import { TaskAnswerService } from "@services/TaskAnswerService";
import { DataPointService } from "@services/DataPointService";
import { TaskService } from "@services/TaskService";

jest.mock("@services/TaskAnswerService");
jest.mock("@services/DataPointService");
jest.mock("@services/TaskService");

// Mock Alert without requiring react-native
const mockAlert = jest.fn();
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  __esModule: true,
  default: {
    alert: mockAlert,
  },
}));

// Mock the Alert import
jest.mock("react-native", () => ({
  Alert: {
    alert: mockAlert,
  },
  Platform: {
    OS: "ios",
  },
}));

// Mock hooks
jest.mock("../useTaskAnswer", () => ({
  useTaskAnswer: () => ({
    getAnswerByQuestionId: jest.fn(),
    createTaskAnswer: jest.fn(),
    updateTaskAnswer: jest.fn(),
  }),
}));

jest.mock("../useDataPointInstance", () => ({
  useDataPointInstance: () => ({
    getInstanceByQuestionId: jest.fn(),
    createDataPointInstance: jest.fn(),
    updateDataPointInstance: jest.fn(),
  }),
}));

jest.mock("../useTaskUpdate", () => ({
  useTaskUpdate: () => ({
    updateTask: jest.fn(),
  }),
}));

describe("useQuestionSubmission - Adversarial Tests", () => {
  const mockActivityData = {
    screens: [
      {
        elements: [
          {
            id: "elem-1",
            question: {
              id: "q1",
              text: "Question 1",
              questionType: "TEXT",
              required: true,
            },
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle createTaskAnswer rejecting with non-Error", async () => {
    const { TaskAnswerService: MockTaskAnswerService } = jest.requireMock(
      "@services/TaskAnswerService"
    );
    MockTaskAnswerService.createTaskAnswer = jest
      .fn()
      .mockRejectedValue("Database connection lost");

    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers: { q1: "answer" },
        activityData: mockActivityData as any,
        activityConfig: null,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should handle gracefully
    expect(Alert.alert).toHaveBeenCalled();
  });

  it("should prevent double submission (race condition)", async () => {
    const { TaskAnswerService: MockTaskAnswerService } = jest.requireMock(
      "@services/TaskAnswerService"
    );
    const { TaskService: MockTaskService } = jest.requireMock(
      "@services/TaskService"
    );

    let callCount = 0;
    MockTaskAnswerService.createTaskAnswer = jest
      .fn()
      .mockImplementation(async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: `answer-${callCount}` };
      });

    MockTaskService.updateTask = jest.fn().mockResolvedValue({ id: "task-1" });

    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers: { q1: "answer" },
        activityData: mockActivityData as any,
        activityConfig: null,
      })
    );

    // Try to call submit twice simultaneously
    const promise1 = act(async () => {
      await result.current.handleSubmit();
    });

    const promise2 = act(async () => {
      await result.current.handleSubmit();
    });

    await Promise.all([promise1, promise2]);

    // Should only submit once due to guard
    expect(callCount).toBeLessThanOrEqual(1);
  });

  it("should handle JSON.stringify failing on circular reference answer", async () => {
    const circularAnswer: any = { value: "test" };
    circularAnswer.self = circularAnswer;

    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers: { q1: circularAnswer },
        activityData: mockActivityData as any,
        activityConfig: null,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should handle gracefully (JSON.stringify will throw)
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle updateTask throwing after partial answer save", async () => {
    const { TaskAnswerService: MockTaskAnswerService } = jest.requireMock(
      "@services/TaskAnswerService"
    );
    const { TaskService: MockTaskService } = jest.requireMock(
      "@services/TaskService"
    );
    const { DataPointService: MockDataPointService } = jest.requireMock(
      "@services/DataPointService"
    );

    // Answers save successfully
    MockTaskAnswerService.createTaskAnswer = jest
      .fn()
      .mockResolvedValue({ id: "answer-1" });

    MockDataPointService.createDataPointInstance = jest
      .fn()
      .mockResolvedValue({ id: "dp-1" });

    // But updateTask fails
    MockTaskService.updateTask = jest
      .fn()
      .mockRejectedValue(new Error("Task locked by another user"));

    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers: { q1: "answer1" },
        activityData: mockActivityData as any,
        activityConfig: null,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should complete without crashing
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle empty answers object", async () => {
    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers: {},
        activityData: mockActivityData as any,
        activityConfig: null,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should handle gracefully
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle null/undefined in answers", async () => {
    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers: { q1: null, q2: undefined, q3: "" },
        activityData: {
          screens: [
            {
              elements: [
                {
                  id: "elem-1",
                  question: {
                    id: "q1",
                    text: "Q1",
                    questionType: "TEXT",
                    required: false,
                  },
                },
                {
                  id: "elem-2",
                  question: {
                    id: "q2",
                    text: "Q2",
                    questionType: "TEXT",
                    required: false,
                  },
                },
                {
                  id: "elem-3",
                  question: {
                    id: "q3",
                    text: "Q3",
                    questionType: "TEXT",
                    required: false,
                  },
                },
              ],
            },
          ],
        } as any,
        activityConfig: null,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should skip empty answers
    expect(result.current.isSubmitting).toBe(false);
  });
});
