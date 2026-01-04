import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { TaskCard } from "@components/TaskCard";
import { Task, TaskStatus, TaskType, UpdateTaskInput } from "@task-types/Task";

// Mock TaskService
const mockUpdateTask = jest.fn().mockResolvedValue({});

jest.mock("@services/TaskService", () => ({
  TaskService: {
    updateTask: (id: string, input: Omit<UpdateTaskInput, "id" | "_version">) => 
      mockUpdateTask(id, input),
  },
}));

// Mock useTaskTranslation
const mockT = jest.fn((key: string) => key);

jest.mock("@translations/index", () => ({
  useTaskTranslation: jest.fn(() => ({
    t: mockT,
    currentLanguage: "en",
    isRTL: false,
  })),
}));

// Mock getTaskIcon
jest.mock("@utils/taskIcon", () => ({
  getTaskIcon: jest.fn((task: Task) => ({
    name: "pills",
    color: "#007AFF",
  })),
}));

// Mock TranslatedText
jest.mock("@components/TranslatedText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    TranslatedText: ({
      text,
      testID,
      ...props
    }: {
      text: string;
      testID?: string;
      [key: string]: unknown;
    }) => (
      <Text testID={testID} {...props}>
        {text}
      </Text>
    ),
  };
});

// Mock IconSymbol
jest.mock("@components/ui/IconSymbol", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    IconSymbol: ({ name }: { name: string }) => (
      <Text testID={`icon-${name}`}>{name}</Text>
    ),
  };
});

