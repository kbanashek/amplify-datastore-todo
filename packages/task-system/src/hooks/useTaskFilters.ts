import { useState, useMemo } from "react";
import { TaskFilters, TaskStatus, TaskType } from "@task-types/Task";

/**
 * Return type for the useTaskFilters hook.
 */
interface UseTaskFiltersReturn {
  /** Current filter object to pass to useTaskList */
  filters: TaskFilters;
  /** Set status filter (multiple statuses allowed) */
  setStatusFilter: (statuses: TaskStatus[]) => void;
  /** Set task type filter (multiple types allowed) */
  setTaskTypeFilter: (types: TaskType[]) => void;
  /** Set date range filter */
  setDateRange: (from: Date | undefined, to: Date | undefined) => void;
  /** Set search text for title/description matching */
  setSearchText: (text: string) => void;
  /** Reset all filters to defaults */
  clearFilters: () => void;
  /** Whether any filters are currently active */
  hasActiveFilters: boolean;
}

/**
 * React hook for managing task filter state.
 *
 * Provides filter setters and a computed filters object that can be
 * passed to useTaskList for filtering tasks.
 *
 * @returns Object containing filter state and setter functions
 *
 * @example
 * ```tsx
 * const {
 *   filters,
 *   setStatusFilter,
 *   clearFilters,
 *   hasActiveFilters,
 * } = useTaskFilters();
 *
 * // Apply filters to task list
 * const { tasks } = useTaskList(filters);
 *
 * // Filter by status
 * setStatusFilter([TaskStatus.OPEN, TaskStatus.INPROGRESS]);
 *
 * // Show clear button when filters are active
 * {hasActiveFilters && <Button onPress={clearFilters} title="Clear" />}
 * ```
 */
export const useTaskFilters = (): UseTaskFiltersReturn => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");

  const filters: TaskFilters = useMemo(() => {
    const f: TaskFilters = {};

    if (statusFilter.length > 0) {
      f.status = statusFilter;
    }

    if (taskTypeFilter.length > 0) {
      f.taskType = taskTypeFilter;
    }

    if (dateFrom) {
      f.dateFrom = dateFrom;
    }

    if (dateTo) {
      f.dateTo = dateTo;
    }

    if (searchText.trim()) {
      f.searchText = searchText.trim();
    }

    return f;
  }, [statusFilter, taskTypeFilter, dateFrom, dateTo, searchText]);

  const setDateRange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setTaskTypeFilter([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchText("");
  };

  const hasActiveFilters = useMemo(() => {
    return (
      statusFilter.length > 0 ||
      taskTypeFilter.length > 0 ||
      dateFrom !== undefined ||
      dateTo !== undefined ||
      searchText.trim().length > 0
    );
  }, [statusFilter, taskTypeFilter, dateFrom, dateTo, searchText]);

  return {
    filters,
    setStatusFilter,
    setTaskTypeFilter,
    setDateRange,
    setSearchText,
    clearFilters,
    hasActiveFilters,
  };
};
