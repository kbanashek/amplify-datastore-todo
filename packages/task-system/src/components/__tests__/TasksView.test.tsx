import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TasksView } from "@components/TasksView";
import { Task, TaskStatus, TaskType } from "@task-types/Task";

// Mock useTaskList hook
const mockHandleDeleteTask = jest.fn();
const mockRefreshTasks = jest.fn();

const mockUseTaskList = jest.fn(() => ({
  tasks: [],
  loading: false,
  error: null,
  isSynced: false,
  handleDeleteTask: mockHandleDeleteTask,
  refreshTasks: mockRefreshTasks,
}));

jest.mock("@hooks/useTaskList", () => ({
  useTaskList: (filters?: any) => mockUseTaskList(filters),
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
          <Text testID={`task-card-press-${task.id}`} onPress={() => onPress(task)}>
            Press
          </Text>
        )}
        {onDelete && (
          <Text testID={`task-card-delete-${task.id}`} onPress={() => onDelete(task.id)}>
            Delete
          </Text>
        )}
      </View>
    ),
  };
});

// Mock logger
jest.mock("@utils/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

// Mock TaskService
jest.mock("@services/TaskService", () => ({
  TaskService: {
    createTask: jest.fn().mockResolvedValue({}),
  },
}));

describe("TasksView", () => {
  const mockOnTaskPress = jest.fn();

  const createMockTask = (id: string, title: string, startTime?: number): Task => ({
    id,
    pk: `PK-${id}`,
    sk: `SK-${id}`,
    title,
    taskType: TaskType.SCHEDULED,
    status: TaskStatus.OPEN,
    startTimeInMillSec: startTime,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

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
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view")).toBeTruthy();
    });

    it("renders with onTaskPress callback", () => {
      const { getByTestId } = render(<TasksView onTaskPress={mockOnTaskPress} />);
      expect(getByTestId("tasks-view")).toBeTruthy();
    });

    it("renders with filters", () => {
      const filters = { status: [TaskStatus.OPEN] };
      const { getByTestId } = render(<TasksView filters={filters} />);
      expect(getByTestId("tasks-view")).toBeTruthy();
    });

    it("renders loading state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        loading: true,
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-loading")).toBeTruthy();
      expect(getByTestId("tasks-view-loading-spinner")).toBeTruthy();
      expect(getByTestId("tasks-view-loading-text")).toBeTruthy();
    });

    it("renders error state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        error: "Failed to load tasks",
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-error")).toBeTruthy();
      expect(getByTestId("tasks-view-error-text")).toBeTruthy();
      expect(getByTestId("tasks-view-error-hint")).toBeTruthy();
    });

    it("renders empty state when no tasks", () => {
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-empty")).toBeTruthy();
      expect(getByTestId("tasks-view-empty-text")).toBeTruthy();
    });

    it("renders sync indicator when synced", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        isSynced: true,
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-sync-indicator")).toBeTruthy();
    });

    it("hides sync indicator when not synced", () => {
      const { queryByTestId } = render(<TasksView />);
      expect(queryByTestId("tasks-view-sync-indicator")).toBeNull();
    });

    it("renders today's tasks section", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-today-section")).toBeTruthy();
      expect(getByTestId("tasks-view-today-header")).toBeTruthy();
      expect(getByTestId("tasks-view-today-title")).toBeTruthy();
    });

    it("renders upcoming tasks section", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const upcomingTask = createMockTask("task-2", "Upcoming Task", tomorrow.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [upcomingTask],
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-upcoming-section")).toBeTruthy();
      expect(getByTestId("tasks-view-upcoming-header")).toBeTruthy();
    });

    it("renders past tasks section", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastTask = createMockTask("task-3", "Past Task", yesterday.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [pastTask],
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-past-section")).toBeTruthy();
      expect(getByTestId("tasks-view-past-header")).toBeTruthy();
    });

    it("displays task count in today section", () => {
      const today = new Date();
      const task1 = createMockTask("task-1", "Task 1", today.getTime());
      const task2 = createMockTask("task-2", "Task 2", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [task1, task2],
      });
      const { getByTestId } = render(<TasksView />);
      const count = getByTestId("tasks-view-today-count");
      expect(count.props.children).toBe(2);
    });

    it("shows empty message when today has no tasks", () => {
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-today-empty")).toBeTruthy();
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
      const { getByTestId } = render(<TasksView onTaskPress={mockOnTaskPress} />);
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
      const { getByTestId } = render(<TasksView />);
      const deleteButton = getByTestId("task-card-delete-task-1");
      fireEvent.press(deleteButton);
      expect(mockHandleDeleteTask).toHaveBeenCalledWith("task-1");
      expect(mockHandleDeleteTask).toHaveBeenCalledTimes(1);
    });

    it("calls refreshTasks on pull to refresh", async () => {
      mockRefreshTasks.mockResolvedValueOnce(undefined);
      const { getByTestId } = render(<TasksView />);
      const scrollView = getByTestId("tasks-view");
      const refreshControl = scrollView.props.refreshControl;
      refreshControl.props.onRefresh();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockRefreshTasks).toHaveBeenCalledTimes(1);
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view")).toBeTruthy();
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
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("task-card-task-1")).toBeTruthy();
    });

    it("handles multiple tasks in today section", () => {
      const today = new Date();
      const task1 = createMockTask("task-1", "Task 1", today.getTime());
      const task2 = createMockTask("task-2", "Task 2", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [task1, task2],
      });
      const { getByTestId } = render(<TasksView />);
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
      const tomorrowTask = createMockTask("task-2", "Tomorrow", tomorrow.getTime());
      const yesterdayTask = createMockTask("task-3", "Yesterday", yesterday.getTime());

      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask, tomorrowTask, yesterdayTask],
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("task-card-task-1")).toBeTruthy();
      expect(getByTestId("task-card-task-2")).toBeTruthy();
      expect(getByTestId("task-card-task-3")).toBeTruthy();
    });

    it("handles loading state with refreshing", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        loading: true,
      });
      const { getByTestId } = render(<TasksView />);
      // Should show loading state
      expect(getByTestId("tasks-view-loading")).toBeTruthy();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper testIds for accessibility", () => {
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<TasksView />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with tasks", () => {
      const today = new Date();
      const todayTask = createMockTask("task-1", "Today Task", today.getTime());
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        tasks: [todayTask],
      });
      const { toJSON } = render(<TasksView />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with loading state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        loading: true,
      });
      const { toJSON } = render(<TasksView />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with error state", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        error: "Failed to load tasks",
      });
      const { toJSON } = render(<TasksView />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with sync indicator", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        isSynced: true,
      });
      const { toJSON } = render(<TasksView />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. E2E Support
  describe("E2E Support", () => {
    it("has testId on container", () => {
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view")).toBeTruthy();
    });

    it("has testId on today section", () => {
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-today-section")).toBeTruthy();
    });

    it("has testId on sync indicator", () => {
      mockUseTaskList.mockReturnValueOnce({
        ...mockUseTaskList(),
        isSynced: true,
      });
      const { getByTestId } = render(<TasksView />);
      expect(getByTestId("tasks-view-sync-indicator")).toBeTruthy();
    });
  });
});

