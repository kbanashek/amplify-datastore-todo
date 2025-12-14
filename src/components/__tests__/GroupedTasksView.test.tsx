import React from "react";
import { render } from "@testing-library/react-native";
import { GroupedTasksView } from "../GroupedTasksView";
import { createMockTask } from "../../__tests__/__mocks__/DataStore.mock";

// Mock TaskCard
jest.mock("../TaskCard", () => ({
  TaskCard: ({ task, onPress, simple }: any) => {
    const { Text, TouchableOpacity } = require("react-native");
    return (
      <TouchableOpacity
        testID={`task-card-${task.id}`}
        onPress={() => onPress?.(task)}
      >
        <Text>{task.title}</Text>
        {simple && <Text testID="simple-card">Simple</Text>}
      </TouchableOpacity>
    );
  },
}));

describe("GroupedTasksView", () => {
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    const { getByText } = render(
      <GroupedTasksView
        groupedTasks={[]}
        loading={true}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Loading tasks...")).toBeTruthy();
  });

  it("renders error state", () => {
    const { getByText } = render(
      <GroupedTasksView
        groupedTasks={[]}
        loading={false}
        error="Failed to load tasks"
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Failed to load tasks")).toBeTruthy();
  });

  it("renders empty state", () => {
    const { getByText } = render(
      <GroupedTasksView
        groupedTasks={[]}
        loading={false}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("No tasks available.")).toBeTruthy();
  });

  it("renders tasks grouped by day", () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const task1 = createMockTask({
      id: "task-1",
      title: "Today Task",
      expireTimeInMillSec: today.getTime(),
    });
    const task2 = createMockTask({
      id: "task-2",
      title: "Tomorrow Task",
      expireTimeInMillSec: tomorrow.getTime(),
    });

    const groupedTasks = [
      {
        dayLabel: "Today",
        dayDate: today.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        tasksWithoutTime: [],
        timeGroups: [
          {
            time: "11:45 AM",
            tasks: [task1],
          },
        ],
      },
      {
        dayLabel: "Tomorrow",
        dayDate: tomorrow.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        tasksWithoutTime: [],
        timeGroups: [
          {
            time: "2:30 PM",
            tasks: [task2],
          },
        ],
      },
    ];

    const { getByText, getByTestId } = render(
      <GroupedTasksView
        groupedTasks={groupedTasks}
        loading={false}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Today")).toBeTruthy();
    expect(getByText("Tomorrow")).toBeTruthy();
    expect(getByText("DUE BY 11:45 AM")).toBeTruthy();
    expect(getByText("DUE BY 2:30 PM")).toBeTruthy();
    expect(getByText("Today Task")).toBeTruthy();
    expect(getByText("Tomorrow Task")).toBeTruthy();
    expect(getByTestId(`task-card-${task1.id}`)).toBeTruthy();
    expect(getByTestId(`task-card-${task2.id}`)).toBeTruthy();
  });

  it("renders tasks without time as simple cards", () => {
    const task = createMockTask({
      title: "Task Without Time",
      expireTimeInMillSec: null,
    });

    const groupedTasks = [
      {
        dayLabel: "Today",
        dayDate: new Date().toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        tasksWithoutTime: [task],
        timeGroups: [],
      },
    ];

    const { getByText, getByTestId } = render(
      <GroupedTasksView
        groupedTasks={groupedTasks}
        loading={false}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Task Without Time")).toBeTruthy();
    expect(getByTestId("simple-card")).toBeTruthy();
  });

  it("renders multiple time groups for same day", () => {
    const today = new Date();
    const task1 = createMockTask({
      title: "Morning Task",
      expireTimeInMillSec: new Date(today.setHours(8, 0, 0, 0)).getTime(),
    });
    const task2 = createMockTask({
      title: "Evening Task",
      expireTimeInMillSec: new Date(today.setHours(20, 0, 0, 0)).getTime(),
    });

    const groupedTasks = [
      {
        dayLabel: "Today",
        dayDate: today.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        tasksWithoutTime: [],
        timeGroups: [
          {
            time: "8:00 AM",
            tasks: [task1],
          },
          {
            time: "8:00 PM",
            tasks: [task2],
          },
        ],
      },
    ];

    const { getByText } = render(
      <GroupedTasksView
        groupedTasks={groupedTasks}
        loading={false}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("DUE BY 8:00 AM")).toBeTruthy();
    expect(getByText("DUE BY 8:00 PM")).toBeTruthy();
    expect(getByText("Morning Task")).toBeTruthy();
    expect(getByText("Evening Task")).toBeTruthy();
  });

  it("shows date next to Today label", () => {
    const today = new Date();
    const dayDate = today.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const groupedTasks = [
      {
        dayLabel: "Today",
        dayDate,
        tasksWithoutTime: [],
        timeGroups: [],
      },
    ];

    const { getByText } = render(
      <GroupedTasksView
        groupedTasks={groupedTasks}
        loading={false}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Today")).toBeTruthy();
    expect(getByText(dayDate)).toBeTruthy();
  });

  it("shows date next to Tomorrow label", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayDate = tomorrow.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const groupedTasks = [
      {
        dayLabel: "Tomorrow",
        dayDate,
        tasksWithoutTime: [],
        timeGroups: [],
      },
    ];

    const { getByText } = render(
      <GroupedTasksView
        groupedTasks={groupedTasks}
        loading={false}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Tomorrow")).toBeTruthy();
    expect(getByText(dayDate)).toBeTruthy();
  });

  it("does not show date for other day labels", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dayDate = futureDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const groupedTasks = [
      {
        dayLabel: "Thu, Dec 11",
        dayDate,
        tasksWithoutTime: [],
        timeGroups: [],
      },
    ];

    const { getByText } = render(
      <GroupedTasksView
        groupedTasks={groupedTasks}
        loading={false}
        error={null}
        onTaskPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText("Thu, Dec 11")).toBeTruthy();
  });
});
