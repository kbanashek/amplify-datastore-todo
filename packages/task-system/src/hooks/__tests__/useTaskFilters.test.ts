import { renderHook, act } from "@testing-library/react-native";
import { useTaskFilters } from "@hooks/useTaskFilters";
import { TaskStatus, TaskType } from "@task-types/Task";

describe("useTaskFilters", () => {
  it("initializes with empty filters", () => {
    const { result } = renderHook(() => useTaskFilters());
    expect(result.current.filters).toEqual({});
    expect(result.current.hasActiveFilters).toBe(false);
  });

  describe("status filter", () => {
    it("sets status filter", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setStatusFilter([TaskStatus.OPEN, TaskStatus.STARTED]);
      });
      expect(result.current.filters.status).toEqual([
        TaskStatus.OPEN,
        TaskStatus.STARTED,
      ]);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("clears status filter when set to empty array", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setStatusFilter([TaskStatus.OPEN]);
      });
      expect(result.current.hasActiveFilters).toBe(true);
      act(() => {
        result.current.setStatusFilter([]);
      });
      expect(result.current.filters.status).toBeUndefined();
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("task type filter", () => {
    it("sets task type filter", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setTaskTypeFilter([TaskType.SCHEDULED, TaskType.TIMED]);
      });
      expect(result.current.filters.taskType).toEqual([
        TaskType.SCHEDULED,
        TaskType.TIMED,
      ]);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("clears task type filter when set to empty array", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setTaskTypeFilter([TaskType.SCHEDULED]);
      });
      expect(result.current.hasActiveFilters).toBe(true);
      act(() => {
        result.current.setTaskTypeFilter([]);
      });
      expect(result.current.filters.taskType).toBeUndefined();
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("date range filter", () => {
    it("sets date range filter", () => {
      const { result } = renderHook(() => useTaskFilters());
      const from = new Date("2024-01-01");
      const to = new Date("2024-01-31");
      act(() => {
        result.current.setDateRange(from, to);
      });
      expect(result.current.filters.dateFrom).toEqual(from);
      expect(result.current.filters.dateTo).toEqual(to);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("sets only dateFrom", () => {
      const { result } = renderHook(() => useTaskFilters());
      const from = new Date("2024-01-01");
      act(() => {
        result.current.setDateRange(from, undefined);
      });
      expect(result.current.filters.dateFrom).toEqual(from);
      expect(result.current.filters.dateTo).toBeUndefined();
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("sets only dateTo", () => {
      const { result } = renderHook(() => useTaskFilters());
      const to = new Date("2024-01-31");
      act(() => {
        result.current.setDateRange(undefined, to);
      });
      expect(result.current.filters.dateFrom).toBeUndefined();
      expect(result.current.filters.dateTo).toEqual(to);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("clears date range when set to undefined", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setDateRange(
          new Date("2024-01-01"),
          new Date("2024-01-31")
        );
      });
      expect(result.current.hasActiveFilters).toBe(true);
      act(() => {
        result.current.setDateRange(undefined, undefined);
      });
      expect(result.current.filters.dateFrom).toBeUndefined();
      expect(result.current.filters.dateTo).toBeUndefined();
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("search text filter", () => {
    it("sets search text filter", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setSearchText("test query");
      });
      expect(result.current.filters.searchText).toBe("test query");
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("trims search text", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setSearchText("  test query  ");
      });
      expect(result.current.filters.searchText).toBe("test query");
    });

    it("ignores empty search text", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setSearchText("   ");
      });
      expect(result.current.filters.searchText).toBeUndefined();
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("clears search text when set to empty string", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setSearchText("test");
      });
      expect(result.current.hasActiveFilters).toBe(true);
      act(() => {
        result.current.setSearchText("");
      });
      expect(result.current.filters.searchText).toBeUndefined();
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("clearFilters", () => {
    it("clears all filters", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setStatusFilter([TaskStatus.OPEN]);
        result.current.setTaskTypeFilter([TaskType.SCHEDULED]);
        result.current.setDateRange(
          new Date("2024-01-01"),
          new Date("2024-01-31")
        );
        result.current.setSearchText("test");
      });
      expect(result.current.hasActiveFilters).toBe(true);
      act(() => {
        result.current.clearFilters();
      });
      expect(result.current.filters).toEqual({});
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("hasActiveFilters", () => {
    it("returns false when no filters are active", () => {
      const { result } = renderHook(() => useTaskFilters());
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("returns true when any filter is active", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setStatusFilter([TaskStatus.OPEN]);
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("returns false after clearing all filters", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setStatusFilter([TaskStatus.OPEN]);
        result.current.setTaskTypeFilter([TaskType.SCHEDULED]);
        result.current.setSearchText("test");
      });
      expect(result.current.hasActiveFilters).toBe(true);
      act(() => {
        result.current.clearFilters();
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("combined filters", () => {
    it("combines multiple filters correctly", () => {
      const { result } = renderHook(() => useTaskFilters());
      act(() => {
        result.current.setStatusFilter([TaskStatus.OPEN]);
        result.current.setTaskTypeFilter([TaskType.SCHEDULED]);
        result.current.setDateRange(
          new Date("2024-01-01"),
          new Date("2024-01-31")
        );
        result.current.setSearchText("test");
      });
      expect(result.current.filters).toEqual({
        status: [TaskStatus.OPEN],
        taskType: [TaskType.SCHEDULED],
        dateFrom: new Date("2024-01-01"),
        dateTo: new Date("2024-01-31"),
        searchText: "test",
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
});
