import { renderHook, act } from "@testing-library/react-native";
import { useTaskFilters } from "../useTaskFilters";
import { TaskStatus, TaskType } from "../../types/Task";

describe("useTaskFilters", () => {
  it("should initialize with no filters", () => {
    const { result } = renderHook(() => useTaskFilters());

    expect(result.current.filters).toEqual({});
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("should set status filter", () => {
    const { result } = renderHook(() => useTaskFilters());

    act(() => {
      result.current.setStatusFilter([TaskStatus.OPEN, TaskStatus.COMPLETED]);
    });

    expect(result.current.filters.status).toEqual([
      TaskStatus.OPEN,
      TaskStatus.COMPLETED,
    ]);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("should set task type filter", () => {
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

  it("should set date range", () => {
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

  it("should set search text", () => {
    const { result } = renderHook(() => useTaskFilters());

    act(() => {
      result.current.setSearchText("test query");
    });

    expect(result.current.filters.searchText).toBe("test query");
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("should trim search text", () => {
    const { result } = renderHook(() => useTaskFilters());

    act(() => {
      result.current.setSearchText("  test query  ");
    });

    expect(result.current.filters.searchText).toBe("test query");
  });

  it("should not include empty search text in filters", () => {
    const { result } = renderHook(() => useTaskFilters());

    act(() => {
      result.current.setSearchText("   ");
    });

    expect(result.current.filters.searchText).toBeUndefined();
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("should clear all filters", () => {
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

    expect(result.current.filters).toEqual({});
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("should combine multiple filters", () => {
    const { result } = renderHook(() => useTaskFilters());
    const from = new Date("2024-01-01");
    const to = new Date("2024-01-31");

    act(() => {
      result.current.setStatusFilter([TaskStatus.OPEN]);
      result.current.setTaskTypeFilter([TaskType.SCHEDULED]);
      result.current.setDateRange(from, to);
      result.current.setSearchText("test");
    });

    expect(result.current.filters).toEqual({
      status: [TaskStatus.OPEN],
      taskType: [TaskType.SCHEDULED],
      dateFrom: from,
      dateTo: to,
      searchText: "test",
    });
    expect(result.current.hasActiveFilters).toBe(true);
  });
});

