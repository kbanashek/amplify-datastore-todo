import { renderHook } from "@testing-library/react-native";
import { useTaskContainer } from "../useTaskContainer";
import { Alert } from "react-native";

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

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("useTaskContainer", () => {
  const { useTaskList } = jest.requireMock("../useTaskList") as {
    useTaskList: jest.Mock;
  };
  const { useGroupedTasks } = jest.requireMock("../useGroupedTasks") as {
    useGroupedTasks: jest.Mock;
  };
  const { useAppointmentList } = jest.requireMock("../useAppointmentList") as {
    useAppointmentList: jest.Mock;
  };
  const { groupAppointmentsByDate } = jest.requireMock(
    "../../utils/appointmentParser"
  ) as {
    groupAppointmentsByDate: jest.Mock;
  };
  const { useRouter } = jest.requireMock("expo-router") as {
    useRouter: jest.Mock;
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
