/**
 * Adversarial tests for useQuestionSubmission
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useQuestionSubmission } from "../useQuestionSubmission";
jest.mock("@services/TaskAnswerService");
jest.mock("@services/DataPointService");
jest.mock("@services/TaskService");

// Alert.alert will be mocked in beforeEach using jest.spyOn
// This approach avoids conflicts with @testing-library/react-native's own react-native mocks

// Mock hooks as jest.fn() so they can be configured in tests
jest.mock("@hooks/useTaskAnswer", () => ({
  useTaskAnswer: jest.fn(),
}));

jest.mock("@hooks/useDataPointInstance", () => ({
  useDataPointInstance: jest.fn(),
}));

jest.mock("@hooks/useTaskUpdate", () => ({
  useTaskUpdate: jest.fn(),
}));

// Mock validation utilities
jest.mock("@utils/validation/questionValidation", () => ({
  validateAllScreens: jest.fn(() => ({})), // Return empty object by default (no errors)
}));

describe("useQuestionSubmission - Adversarial Tests", () => {
  const mockActivityData = {
    questions: [],
    screens: [
      {
        id: "screen-1",
        name: "Screen 1",
        order: 1,
        elements: [
          {
            id: "q1",
            order: 1,
            question: {
              id: "q1",
              text: "Question 1",
              friendlyName: "Question 1",
              type: "text",
              required: true,
              validations: [],
              choices: [],
              dataMappers: [],
            },
            displayProperties: {},
          },
        ],
        displayProperties: {},
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const { useTaskAnswer: mockUseTaskAnswer } = jest.requireMock(
      "@hooks/useTaskAnswer"
    ) as {
      useTaskAnswer: jest.Mock;
    };
    const { useDataPointInstance: mockUseDataPointInstance } = jest.requireMock(
      "@hooks/useDataPointInstance"
    ) as {
      useDataPointInstance: jest.Mock;
    };
    const { useTaskUpdate: mockUseTaskUpdate } = jest.requireMock(
      "@hooks/useTaskUpdate"
    ) as {
      useTaskUpdate: jest.Mock;
    };

    // Set up hook mocks with proper return values
    mockUseTaskAnswer.mockReturnValue({
      taskAnswers: [],
      loading: false,
      error: null,
      isCreating: false,
      isUpdating: false,
      getAnswersByTaskId: jest.fn(() => []),
      getAnswerByQuestionId: jest.fn(),
      createTaskAnswer: jest.fn(),
      updateTaskAnswer: jest.fn(),
    });

    mockUseDataPointInstance.mockReturnValue({
      instances: [],
      loading: false,
      error: null,
      isCreating: false,
      isUpdating: false,
      getInstancesByActivityId: jest.fn(() => []),
      getInstanceByQuestionId: jest.fn(),
      createDataPointInstance: jest.fn(),
      updateDataPointInstance: jest.fn(),
    });

    mockUseTaskUpdate.mockReturnValue({
      updateTask: jest.fn(),
      isUpdating: false,
      error: null,
    });

    // Mock Alert.alert
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
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
    let resolveCreate!: (value: { id: string }) => void;
    const createDeferred = new Promise<{ id: string }>(resolve => {
      resolveCreate = resolve;
    });
    const createTaskAnswerMock = jest.fn().mockReturnValue(createDeferred);

    // Override hook mocks for this test so we can control createTaskAnswer timing
    const { useTaskAnswer: mockUseTaskAnswer } = jest.requireMock(
      "@hooks/useTaskAnswer"
    ) as { useTaskAnswer: jest.Mock };
    const { useTaskUpdate: mockUseTaskUpdate } = jest.requireMock(
      "@hooks/useTaskUpdate"
    ) as { useTaskUpdate: jest.Mock };

    mockUseTaskAnswer.mockReturnValue({
      taskAnswers: [],
      loading: false,
      error: null,
      isCreating: false,
      isUpdating: false,
      getAnswersByTaskId: jest.fn(() => []),
      getAnswerByQuestionId: jest.fn(),
      createTaskAnswer: createTaskAnswerMock,
      updateTaskAnswer: jest.fn(),
    });

    mockUseTaskUpdate.mockReturnValue({
      updateTask: jest.fn().mockResolvedValue({ id: "task-1" }),
      isUpdating: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers: { q1: "answer" },
        activityData: mockActivityData as any,
        activityConfig: null,
      })
    );

    // Start first submit (it will hang in createTaskAnswer)
    let submitPromise: Promise<void> | undefined;
    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    // Immediately attempt a second submit while the first is in-flight
    act(() => {
      void result.current.handleSubmit();
    });

    // Should only attempt to create one answer due to guard
    expect(createTaskAnswerMock).toHaveBeenCalledTimes(1);

    // Unblock the first submit and let it finish
    resolveCreate({ id: "answer-1" });
    await act(async () => {
      await submitPromise;
    });
  });

  it("should handle JSON.stringify failing on circular reference answer", async () => {
    // Important: do NOT pass a circular object into renderHook directly.
    // react-test-renderer / RNTL can choke on circular structures during render bookkeeping.
    // Instead, render with a non-circular object and make it circular right before submit.
    const circularAnswer: any = { value: "test" };
    const answers: any = { q1: circularAnswer };

    const { result } = renderHook(() =>
      useQuestionSubmission({
        taskId: "task-1",
        entityId: "activity-1",
        answers,
        activityData: mockActivityData as any,
        activityConfig: null,
      })
    );

    circularAnswer.self = circularAnswer;

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
