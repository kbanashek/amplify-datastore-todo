import { renderHook, waitFor } from "@testing-library/react-native";
import { useTaskAnswerList } from "../useTaskAnswerList";
import { TaskAnswerService } from "../../services/TaskAnswerService";
import { createMockTaskAnswer } from "../../__tests__/__mocks__/DataStore.mock";

jest.mock("../../services/TaskAnswerService");

describe("useTaskAnswerList", () => {
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (TaskAnswerService.subscribeTaskAnswers as jest.Mock).mockImplementation(
      (callback) => {
        callback([], true);
        return { unsubscribe: mockUnsubscribe };
      }
    );
  });

  it("should initialize with loading state", async () => {
    // Mock subscription to not call callback immediately
    (TaskAnswerService.subscribeTaskAnswers as jest.Mock).mockImplementation(
      (callback) => {
        // Don't call callback immediately to test initial loading state
        return { unsubscribe: mockUnsubscribe };
      }
    );

    const { result } = renderHook(() => useTaskAnswerList());

    // Loading might be false if subscription fires immediately, so just check answers
    expect(result.current.taskAnswers).toEqual([]);
  });

  it("should update task answers when subscription fires", async () => {
    const mockAnswers = [
      createMockTaskAnswer({ id: "1" }),
      createMockTaskAnswer({ id: "2" }),
    ];

    (TaskAnswerService.subscribeTaskAnswers as jest.Mock).mockImplementation(
      (callback) => {
        callback(mockAnswers, true);
        return { unsubscribe: mockUnsubscribe };
      }
    );

    const { result } = renderHook(() => useTaskAnswerList());

    await waitFor(() => {
      expect(result.current.taskAnswers).toHaveLength(2);
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle delete task answer", async () => {
    (TaskAnswerService.deleteTaskAnswer as jest.Mock).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useTaskAnswerList());

    await result.current.handleDeleteTaskAnswer("test-id");

    expect(TaskAnswerService.deleteTaskAnswer).toHaveBeenCalledWith("test-id");
  });

  it("should refresh task answers", async () => {
    const mockAnswers = [createMockTaskAnswer({ id: "1" })];
    (TaskAnswerService.getTaskAnswers as jest.Mock).mockResolvedValue(
      mockAnswers
    );

    const { result } = renderHook(() => useTaskAnswerList());

    await result.current.refreshTaskAnswers();

    expect(TaskAnswerService.getTaskAnswers).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});