// Mock logger
jest.mock("@utils/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  })),
}));

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "task-1",
    pk: "USER#1",
    sk: "TASK#1",
    title: "Test Task",
    taskType: TaskType.SCHEDULED,
    status: TaskStatus.OPEN,
  };

  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation((key: string) => key);
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
      expect(getByTestId("task-card-title")).toBeTruthy();
    });

    it("renders task title", () => {
      const { getByText } = render(<TaskCard task={mockTask} />);
      expect(getByText("Test Task")).toBeTruthy();
    });

    it("renders with onPress handler", () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card")).toBeTruthy();
    });

    it("renders with simple prop", () => {
      const { getByTestId, queryByTestId } = render(
        <TaskCard task={mockTask} simple />
      );
      expect(getByTestId("task-card")).toBeTruthy();
      expect(queryByTestId("task-card-action-row")).toBeNull();
    });

    it("renders BEGIN button for non-started task", () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card-begin-button")).toBeTruthy();
    });

    it("renders RESUME button for started task", () => {
      const startedTask: Task = {
        ...mockTask,
        status: TaskStatus.STARTED,
      };
      const { getByTestId } = render(
        <TaskCard task={startedTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card-begin-button")).toBeTruthy();
    });

    it("renders completed badge for completed task", () => {
      const completedTask: Task = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
      };
      const { getByTestId, queryByTestId } = render(
        <TaskCard task={completedTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card-completed-badge")).toBeTruthy();
      expect(queryByTestId("task-card-begin-button")).toBeNull();
    });

    it("renders icon container", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card-icon-container")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls onPress when card is pressed", async () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("task-card"));
      await waitFor(() => {
        expect(mockOnPress).toHaveBeenCalledWith(mockTask);
      });
    });

    it("calls onPress when BEGIN button is pressed", async () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("task-card-begin-button"));
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, {
          status: TaskStatus.STARTED,
        });
        expect(mockOnPress).toHaveBeenCalledWith(mockTask);
      });
    });

    it("calls onPress when arrow button is pressed", () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("task-card-arrow-button"));
      expect(mockOnPress).toHaveBeenCalledWith(mockTask);
    });

    it("renders completed task without action buttons", () => {
      const completedTask: Task = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
      };
      const { getByTestId, queryByTestId } = render(
        <TaskCard task={completedTask} onPress={mockOnPress} />
      );
      // Completed task should show badge, not action buttons
      expect(getByTestId("task-card-completed-badge")).toBeTruthy();
      expect(queryByTestId("task-card-begin-button")).toBeNull();
      expect(queryByTestId("task-card-arrow-button")).toBeNull();
    });

    it("updates task status to STARTED when BEGIN is pressed", async () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("task-card-begin-button"));
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, {
          status: TaskStatus.STARTED,
        });
      });
    });

    it("does not update status if task is already started", async () => {
      const startedTask: Task = {
        ...mockTask,
        status: TaskStatus.STARTED,
      };
      const { getByTestId } = render(
        <TaskCard task={startedTask} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("task-card-begin-button"));
      await waitFor(() => {
        expect(mockOnPress).toHaveBeenCalled();
      });
      // Should not call updateTask if already started
      expect(mockUpdateTask).not.toHaveBeenCalled();
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { useTaskTranslation } = require("@translations/index");
      useTaskTranslation.mockReturnValueOnce({
        t: mockT,
        currentLanguage: "ar",
        isRTL: true,
      });

      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles task with empty title", () => {
      const emptyTitleTask: Task = {
        ...mockTask,
        title: "",
      };
      const { getByTestId } = render(<TaskCard task={emptyTitleTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
    });

    it("handles task with null title", () => {
      const nullTitleTask: Task = {
        ...mockTask,
        title: null as any,
      };
      const { getByTestId } = render(<TaskCard task={nullTitleTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
    });

    it("handles long task title", () => {
      const longTitleTask: Task = {
        ...mockTask,
        title:
          "This is a very long task title that should be truncated properly to two lines as specified in the component",
      };
      const { getByTestId } = render(<TaskCard task={longTitleTask} />);
      const title = getByTestId("task-card-title");
      expect(title).toBeTruthy();
      expect(title.props.numberOfLines).toBe(2);
    });

    it("handles task with INPROGRESS status", () => {
      const inProgressTask: Task = {
        ...mockTask,
        status: TaskStatus.INPROGRESS,
      };
      const { getByTestId } = render(
        <TaskCard task={inProgressTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card-begin-button")).toBeTruthy();
    });

    it("handles task with EXPIRED status", () => {
      const expiredTask: Task = {
        ...mockTask,
        status: TaskStatus.EXPIRED,
      };
      const { getByTestId } = render(<TaskCard task={expiredTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
    });

    it("handles task with VISIBLE status", () => {
      const visibleTask: Task = {
        ...mockTask,
        status: TaskStatus.VISIBLE,
      };
      const { getByTestId } = render(<TaskCard task={visibleTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
    });

    it("handles TaskService update error gracefully", async () => {
      mockUpdateTask.mockRejectedValueOnce(new Error("Update failed"));
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("task-card-begin-button"));
      // Wait for async operation to complete
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalled();
        // Should still call onPress even if update fails (consistent UX with card press)
        expect(mockOnPress).toHaveBeenCalled();
      });
    });

    it("handles card press error gracefully", async () => {
      mockUpdateTask.mockRejectedValueOnce(new Error("Update failed"));
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("task-card"));
      await waitFor(() => {
        // Should still call onPress even if update fails
        expect(mockOnPress).toHaveBeenCalled();
      });
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      const card = getByTestId("task-card");
      expect(card.props.accessibilityRole).toBe("button");
      expect(card.props.accessibilityLabel).toBe("Test Task");
    });

    it("has proper accessibility label for BEGIN button", () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      const button = getByTestId("task-card-begin-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBeTruthy();
    });

    it("has proper accessibility label for arrow button", () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      const button = getByTestId("task-card-arrow-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBe("Navigate to task");
    });

    it("card renders with disabled styling when task is completed", () => {
      const completedTask: Task = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
      };
      const { getByTestId } = render(
        <TaskCard task={completedTask} onPress={mockOnPress} />
      );
      // Card should render with completed badge instead of buttons
      expect(getByTestId("task-card-completed-badge")).toBeTruthy();
      expect(getByTestId("task-card")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<TaskCard task={mockTask} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with onPress", () => {
      const { toJSON } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with simple prop", () => {
      const { toJSON } = render(<TaskCard task={mockTask} simple />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with started task", () => {
      const startedTask: Task = {
        ...mockTask,
        status: TaskStatus.STARTED,
      };
      const { toJSON } = render(
        <TaskCard task={startedTask} onPress={mockOnPress} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with completed task", () => {
      const completedTask: Task = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
      };
      const { toJSON } = render(
        <TaskCard task={completedTask} onPress={mockOnPress} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with long title", () => {
      const longTitleTask: Task = {
        ...mockTask,
        title: "This is a very long task title that should be truncated",
      };
      const { toJSON } = render(<TaskCard task={longTitleTask} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testId on card container", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card")).toBeTruthy();
    });

    it("has testId on card content", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card-content")).toBeTruthy();
    });

    it("has testId on title", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card-title")).toBeTruthy();
    });

    it("has testId on icon container", () => {
      const { getByTestId } = render(<TaskCard task={mockTask} />);
      expect(getByTestId("task-card-icon-container")).toBeTruthy();
    });

    it("has testId on BEGIN button", () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card-begin-button")).toBeTruthy();
    });

    it("has testId on arrow button", () => {
      const { getByTestId } = render(
        <TaskCard task={mockTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card-arrow-button")).toBeTruthy();
    });

    it("has testId on completed badge", () => {
      const completedTask: Task = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
      };
      const { getByTestId } = render(
        <TaskCard task={completedTask} onPress={mockOnPress} />
      );
      expect(getByTestId("task-card-completed-badge")).toBeTruthy();
    });
  });
});
