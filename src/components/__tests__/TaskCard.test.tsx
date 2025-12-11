import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { TaskCard } from "../TaskCard";
import { TaskService } from "../../services/TaskService";
import { Task, TaskStatus, TaskType } from "../../types/Task";
import { createMockTask } from "../../__tests__/__mocks__/DataStore.mock";

// Mock TaskService
jest.mock("../../services/TaskService", () => ({
  TaskService: {
    updateTask: jest.fn(),
  },
}));

// Mock IconSymbol
jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({ name, size, color }: any) => {
    const { View, Text } = require("react-native");
    return (
      <View testID={`icon-${name}`}>
        <Text>{name}</Text>
      </View>
    );
  },
}));

describe("TaskCard", () => {
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders task title correctly", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.OPEN,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByText("Test Task")).toBeTruthy();
  });

  it("renders untitled task when title is missing", () => {
    const task = createMockTask({
      title: null,
      status: TaskStatus.OPEN,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByText("Untitled Task")).toBeTruthy();
  });

  it("calls onPress when card is pressed", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.OPEN,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    fireEvent.press(getByText("Test Task").parent?.parent?.parent as any);
    expect(mockOnPress).toHaveBeenCalledWith(task);
  });

  it("shows BEGIN button when simple is false", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.OPEN,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} simple={false} />
    );

    expect(getByText("BEGIN")).toBeTruthy();
  });

  it("shows RESUME button when task is STARTED", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.STARTED,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} simple={false} />
    );

    expect(getByText("RESUME")).toBeTruthy();
  });

  it("shows RESUME button when task is INPROGRESS", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.INPROGRESS,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} simple={false} />
    );

    expect(getByText("RESUME")).toBeTruthy();
  });

  it("does not show BEGIN button when simple is true", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.OPEN,
    });

    const { queryByText } = render(
      <TaskCard task={task} onPress={mockOnPress} simple={true} />
    );

    expect(queryByText("BEGIN")).toBeNull();
    expect(queryByText("RESUME")).toBeNull();
  });

  it("updates task status to STARTED when BEGIN is pressed", async () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.OPEN,
    });

    (TaskService.updateTask as jest.Mock).mockResolvedValue({
      ...task,
      status: TaskStatus.STARTED,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} simple={false} />
    );

    fireEvent.press(getByText("BEGIN"));

    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalledWith(task.id, {
        status: TaskStatus.STARTED,
      });
    });
  });

  it("does not update status when BEGIN is pressed on already STARTED task", async () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.STARTED,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} simple={false} />
    );

    fireEvent.press(getByText("RESUME"));

    await waitFor(() => {
      expect(TaskService.updateTask).not.toHaveBeenCalled();
    });
  });

  it("calls onPress after BEGIN button is pressed", async () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.OPEN,
    });

    (TaskService.updateTask as jest.Mock).mockResolvedValue({
      ...task,
      status: TaskStatus.STARTED,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} simple={false} />
    );

    fireEvent.press(getByText("BEGIN"));

    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalledWith(task);
    });
  });

  it("displays status badge for COMPLETED tasks", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.COMPLETED,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByText("COMPLETED")).toBeTruthy();
  });

  it("displays status badge for INPROGRESS tasks", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.INPROGRESS,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByText("IN PROGRESS")).toBeTruthy();
  });

  it("displays status badge for STARTED tasks", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.STARTED,
    });

    const { getByText } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByText("STARTED")).toBeTruthy();
  });

  it("does not display status badge for OPEN tasks", () => {
    const task = createMockTask({
      title: "Test Task",
      status: TaskStatus.OPEN,
    });

    const { queryByText } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(queryByText("COMPLETED")).toBeNull();
    expect(queryByText("IN PROGRESS")).toBeNull();
    expect(queryByText("STARTED")).toBeNull();
  });

  it("renders correct icon for medication tasks", () => {
    const task = createMockTask({
      title: "Medication Diary",
      taskType: TaskType.SCHEDULED,
    });

    const { getByTestId } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByTestId("icon-pills")).toBeTruthy();
  });

  it("renders correct icon for survey tasks", () => {
    const task = createMockTask({
      title: "Health Survey",
      taskType: TaskType.SCHEDULED,
    });

    const { getByTestId } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByTestId("icon-questionmark.circle")).toBeTruthy();
  });

  it("renders calendar icon for SCHEDULED task type by default", () => {
    const task = createMockTask({
      title: "Random Task",
      taskType: TaskType.SCHEDULED,
    });

    const { getByTestId } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByTestId("icon-calendar")).toBeTruthy();
  });

  it("renders clock icon for TIMED task type by default", () => {
    const task = createMockTask({
      title: "Random Task",
      taskType: TaskType.TIMED,
    });

    const { getByTestId } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByTestId("icon-clock")).toBeTruthy();
  });

  it("renders repeat icon for EPISODIC task type by default", () => {
    const task = createMockTask({
      title: "Random Task",
      taskType: TaskType.EPISODIC,
    });

    const { getByTestId } = render(
      <TaskCard task={task} onPress={mockOnPress} />
    );

    expect(getByTestId("icon-repeat")).toBeTruthy();
  });
});



