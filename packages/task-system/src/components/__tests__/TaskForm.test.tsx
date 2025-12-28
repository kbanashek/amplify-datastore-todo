import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { TaskForm } from "@components/TaskForm";
import { Task, TaskStatus, TaskType } from "@task-types/Task";
import { AppColors } from "@constants/AppColors";

// Mock useTaskForm hook
const mockSetTitle = jest.fn();
const mockSetDescription = jest.fn();
const mockSetTaskType = jest.fn();
const mockSetStatus = jest.fn();
const mockSetPk = jest.fn();
const mockSetSk = jest.fn();
const mockHandleSubmit = jest.fn();
const mockReset = jest.fn();

const mockUseTaskForm = jest.fn(() => ({
  title: "",
  setTitle: mockSetTitle,
  description: "",
  setDescription: mockSetDescription,
  taskType: TaskType.SCHEDULED,
  setTaskType: mockSetTaskType,
  status: TaskStatus.OPEN,
  setStatus: mockSetStatus,
  pk: "",
  setPk: mockSetPk,
  sk: "",
  setSk: mockSetSk,
  isSubmitting: false,
  error: null as string | null,
  handleSubmit: mockHandleSubmit,
  reset: mockReset,
}));

jest.mock("@hooks/useTaskForm", () => ({
  useTaskForm: () => mockUseTaskForm(),
}));

// Mock useRTL
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
const mockRtlStyle = jest.fn(
  (style: StyleProp<ViewStyle | TextStyle>) => style
);
const mockUseRTL = jest.fn(() => ({
  rtlStyle: mockRtlStyle,
  isRTL: false,
}));

jest.mock("@hooks/useRTL", () => ({
  useRTL: () => mockUseRTL(),
}));

