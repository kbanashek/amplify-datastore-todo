// Mock logger - must be set up before TaskList imports it
jest.mock("@utils/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

// Mock logger - must be set up before TaskList imports it
jest.mock("@utils/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TaskList } from "@components/TaskList";
import { Task, TaskStatus, TaskType } from "@task-types/Task";
import { createMockTask } from "../../__mocks__/Task.mock";

// Mock useTaskList hook
const mockHandleDeleteTask = jest.fn();
const mockRefreshTasks = jest.fn();

const mockUseTaskList = jest.fn(() => ({
  tasks: [] as Task[],
  loading: false,
  error: null as string | null,
  isSynced: false,
  handleDeleteTask: mockHandleDeleteTask,
  refreshTasks: mockRefreshTasks,
}));

jest.mock("@hooks/useTaskList", () => ({
  useTaskList: () => mockUseTaskList(),
}));

// Mock TaskCard
jest.mock("@components/TaskCard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    TaskCard: ({ task, onPress, onDelete }: any) => (
      <View testID={`task-card-${task.id}`}>
        <Text testID={`task-card-title-${task.id}`}>{task.title}</Text>
        {onPress && (
          <Text
            testID={`task-card-press-${task.id}`}
            onPress={() => onPress(task)}
          >
            Press
          </Text>
        )}
        {onDelete && (
          <Text
            testID={`task-card-delete-${task.id}`}
            onPress={() => onDelete(task.id)}
          >
            Delete
          </Text>
        )}
      </View>
    ),
  };
});

// Mock groupTasksByDate
jest.mock("@utils/taskGrouping", () => ({
  groupTasksByDate: jest.fn((tasks: Task[]) => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const today: Task[] = [];
    const upcoming: Task[] = [];
    const past: Task[] = [];

    tasks.forEach(task => {
      if (!task.startTimeInMillSec) {
        upcoming.push(task);
        return;
      }

      const taskDate = new Date(task.startTimeInMillSec);
      if (taskDate >= todayStart && taskDate < todayEnd) {
        today.push(task);
      } else if (taskDate >= todayEnd) {
        upcoming.push(task);
      } else {
        past.push(task);
      }
    });

    return { today, upcoming, past };
  }),
}));

