import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useAppointmentList } from "../useAppointmentList";

// Mock AppointmentService
jest.mock("../../services/AppointmentService", () => ({
  AppointmentService: {
    getAppointmentData: jest.fn(),
    getAppointments: jest.fn(),
  },
}));

import { AppointmentService } from "../../services/AppointmentService";
import { Appointment, AppointmentData } from "../../types/Appointment";

describe("useAppointmentList", () => {
  const mockGetAppointmentData =
    AppointmentService.getAppointmentData as jest.MockedFunction<
      typeof AppointmentService.getAppointmentData
    >;
  const mockGetAppointments =
    AppointmentService.getAppointments as jest.MockedFunction<
      typeof AppointmentService.getAppointments
    >;

  const mockAppointmentData: AppointmentData = {
    appointments: [
      {
        id: "1",
        title: "Appointment 1",
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        status: "SCHEDULED",
        type: "IN_PERSON",
      },
    ],
  };

  const mockAppointments: Appointment[] = [
    {
      id: "1",
      title: "Appointment 1",
      startAt: new Date(),
      endAt: new Date(),
      status: "SCHEDULED",
      type: "IN_PERSON",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockGetAppointmentData.mockResolvedValue(mockAppointmentData);
      mockGetAppointments.mockResolvedValue(mockAppointments);
      const { result } = renderHook(() => useAppointmentList());
      expect(result.current.loading).toBe(true);
      expect(result.current.appointments).toEqual([]);
    });

    it("loads appointments on mount", async () => {
      mockGetAppointmentData.mockResolvedValue(mockAppointmentData);
      mockGetAppointments.mockResolvedValue(mockAppointments);
      const { result } = renderHook(() => useAppointmentList());

      await waitFor(() => {
        expect(result.current.appointments).toEqual(mockAppointments);
        expect(result.current.appointmentData).toEqual(mockAppointmentData);
        expect(result.current.loading).toBe(false);
      });
      expect(mockGetAppointmentData).toHaveBeenCalled();
      expect(mockGetAppointments).toHaveBeenCalledWith(false);
    });

    it("loads today-only appointments when todayOnly is true", async () => {
      mockGetAppointmentData.mockResolvedValue(mockAppointmentData);
      mockGetAppointments.mockResolvedValue(mockAppointments);
      const { result } = renderHook(() =>
        useAppointmentList({ todayOnly: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(mockGetAppointments).toHaveBeenCalledWith(true);
    });
  });

  describe("error handling", () => {
    it("handles getAppointmentData errors", async () => {
      mockGetAppointmentData.mockRejectedValue(new Error("Data fetch failed"));
      const { result } = renderHook(() => useAppointmentList());

      await waitFor(() => {
        expect(result.current.error).toBe(
          "Failed to load appointments. Please try again."
        );
        expect(result.current.appointments).toEqual([]);
        expect(result.current.appointmentData).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });

    it("handles null appointment data", async () => {
      mockGetAppointmentData.mockResolvedValue(null);
      const { result } = renderHook(() => useAppointmentList());

      await waitFor(() => {
        expect(result.current.appointments).toEqual([]);
        expect(result.current.appointmentData).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("refreshAppointments", () => {
    it("refreshes appointments", async () => {
      mockGetAppointmentData.mockResolvedValue(mockAppointmentData);
      mockGetAppointments.mockResolvedValue(mockAppointments);
      const { result } = renderHook(() => useAppointmentList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedAppointments: Appointment[] = [
        ...mockAppointments,
        {
          id: "2",
          title: "Appointment 2",
          startAt: new Date(),
          endAt: new Date(),
          status: "SCHEDULED",
          type: "IN_PERSON",
        },
      ];
      mockGetAppointments.mockResolvedValue(updatedAppointments);

      await act(async () => {
        await result.current.refreshAppointments();
      });

      await waitFor(() => {
        expect(result.current.appointments).toEqual(updatedAppointments);
      });
    });
  });
});