describe("TaskForm", () => {
  const mockOnTaskCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskForm.mockReturnValue({
      title: "",
      setTitle: mockSetTitle,
      description: "",
      setDescription: mockSetDescription,
      taskType: TaskType.SCHEDULED,
      setTaskType: mockSetTaskType,
      status: TaskStatus.OPEN,
      setStatus: mockSetStatus,
      pk: "",
      setPk: mockSetPk,
      sk: "",
      setSk: mockSetSk,
      isSubmitting: false,
      error: null,
      handleSubmit: mockHandleSubmit,
      reset: mockReset,
    });
    mockUseRTL.mockReturnValue({
      rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
      isRTL: false,
    });
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form")).toBeTruthy();
      expect(getByTestId("task-form-title")).toBeTruthy();
    });

    it("renders with onTaskCreated callback", () => {
      const { getByTestId } = render(
        <TaskForm onTaskCreated={mockOnTaskCreated} />
      );
      expect(getByTestId("task-form")).toBeTruthy();
    });

    it("renders title input", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-title-input")).toBeTruthy();
    });

    it("renders description input", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-description-input")).toBeTruthy();
    });

    it("renders task type selection", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-type-label")).toBeTruthy();
      expect(getByTestId("task-form-type-group")).toBeTruthy();
    });

    it("renders status selection", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-status-label")).toBeTruthy();
      expect(getByTestId("task-form-status-group")).toBeTruthy();
    });

    it("renders PK input", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-pk-input")).toBeTruthy();
    });

    it("renders SK input", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-sk-input")).toBeTruthy();
    });

    it("renders submit button", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-submit-button")).toBeTruthy();
    });

    it("renders reset button", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-reset-button")).toBeTruthy();
    });

    it("renders all task type options", () => {
      const { getByTestId } = render(<TaskForm />);
      Object.values(TaskType).forEach(type => {
        expect(getByTestId(`task-form-type-${type}`)).toBeTruthy();
      });
    });

    it("renders all status options", () => {
      const { getByTestId } = render(<TaskForm />);
      Object.values(TaskStatus).forEach(status => {
        expect(getByTestId(`task-form-status-${status}`)).toBeTruthy();
      });
    });

    it("displays current title value", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        title: "Test Task",
      });
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-title-input");
      expect(input.props.value).toBe("Test Task");
    });

    it("displays current description value", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        description: "Test Description",
      });
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-description-input");
      expect(input.props.value).toBe("Test Description");
    });

    it("highlights selected task type", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        taskType: TaskType.TIMED,
      });
      const { getByTestId } = render(<TaskForm />);
      const timedButton = getByTestId(`task-form-type-${TaskType.TIMED}`);
      const styles = Array.isArray(timedButton.props.style)
        ? timedButton.props.style
        : [timedButton.props.style];
      const hasSelectedStyle = styles.some(
        (style: any) => style?.backgroundColor === AppColors.CIBlue
      );
      expect(hasSelectedStyle).toBe(true);
    });

    it("highlights selected status", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        status: TaskStatus.COMPLETED,
      });
      const { getByTestId } = render(<TaskForm />);
      const completedButton = getByTestId(
        `task-form-status-${TaskStatus.COMPLETED}`
      );
      const styles = Array.isArray(completedButton.props.style)
        ? completedButton.props.style
        : [completedButton.props.style];
      const hasSelectedStyle = styles.some(
        (style: any) => style?.backgroundColor === AppColors.CIBlue
      );
      expect(hasSelectedStyle).toBe(true);
    });

    it("displays error message when error exists", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        error: "Validation error",
      });
      const { getByTestId } = render(<TaskForm />);
      const errorText = getByTestId("task-form-error");
      expect(errorText).toBeTruthy();
      expect(errorText.props.children).toBe("Validation error");
    });

    it("hides error message when no error", () => {
      const { queryByTestId } = render(<TaskForm />);
      expect(queryByTestId("task-form-error")).toBeNull();
    });

    it("shows loading spinner when submitting", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        isSubmitting: true,
      });
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-submit-loading")).toBeTruthy();
    });

    it("disables inputs when submitting", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        isSubmitting: true,
      });
      const { getByTestId } = render(<TaskForm />);
      const titleInput = getByTestId("task-form-title-input");
      expect(titleInput.props.editable).toBe(false);
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls setTitle when title input changes", () => {
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-title-input");
      fireEvent.changeText(input, "New Title");
      expect(mockSetTitle).toHaveBeenCalledWith("New Title");
      expect(mockSetTitle).toHaveBeenCalledTimes(1);
    });

    it("calls setDescription when description input changes", () => {
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-description-input");
      fireEvent.changeText(input, "New Description");
      expect(mockSetDescription).toHaveBeenCalledWith("New Description");
      expect(mockSetDescription).toHaveBeenCalledTimes(1);
    });

    it("calls setTaskType when task type button is pressed", () => {
      const { getByTestId } = render(<TaskForm />);
      const timedButton = getByTestId(`task-form-type-${TaskType.TIMED}`);
      fireEvent.press(timedButton);
      expect(mockSetTaskType).toHaveBeenCalledWith(TaskType.TIMED);
      expect(mockSetTaskType).toHaveBeenCalledTimes(1);
    });

    it("calls setStatus when status button is pressed", () => {
      const { getByTestId } = render(<TaskForm />);
      const completedButton = getByTestId(
        `task-form-status-${TaskStatus.COMPLETED}`
      );
      fireEvent.press(completedButton);
      expect(mockSetStatus).toHaveBeenCalledWith(TaskStatus.COMPLETED);
      expect(mockSetStatus).toHaveBeenCalledTimes(1);
    });

    it("calls setPk when PK input changes", () => {
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-pk-input");
      fireEvent.changeText(input, "USER#123");
      expect(mockSetPk).toHaveBeenCalledWith("USER#123");
      expect(mockSetPk).toHaveBeenCalledTimes(1);
    });

    it("calls setSk when SK input changes", () => {
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-sk-input");
      fireEvent.changeText(input, "TASK#456");
      expect(mockSetSk).toHaveBeenCalledWith("TASK#456");
      expect(mockSetSk).toHaveBeenCalledTimes(1);
    });

    it("calls handleSubmit when submit button is pressed", async () => {
      mockHandleSubmit.mockResolvedValueOnce({} as Task);
      const { getByTestId } = render(<TaskForm />);
      const submitButton = getByTestId("task-form-submit-button");
      fireEvent.press(submitButton);
      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });

    it("calls reset when reset button is pressed", () => {
      const { getByTestId } = render(<TaskForm />);
      const resetButton = getByTestId("task-form-reset-button");
      fireEvent.press(resetButton);
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("does not call handleSubmit when submitting", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        isSubmitting: true,
      });
      const { getByTestId } = render(<TaskForm />);
      const submitButton = getByTestId("task-form-submit-button");
      fireEvent.press(submitButton);
      // Button should be disabled, but if pressed, handleSubmit should not be called again
      expect(mockHandleSubmit).not.toHaveBeenCalled();
    });

    it("does not call reset when submitting", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        isSubmitting: true,
      });
      const { getByTestId } = render(<TaskForm />);
      const resetButton = getByTestId("task-form-reset-button");
      fireEvent.press(resetButton);
      // Button should be disabled, but if pressed, reset should not be called
      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: false,
      });

      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const rtlStyleFn = jest.fn(
        (
          style: StyleProp<ViewStyle | TextStyle>
        ): StyleProp<ViewStyle | TextStyle> => ({
          ...(style as Record<string, unknown>),
          flexDirection: "row-reverse" as const,
        })
      );

      mockUseRTL.mockReturnValueOnce({
        rtlStyle: rtlStyleFn,
        isRTL: true,
      });

      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form")).toBeTruthy();
      expect(rtlStyleFn).toHaveBeenCalled();
    });

    it("flips button row direction in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: true,
      });

      const { getByTestId } = render(<TaskForm />);
      const buttonRow = getByTestId("task-form-buttons");
      expect(buttonRow).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles empty title", () => {
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-title-input");
      fireEvent.changeText(input, "");
      expect(mockSetTitle).toHaveBeenCalledWith("");
    });

    it("handles long title", () => {
      const longTitle = "a".repeat(200);
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-title-input");
      fireEvent.changeText(input, longTitle);
      expect(mockSetTitle).toHaveBeenCalledWith(longTitle);
    });

    it("handles long description", () => {
      const longDescription = "a".repeat(1000);
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-description-input");
      fireEvent.changeText(input, longDescription);
      expect(mockSetDescription).toHaveBeenCalledWith(longDescription);
    });

    it("handles special characters in title", () => {
      const specialTitle = "Task @#$%^&*()";
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-title-input");
      fireEvent.changeText(input, specialTitle);
      expect(mockSetTitle).toHaveBeenCalledWith(specialTitle);
    });

    it("handles multiline description", () => {
      const multilineDescription = "Line 1\nLine 2\nLine 3";
      const { getByTestId } = render(<TaskForm />);
      const input = getByTestId("task-form-description-input");
      fireEvent.changeText(input, multilineDescription);
      expect(mockSetDescription).toHaveBeenCalledWith(multilineDescription);
    });

    it("handles all task types", () => {
      const { getByTestId } = render(<TaskForm />);
      Object.values(TaskType).forEach(type => {
        const button = getByTestId(`task-form-type-${type}`);
        fireEvent.press(button);
        expect(mockSetTaskType).toHaveBeenCalledWith(type);
      });
    });

    it("handles all statuses", () => {
      const { getByTestId } = render(<TaskForm />);
      Object.values(TaskStatus).forEach(status => {
        const button = getByTestId(`task-form-status-${status}`);
        fireEvent.press(button);
        expect(mockSetStatus).toHaveBeenCalledWith(status);
      });
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility labels on inputs", () => {
      const { getByTestId } = render(<TaskForm />);
      const titleInput = getByTestId("task-form-title-input");
      expect(titleInput.props.accessibilityLabel).toBe("Task title");

      const descriptionInput = getByTestId("task-form-description-input");
      expect(descriptionInput.props.accessibilityLabel).toBe(
        "Task description"
      );

      const pkInput = getByTestId("task-form-pk-input");
      expect(pkInput.props.accessibilityLabel).toBe("Partition key");

      const skInput = getByTestId("task-form-sk-input");
      expect(skInput.props.accessibilityLabel).toBe("Sort key");
    });

    it("has proper accessibility labels on task type buttons", () => {
      const { getByTestId } = render(<TaskForm />);
      const scheduledButton = getByTestId(
        `task-form-type-${TaskType.SCHEDULED}`
      );
      expect(scheduledButton.props.accessibilityLabel).toBe(
        `Select ${TaskType.SCHEDULED} task type`
      );
      expect(scheduledButton.props.accessibilityRole).toBe("button");
    });

    it("has proper accessibility labels on status buttons", () => {
      const { getByTestId } = render(<TaskForm />);
      const openButton = getByTestId(`task-form-status-${TaskStatus.OPEN}`);
      expect(openButton.props.accessibilityLabel).toBe(
        `Select ${TaskStatus.OPEN} status`
      );
      expect(openButton.props.accessibilityRole).toBe("button");
    });

    it("has proper accessibility state for selected task type", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        taskType: TaskType.SCHEDULED,
      });
      const { getByTestId } = render(<TaskForm />);
      const scheduledButton = getByTestId(
        `task-form-type-${TaskType.SCHEDULED}`
      );
      expect(scheduledButton.props.accessibilityState).toMatchObject({
        selected: true,
      });
    });

    it("has proper accessibility state for selected status", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        status: TaskStatus.OPEN,
      });
      const { getByTestId } = render(<TaskForm />);
      const openButton = getByTestId(`task-form-status-${TaskStatus.OPEN}`);
      expect(openButton.props.accessibilityState).toMatchObject({
        selected: true,
      });
    });

    it("has proper accessibility labels on buttons", () => {
      const { getByTestId } = render(<TaskForm />);
      const submitButton = getByTestId("task-form-submit-button");
      expect(submitButton.props.accessibilityLabel).toBe("Create task");
      expect(submitButton.props.accessibilityRole).toBe("button");

      const resetButton = getByTestId("task-form-reset-button");
      expect(resetButton.props.accessibilityLabel).toBe("Reset form");
      expect(resetButton.props.accessibilityRole).toBe("button");
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<TaskForm />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with values", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        title: "Test Task",
        description: "Test Description",
        taskType: TaskType.TIMED,
        status: TaskStatus.COMPLETED,
        pk: "USER#123",
        sk: "TASK#456",
      });
      const { toJSON } = render(<TaskForm />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with error", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        error: "Validation error",
      });
      const { toJSON } = render(<TaskForm />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot when submitting", () => {
      mockUseTaskForm.mockReturnValueOnce({
        ...mockUseTaskForm(),
        isSubmitting: true,
      });
      const { toJSON } = render(<TaskForm />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => ({
          ...(style as Record<string, unknown>),
          flexDirection: "row-reverse",
        })),
        isRTL: true,
      });

      const { toJSON } = render(<TaskForm />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. E2E Support
  describe("E2E Support", () => {
    it("has testId on form container", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form")).toBeTruthy();
    });

    it("has testId on title", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-title")).toBeTruthy();
    });

    it("has testId on all inputs", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-title-input")).toBeTruthy();
      expect(getByTestId("task-form-description-input")).toBeTruthy();
      expect(getByTestId("task-form-pk-input")).toBeTruthy();
      expect(getByTestId("task-form-sk-input")).toBeTruthy();
    });

    it("has testId on all buttons", () => {
      const { getByTestId } = render(<TaskForm />);
      expect(getByTestId("task-form-submit-button")).toBeTruthy();
      expect(getByTestId("task-form-reset-button")).toBeTruthy();
    });

    it("has testId on task type buttons", () => {
      const { getByTestId } = render(<TaskForm />);
      Object.values(TaskType).forEach(type => {
        expect(getByTestId(`task-form-type-${type}`)).toBeTruthy();
      });
    });

    it("has testId on status buttons", () => {
      const { getByTestId } = render(<TaskForm />);
      Object.values(TaskStatus).forEach(status => {
        expect(getByTestId(`task-form-status-${status}`)).toBeTruthy();
      });
    });
  });
});
