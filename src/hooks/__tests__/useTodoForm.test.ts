import { renderHook, act } from "@testing-library/react-native";
import { useTodoForm } from "../useTodoForm";
import { TodoService } from "../../services/TodoService";
import { createMockTask } from "../../__tests__/__mocks__/DataStore.mock";

jest.mock("../../services/TodoService");

describe("useTodoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with empty values", () => {
    const { result } = renderHook(() => useTodoForm());

    expect(result.current.name).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should update name", () => {
    const { result } = renderHook(() => useTodoForm());

    act(() => {
      result.current.setName("New Todo");
    });

    expect(result.current.name).toBe("New Todo");
  });

  it("should update description", () => {
    const { result } = renderHook(() => useTodoForm());

    act(() => {
      result.current.setDescription("Todo Description");
    });

    expect(result.current.description).toBe("Todo Description");
  });

  it("should validate required name on submit", async () => {
    const { result } = renderHook(() => useTodoForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe("Todo name is required");
    expect(TodoService.createTodo).not.toHaveBeenCalled();
  });

  it("should create todo successfully", async () => {
    const mockTodo = createMockTask({ id: "todo-1", title: "Test Todo" });
    (TodoService.createTodo as jest.Mock).mockResolvedValue(mockTodo);
    const onTodoCreated = jest.fn();

    const { result } = renderHook(() => useTodoForm(onTodoCreated));

    act(() => {
      result.current.setName("Test Todo");
      result.current.setDescription("Test Description");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(TodoService.createTodo).toHaveBeenCalledWith({
      name: "Test Todo",
      description: "Test Description",
    });
    expect(onTodoCreated).toHaveBeenCalledWith(mockTodo);
    expect(result.current.name).toBe(""); // Form should be cleared
    expect(result.current.description).toBe("");
  });

  it("should handle submit error", async () => {
    const error = new Error("Create failed");
    (TodoService.createTodo as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTodoForm());

    act(() => {
      result.current.setName("Test Todo");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe(
      "Failed to create todo. Please try again."
    );
  });

  it("should trim name and description", async () => {
    const mockTodo = createMockTask({ id: "todo-1" });
    (TodoService.createTodo as jest.Mock).mockResolvedValue(mockTodo);

    const { result } = renderHook(() => useTodoForm());

    act(() => {
      result.current.setName("  Test Todo  ");
      result.current.setDescription("  Test Description  ");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(TodoService.createTodo).toHaveBeenCalledWith({
      name: "Test Todo",
      description: "Test Description",
    });
  });
});

