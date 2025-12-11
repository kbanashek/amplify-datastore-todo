import { useState, useMemo } from "react";
import { TaskFilters, TaskStatus, TaskType } from "../types/Task";

interface UseTaskFiltersReturn {
  filters: TaskFilters;
  setStatusFilter: (statuses: TaskStatus[]) => void;
  setTaskTypeFilter: (types: TaskType[]) => void;
  setDateRange: (from: Date | undefined, to: Date | undefined) => void;
  setSearchText: (text: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

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



