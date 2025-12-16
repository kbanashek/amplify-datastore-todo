import { renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock hooks - import from package paths
jest.mock("../../../packages/task-system/src/src/hooks/useTaskList", () => ({
  useTaskList: jest.fn(),
}));

jest.mock(
  "../../../packages/task-system/src/src/hooks/useGroupedTasks",
  () => ({
    useGroupedTasks: jest.fn(),
  })
);

jest.mock(
  "../../../packages/task-system/src/src/hooks/useAppointmentList",
  () => ({
    useAppointmentList: jest.fn(),
  })
);

jest.mock("../../utils/appointmentParser", () => ({
  groupAppointmentsByDate: jest.fn(),
}));

// Import the hook directly from source (like the package test does)
import { useTaskContainer } from "../../../packages/task-system/src/src/hooks/useTaskContainer";
import { useRouter } from "expo-router";
import { useTaskList } from "../../../packages/task-system/src/src/hooks/useTaskList";
import { useGroupedTasks } from "../../../packages/task-system/src/src/hooks/useGroupedTasks";
import { useAppointmentList } from "../../../packages/task-system/src/src/hooks/useAppointmentList";

describe("useTaskContainer", () => {
  // Get mocks - they're already imported above
  const { groupAppointmentsByDate } =
    require("../../utils/appointmentParser") as {
      groupAppointmentsByDate: jest.Mock;
    };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  it("composes useTaskList and useGroupedTasks and returns expected shape", () => {
    const handleDeleteTask = jest.fn().mockResolvedValue(undefined);
    const push = jest.fn();

    useRouter.mockReturnValue({ push });
    useTaskList.mockReturnValue({
      tasks: [{ id: "t1" }],
      loading: false,
      error: null,
      handleDeleteTask,
    });

    useGroupedTasks.mockReturnValue([{ dayLabel: "Today" }]);

    useAppointmentList.mockReturnValue({
      appointments: [],
      appointmentData: { siteTimezoneId: "America/New_York" },
      refreshAppointments: jest.fn().mockResolvedValue(undefined),
    });
    groupAppointmentsByDate.mockReturnValue([]);

    const { result } = renderHook(() => useTaskContainer());

    expect(result.current.groupedTasks).toEqual([{ dayLabel: "Today" }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.handleDeleteTask).toBe(handleDeleteTask);
    expect(result.current.todayAppointments).toEqual([]);
    expect(result.current.appointmentTimezoneId).toBe("America/New_York");
    expect(typeof result.current.handleTaskPress).toBe("function");
    expect(typeof result.current.handleAppointmentPress).toBe("function");
  });

  it("navigates to questions when task has entityId", () => {
    const push = jest.fn();
    useRouter.mockReturnValue({ push });
    useTaskList.mockReturnValue({
      tasks: [],
      loading: true,
      error: null,
      handleDeleteTask: jest.fn().mockResolvedValue(undefined),
    });
    useGroupedTasks.mockReturnValue([]);
    useAppointmentList.mockReturnValue({
      appointments: [],
      appointmentData: { siteTimezoneId: "UTC" },
      refreshAppointments: jest.fn().mockResolvedValue(undefined),
    });
    groupAppointmentsByDate.mockReturnValue([]);

    const { result } = renderHook(() => useTaskContainer());

    result.current.handleTaskPress({ id: "t1", entityId: "e1" } as any);
    expect(push).toHaveBeenCalledWith({
      pathname: "/(tabs)/questions",
      params: { taskId: "t1", entityId: "e1" },
    });
  });

  it("shows alert when task missing entityId", () => {
    const push = jest.fn();
    useRouter.mockReturnValue({ push });
    useTaskList.mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      handleDeleteTask: jest.fn().mockResolvedValue(undefined),
    });
    useGroupedTasks.mockReturnValue([]);
    useAppointmentList.mockReturnValue({
      appointments: [],
      appointmentData: { siteTimezoneId: "UTC" },
      refreshAppointments: jest.fn().mockResolvedValue(undefined),
    });
    groupAppointmentsByDate.mockReturnValue([]);

    const { result } = renderHook(() => useTaskContainer());
    result.current.handleTaskPress({ id: "t1", entityId: null } as any);

    expect(Alert.alert).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