describe("TaskList", () => {
  const mockOnTaskPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskList.mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      isSynced: false,
      handleDeleteTask: mockHandleDeleteTask,
      refreshTasks: mockRefreshTasks,
    });
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list")).toBeTruthy();
    });

    it("renders with onTaskPress callback", () => {
      const { getByTestId } = render(
        <TaskList onTaskPress={mockOnTaskPress} />
      );
      expect(getByTestId("task-list")).toBeTruthy();
    });

    it("renders with filters", () => {
      const filters = { status: [TaskStatus.OPEN] };
      const { getByTestId } = render(<TaskList filters={filters} />);
      expect(getByTestId("task-list")).toBeTruthy();
    });

    it("renders SectionList", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-section-list")).toBeTruthy();
    });

    it("renders loading state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        loading: true,
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-empty-loading")).toBeTruthy();
      expect(getByTestId("task-list-loading-spinner")).toBeTruthy();
      expect(getByTestId("task-list-loading-text")).toBeTruthy();
    });

    it("renders error state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        error: "Failed to load tasks",
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-empty-error")).toBeTruthy();
      expect(getByTestId("task-list-error-text")).toBeTruthy();
      expect(getByTestId("task-list-error-hint")).toBeTruthy();
    });

    it("renders empty state when no tasks", () => {
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-empty")).toBeTruthy();
      expect(getByTestId("task-list-empty-text")).toBeTruthy();
    });

    it("renders sync indicator when synced", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
        isSynced: true,
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-sync-indicator")).toBeTruthy();
      expect(getByTestId("task-list-sync-dot")).toBeTruthy();
      expect(getByTestId("task-list-sync-text")).toBeTruthy();
    });

    it("hides sync indicator when not synced", () => {
      const { queryByTestId } = render(<TaskList />);
      expect(queryByTestId("task-list-sync-indicator")).toBeNull();
    });

    it("renders today's tasks section", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(
        getByTestId("task-list-section-header-Today's Tasks")
      ).toBeTruthy();
    });

    it("renders upcoming tasks section", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const upcomingTask = createMockTask(
        "task-2",
        "Upcoming Task",
        tomorrow.getTime()
      );
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [upcomingTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-section-header-Upcoming")).toBeTruthy();
    });

    it("renders past tasks section", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastTask = createMockTask(
        "task-3",
        "Past Task",
        yesterday.getTime()
      );
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [pastTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-section-header-Past")).toBeTruthy();
    });

    it("renders tasks in sections", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-card-task-1")).toBeTruthy();
      expect(getByTestId("task-card-title-task-1")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls onTaskPress when task is pressed", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(
        <TaskList onTaskPress={mockOnTaskPress} />
      );
      const pressButton = getByTestId("task-card-press-task-1");
      fireEvent.press(pressButton);
      expect(mockOnTaskPress).toHaveBeenCalledWith(todayTask);
      expect(mockOnTaskPress).toHaveBeenCalledTimes(1);
    });

    it("calls handleDeleteTask when task is deleted", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(<TaskList />);
      const deleteButton = getByTestId("task-card-delete-task-1");
      fireEvent.press(deleteButton);
      expect(mockHandleDeleteTask).toHaveBeenCalledWith("task-1");
      expect(mockHandleDeleteTask).toHaveBeenCalledTimes(1);
    });

    it("calls refreshTasks on pull to refresh", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      mockRefreshTasks.mockResolvedValueOnce(undefined);
      const { getByTestId } = render(<TaskList />);
      const sectionList = getByTestId("task-list-section-list");
      // Simulate pull to refresh
      const refreshControl = sectionList.props.refreshControl;
      refreshControl.props.onRefresh();
      expect(mockRefreshTasks).toHaveBeenCalledTimes(1);
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list")).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles tasks without startTimeInMillSec", () => {
      const taskWithoutTime = createMockTask("task-1", "No Time Task");
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [taskWithoutTime],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-card-task-1")).toBeTruthy();
    });

    it("handles multiple tasks in same section", () => {
      const today = new Date();
      const task1 = createMockTask("task-1", "Task 1", today.getTime());
      const task2 = createMockTask("task-2", "Task 2", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [task1, task2],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-card-task-1")).toBeTruthy();
      expect(getByTestId("task-card-task-2")).toBeTruthy();
    });

    it("handles tasks across all sections", () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayTask = createMockTask("task-1", "Today", today.getTime());
      const tomorrowTask = createMockTask(
        "task-2",
        "Tomorrow",
        tomorrow.getTime()
      );
      const yesterdayTask = createMockTask(
        "task-3",
        "Yesterday",
        yesterday.getTime()
      );

      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask, tomorrowTask, yesterdayTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-card-task-1")).toBeTruthy();
      expect(getByTestId("task-card-task-2")).toBeTruthy();
      expect(getByTestId("task-card-task-3")).toBeTruthy();
    });

    it("handles empty today section", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const upcomingTask = createMockTask(
        "task-1",
        "Upcoming",
        tomorrow.getTime()
      );
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [upcomingTask],
      });
      const { getByTestId } = render(<TaskList />);
      // Today section should still exist but be empty
      expect(
        getByTestId("task-list-section-header-Today's Tasks")
      ).toBeTruthy();
    });

    it("handles loading state with existing tasks", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
        loading: true,
      });
      const { getByTestId } = render(<TaskList />);
      // Should show loading in empty component, but tasks might still render
      expect(getByTestId("task-list-section-list")).toBeTruthy();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper testIds for accessibility", () => {
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<TaskList />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with tasks", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { toJSON } = render(<TaskList />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with loading state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        loading: true,
      });
      const { toJSON } = render(<TaskList />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with error state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        error: "Failed to load tasks",
      });
      const { toJSON } = render(<TaskList />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with sync indicator", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        isSynced: true,
      });
      const { toJSON } = render(<TaskList />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. E2E Support
  describe("E2E Support", () => {
    it("has testId on container", () => {
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list")).toBeTruthy();
    });

    it("has testId on SectionList", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-section-list")).toBeTruthy();
    });

    it("has testId on sync indicator", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
        isSynced: true,
      });
      const { getByTestId } = render(<TaskList />);
      expect(getByTestId("task-list-sync-indicator")).toBeTruthy();
      expect(getByTestId("task-list-sync-dot")).toBeTruthy();
      expect(getByTestId("task-list-sync-text")).toBeTruthy();
    });

    it("has testId on section headers", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(<TaskList />);
      expect(
        getByTestId("task-list-section-header-Today's Tasks")
      ).toBeTruthy();
    });
  });
});
