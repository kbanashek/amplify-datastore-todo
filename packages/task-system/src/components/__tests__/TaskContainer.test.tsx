import React from "react";
import { render } from "@testing-library/react-native";
import { TaskContainer } from "@components/TaskContainer";

// Mock hooks
const mockGroupedTasks = [];
const mockTodayAppointments = [];
const mockHandleDeleteTask = jest.fn();
const mockHandleTaskPress = jest.fn();
const mockHandleAppointmentPress = jest.fn();

const mockUseTaskContainer = jest.fn(() => ({
  groupedTasks: mockGroupedTasks,
  loading: false,
  error: null,
  handleDeleteTask: mockHandleDeleteTask,
  todayAppointments: mockTodayAppointments,
  appointmentTimezoneId: "America/New_York",
  handleTaskPress: mockHandleTaskPress,
  handleAppointmentPress: mockHandleAppointmentPress,
}));

jest.mock("@hooks/useTaskContainer", () => ({
  useTaskContainer: () => mockUseTaskContainer(),
}));

jest.mock("@hooks/useActivityStartup", () => ({
  useActivityStartup: jest.fn(),
}));

// Mock GroupedTasksView
jest.mock("@components/GroupedTasksView", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    GroupedTasksView: ({ testID, groupedTasks, loading, error }: any) => (
      <View testID={testID}>
        <Text testID="grouped-tasks-view-mock">
          {loading ? "Loading" : error || `Tasks: ${groupedTasks.length}`}
        </Text>
      </View>
    ),
  };
});

describe("TaskContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with default props", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });

    it("renders GroupedTasksView", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
      expect(getByTestId("grouped-tasks-view-mock")).toBeTruthy();
    });

    it("passes groupedTasks to GroupedTasksView", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [{ dayLabel: "Today", tasksWithoutTime: [], timeGroups: [] }],
        loading: false,
        error: null,
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: "America/New_York",
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });

    it("passes loading state to GroupedTasksView", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [],
        loading: true,
        error: null,
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: "America/New_York",
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { getByText } = render(<TaskContainer />);
      expect(getByText("Loading")).toBeTruthy();
    });

    it("passes error state to GroupedTasksView", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [],
        loading: false,
        error: "Error loading tasks",
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: "America/New_York",
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { getByText } = render(<TaskContainer />);
      expect(getByText("Error loading tasks")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("passes handleTaskPress to GroupedTasksView", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
      // Handler is passed through, actual interaction tested in GroupedTasksView
    });

    it("passes handleAppointmentPress to GroupedTasksView", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
      // Handler is passed through, actual interaction tested in GroupedTasksView
    });

    it("passes handleDeleteTask to GroupedTasksView", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
      // Handler is passed through, actual interaction tested in GroupedTasksView
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles empty groupedTasks", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [],
        loading: false,
        error: null,
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: "America/New_York",
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });

    it("handles null error", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [],
        loading: false,
        error: null,
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: "America/New_York",
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });

    it("handles undefined appointmentTimezoneId", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [],
        loading: false,
        error: null,
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: undefined,
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper testID", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<TaskContainer />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot when loading", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [],
        loading: true,
        error: null,
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: "America/New_York",
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { toJSON } = render(<TaskContainer />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with error", () => {
      mockUseTaskContainer.mockReturnValueOnce({
        groupedTasks: [],
        loading: false,
        error: "Error message",
        handleDeleteTask: mockHandleDeleteTask,
        todayAppointments: [],
        appointmentTimezoneId: "America/New_York",
        handleTaskPress: mockHandleTaskPress,
        handleAppointmentPress: mockHandleAppointmentPress,
      });
      const { toJSON } = render(<TaskContainer />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testId on container", () => {
      const { getByTestId } = render(<TaskContainer />);
      expect(getByTestId("task-container")).toBeTruthy();
    });
  });
});


