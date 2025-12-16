import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useTaskContainer } from "../useTaskContainer";
import { Task, TaskStatus, TaskType } from "../../types/Task";
import { Alert } from "react-native";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock hooks
jest.mock("../useTaskList", () => ({
  useTaskList: jest.fn(),
}));

jest.mock("../useGroupedTasks", () => ({
  useGroupedTasks: jest.fn(),
}));

jest.mock("../useAppointmentList", () => ({
  useAppointmentList: jest.fn(),
}));

jest.mock("../../utils/appointmentParser", () => ({
  groupAppointmentsByDate: jest.fn(),
}));

import { useRouter } from "expo-router";
import { useTaskList } from "../useTaskList";
import { useGroupedTasks } from "../useGroupedTasks";
import { useAppointmentList } from "../useAppointmentList";
import { groupAppointmentsByDate } from "../../utils/appointmentParser";

describe("useTaskContainer", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseTaskList = useTaskList as jest.MockedFunction<
    typeof useTaskList
  >;
  const mockUseGroupedTasks = useGroupedTasks as jest.MockedFunction<
    typeof useGroupedTasks
  >;
  const mockUseAppointmentList = useAppointmentList as jest.MockedFunction<
    typeof useAppointmentList
  >;
  const mockGroupAppointmentsByDate =
    groupAppointmentsByDate as jest.MockedFunction<
      typeof groupAppointmentsByDate
    >;

  const mockTasks: Task[] = [
    {
      id: "1",
      pk: "TASK-1",
      sk: "SK-1",
      title: "Task 1",
      description: "Description 1",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      expireTimeInMillSec: Date.now() + 86400000,
      entityId: "ACTIVITY-1",
    },
  ];

  const mockGroupedTasks = [
    {
      dayLabel: "Today",
      dayDate: "Mon, Jan 1",
      tasksWithoutTime: [],
      timeGroups: [{ time: "9:00 AM", tasks: mockTasks }],
    },
  ];

  const mockAppointments = [
    {
      id: "1",
      appointmentId: "APT-1",
      title: "Appointment 1",
      startAt: new Date(),
      endAt: new Date(),
      status: "SCHEDULED",
      type: "IN_PERSON",
    },
  ];

  const mockAppointmentData = {
    siteTimezoneId: "America/New_York",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      replace: jest.fn(),
    } as any);
    mockUseTaskList.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      isSynced: true,
      isOnline: true,
      handleDeleteTask: jest.fn(),
      retryLoading: jest.fn(),
      clearDataStore: jest.fn(),
      refreshTasks: jest.fn(),
    });
    mockUseGroupedTasks.mockReturnValue(mockGroupedTasks as any);
    mockUseAppointmentList.mockReturnValue({
      appointments: mockAppointments,
      appointmentData: mockAppointmentData,
      loading: false,
      error: null,
      refreshAppointments: jest.fn().mockResolvedValue(undefined),
    });
    mockGroupAppointmentsByDate.mockReturnValue([
      {
        dateLabel: "Today",
        appointments: mockAppointments,
      },
    ]);
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  describe("initialization", () => {
    it("returns grouped tasks from useGroupedTasks", () => {
      const { result } = renderHook(() => useTaskContainer());
      expect(result.current.groupedTasks).toEqual(mockGroupedTasks);
    });

    it("returns loading state from useTaskList", () => {
      mockUseTaskList.mockReturnValue({
        tasks: [],
        loading: true,
        error: null,
        isSynced: false,
        isOnline: true,
        handleDeleteTask: jest.fn(),
        retryLoading: jest.fn(),
        clearDataStore: jest.fn(),
        refreshTasks: jest.fn(),
      });
      const { result } = renderHook(() => useTaskContainer());
      expect(result.current.loading).toBe(true);
    });

    it("returns error state from useTaskList", () => {
      mockUseTaskList.mockReturnValue({
        tasks: [],
        loading: false,
        error: "Error message",
        isSynced: false,
        isOnline: true,
        handleDeleteTask: jest.fn(),
        retryLoading: jest.fn(),
        clearDataStore: jest.fn(),
        refreshTasks: jest.fn(),
      });
      const { result } = renderHook(() => useTaskContainer());
      expect(result.current.error).toBe("Error message");
    });

    it("calls refreshAppointments on mount", async () => {
      const refreshAppointments = jest.fn().mockResolvedValue(undefined);
      mockUseAppointmentList.mockReturnValue({
        appointments: [],
        appointmentData: null,
        loading: false,
        error: null,
        refreshAppointments,
      });
      renderHook(() => useTaskContainer());
      await waitFor(() => {
        expect(refreshAppointments).toHaveBeenCalled();
      });
    });
  });

  describe("todayAppointments", () => {
    it("returns appointments from Today group", () => {
      const { result } = renderHook(() => useTaskContainer());
      expect(result.current.todayAppointments).toEqual(mockAppointments);
    });

    it("returns all appointments if Today group not found", () => {
      mockGroupAppointmentsByDate.mockReturnValue([
        {
          dateLabel: "Tomorrow",
          appointments: [],
        },
      ]);
      const { result } = renderHook(() => useTaskContainer());
      expect(result.current.todayAppointments).toEqual(mockAppointments);
    });
  });

  describe("appointmentTimezoneId", () => {
    it("returns timezone ID from appointment data", () => {
      const { result } = renderHook(() => useTaskContainer());
      expect(result.current.appointmentTimezoneId).toBe("America/New_York");
    });

    it("returns undefined when appointment data is null", () => {
      mockUseAppointmentList.mockReturnValue({
        appointments: [],
        appointmentData: null,
        loading: false,
        error: null,
        refreshAppointments: jest.fn().mockResolvedValue(undefined),
      });
      const { result } = renderHook(() => useTaskContainer());
      expect(result.current.appointmentTimezoneId).toBeUndefined();
    });
  });

  describe("handleTaskPress", () => {
    it("navigates to questions screen when task has entityId", () => {
      const { result } = renderHook(() => useTaskContainer());
      const task: Task = {
        id: "1",
        pk: "TASK-1",
        sk: "SK-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: Date.now() + 86400000,
        entityId: "ACTIVITY-1",
      };

      act(() => {
        result.current.handleTaskPress(task);
      });

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(tabs)/questions",
        params: { taskId: task.id, entityId: task.entityId },
      });
    });

    it("shows alert when task has no entityId", () => {
      const { result } = renderHook(() => useTaskContainer());
      const task: Task = {
        id: "1",
        pk: "TASK-1",
        sk: "SK-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: Date.now() + 86400000,
        entityId: null,
      };

      act(() => {
        result.current.handleTaskPress(task);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "No Questions Available",
        expect.stringContaining(
          "This task does not have an associated activity"
        ),
        [{ text: "OK", style: "default" }]
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("handleAppointmentPress", () => {
    it("navigates to appointment details", () => {
      const { result } = renderHook(() => useTaskContainer());
      const appointment = mockAppointments[0];

      act(() => {
        result.current.handleAppointmentPress(appointment);
      });

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(tabs)/appointment-details",
        params: {
          appointment: JSON.stringify(appointment),
          timezoneId: "America/New_York",
        },
      });
    });

    it("handles navigation errors gracefully", () => {
      mockPush.mockImplementation(() => {
        throw new Error("Navigation failed");
      });
      const { result } = renderHook(() => useTaskContainer());
      const appointment = mockAppointments[0];

      act(() => {
        result.current.handleAppointmentPress(appointment);
      });

      // Should not throw
      expect(result.current).toBeDefined();
    });

    it("uses empty string for timezoneId when not available", () => {
      mockUseAppointmentList.mockReturnValue({
        appointments: mockAppointments,
        appointmentData: null,
        loading: false,
        error: null,
        refreshAppointments: jest.fn().mockResolvedValue(undefined),
      });
      const { result } = renderHook(() => useTaskContainer());
      const appointment = mockAppointments[0];

      act(() => {
        result.current.handleAppointmentPress(appointment);
      });

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(tabs)/appointment-details",
        params: {
          appointment: JSON.stringify(appointment),
          timezoneId: "",
        },
      });
    });
  });

  describe("handleDeleteTask", () => {
    it("delegates to useTaskList handleDeleteTask", async () => {
      const handleDeleteTask = jest.fn().mockResolvedValue(undefined);
      mockUseTaskList.mockReturnValue({
        tasks: mockTasks,
        loading: false,
        error: null,
        isSynced: true,
        isOnline: true,
        handleDeleteTask,
        retryLoading: jest.fn(),
        clearDataStore: jest.fn(),
        refreshTasks: jest.fn(),
      });
      const { result } = renderHook(() => useTaskContainer());

      await act(async () => {
        await result.current.handleDeleteTask("1");
      });

      expect(handleDeleteTask).toHaveBeenCalledWith("1");
    });
  });
});
