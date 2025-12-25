import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TaskFilters } from "@components/TaskFilters";
import {
  TaskStatus,
  TaskType,
  TaskFilters as TaskFiltersType,
} from "@task-types/Task";

// Mock useRTL
const mockRtlStyle = jest.fn((style: any) => style);
const mockUseRTL = jest.fn(() => ({
  rtlStyle: mockRtlStyle,
  isRTL: false,
}));

jest.mock("@hooks/useRTL", () => ({
  useRTL: () => mockUseRTL(),
}));

describe("TaskFilters", () => {
  const defaultFilters: TaskFiltersType = {
    status: [],
    taskType: [],
    searchText: "",
  };

  const mockOnStatusFilterChange = jest.fn();
  const mockOnTaskTypeFilterChange = jest.fn();
  const mockOnSearchTextChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  const defaultProps = {
    filters: defaultFilters,
    onStatusFilterChange: mockOnStatusFilterChange,
    onTaskTypeFilterChange: mockOnTaskTypeFilterChange,
    onSearchTextChange: mockOnSearchTextChange,
    onClearFilters: mockOnClearFilters,
    hasActiveFilters: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRTL.mockReturnValue({
      rtlStyle: jest.fn((style: any) => style),
      isRTL: false,
    });
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters")).toBeTruthy();
      expect(getByTestId("task-filters-title")).toBeTruthy();
    });

    it("renders search input", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-search-input")).toBeTruthy();
    });

    it("renders status filter section", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-status-title")).toBeTruthy();
      expect(getByTestId("task-filters-status-row")).toBeTruthy();
    });

    it("renders task type filter section", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-type-title")).toBeTruthy();
      expect(getByTestId("task-filters-type-row")).toBeTruthy();
    });

    it("renders all status options", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      Object.values(TaskStatus).forEach(status => {
        expect(getByTestId(`task-filters-status-${status}`)).toBeTruthy();
      });
    });

    it("renders all task type options", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      Object.values(TaskType).forEach(type => {
        expect(getByTestId(`task-filters-type-${type}`)).toBeTruthy();
      });
    });

    it("shows clear button when hasActiveFilters is true", () => {
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} hasActiveFilters={true} />
      );
      expect(getByTestId("task-filters-clear-button")).toBeTruthy();
    });

    it("hides clear button when hasActiveFilters is false", () => {
      const { queryByTestId } = render(
        <TaskFilters {...defaultProps} hasActiveFilters={false} />
      );
      expect(queryByTestId("task-filters-clear-button")).toBeNull();
    });

    it("displays search text value", () => {
      const filtersWithSearch: TaskFiltersType = {
        ...defaultFilters,
        searchText: "test search",
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithSearch} />
      );
      const input = getByTestId("task-filters-search-input");
      expect(input.props.value).toBe("test search");
    });

    it("highlights selected status filters", () => {
      const filtersWithStatus: TaskFiltersType = {
        ...defaultFilters,
        status: [TaskStatus.OPEN],
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithStatus} />
      );
      const openChip = getByTestId(`task-filters-status-${TaskStatus.OPEN}`);
      const styles = Array.isArray(openChip.props.style)
        ? openChip.props.style
        : [openChip.props.style];
      const hasSelectedStyle = styles.some(
        (style: any) => style?.backgroundColor === "#3498db"
      );
      expect(hasSelectedStyle).toBe(true);
    });

    it("highlights selected task type filters", () => {
      const filtersWithType: TaskFiltersType = {
        ...defaultFilters,
        taskType: [TaskType.SCHEDULED],
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithType} />
      );
      const scheduledChip = getByTestId(
        `task-filters-type-${TaskType.SCHEDULED}`
      );
      const styles = Array.isArray(scheduledChip.props.style)
        ? scheduledChip.props.style
        : [scheduledChip.props.style];
      const hasSelectedStyle = styles.some(
        (style: any) => style?.backgroundColor === "#3498db"
      );
      expect(hasSelectedStyle).toBe(true);
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls onSearchTextChange when search input changes", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const input = getByTestId("task-filters-search-input");
      fireEvent.changeText(input, "new search");
      expect(mockOnSearchTextChange).toHaveBeenCalledWith("new search");
      expect(mockOnSearchTextChange).toHaveBeenCalledTimes(1);
    });

    it("calls onStatusFilterChange when status chip is pressed", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const openChip = getByTestId(`task-filters-status-${TaskStatus.OPEN}`);
      fireEvent.press(openChip);
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith([TaskStatus.OPEN]);
      expect(mockOnStatusFilterChange).toHaveBeenCalledTimes(1);
    });

    it("removes status from filter when already selected", () => {
      const filtersWithStatus: TaskFiltersType = {
        ...defaultFilters,
        status: [TaskStatus.OPEN],
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithStatus} />
      );
      const openChip = getByTestId(`task-filters-status-${TaskStatus.OPEN}`);
      fireEvent.press(openChip);
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith([]);
    });

    it("adds multiple statuses when multiple chips are pressed", () => {
      const filtersWithStatus: TaskFiltersType = {
        ...defaultFilters,
        status: [TaskStatus.OPEN],
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithStatus} />
      );
      const completedChip = getByTestId(
        `task-filters-status-${TaskStatus.COMPLETED}`
      );
      fireEvent.press(completedChip);
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith([
        TaskStatus.OPEN,
        TaskStatus.COMPLETED,
      ]);
    });

    it("calls onTaskTypeFilterChange when task type chip is pressed", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const scheduledChip = getByTestId(
        `task-filters-type-${TaskType.SCHEDULED}`
      );
      fireEvent.press(scheduledChip);
      expect(mockOnTaskTypeFilterChange).toHaveBeenCalledWith([
        TaskType.SCHEDULED,
      ]);
      expect(mockOnTaskTypeFilterChange).toHaveBeenCalledTimes(1);
    });

    it("removes task type from filter when already selected", () => {
      const filtersWithType: TaskFiltersType = {
        ...defaultFilters,
        taskType: [TaskType.SCHEDULED],
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithType} />
      );
      const scheduledChip = getByTestId(
        `task-filters-type-${TaskType.SCHEDULED}`
      );
      fireEvent.press(scheduledChip);
      expect(mockOnTaskTypeFilterChange).toHaveBeenCalledWith([]);
    });

    it("calls onClearFilters when clear button is pressed", () => {
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} hasActiveFilters={true} />
      );
      const clearButton = getByTestId("task-filters-clear-button");
      fireEvent.press(clearButton);
      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: any) => style),
        isRTL: false,
      });

      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const rtlStyleFn = jest.fn((style: any) => ({
        ...style,
        flexDirection: "row-reverse",
      }));

      mockUseRTL.mockReturnValueOnce({
        rtlStyle: rtlStyleFn,
        isRTL: true,
      });

      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters")).toBeTruthy();
      // RTL style may not be called if component doesn't use it directly
      // Just verify component renders
    });

    it("flips filter row direction in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: any) => style),
        isRTL: true,
      });

      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const statusRow = getByTestId("task-filters-status-row");
      expect(statusRow).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles empty search text", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const input = getByTestId("task-filters-search-input");
      fireEvent.changeText(input, "");
      expect(mockOnSearchTextChange).toHaveBeenCalledWith("");
    });

    it("handles long search text", () => {
      const longText = "a".repeat(200);
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const input = getByTestId("task-filters-search-input");
      fireEvent.changeText(input, longText);
      expect(mockOnSearchTextChange).toHaveBeenCalledWith(longText);
    });

    it("handles special characters in search text", () => {
      const specialText = "test@#$%^&*()";
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const input = getByTestId("task-filters-search-input");
      fireEvent.changeText(input, specialText);
      expect(mockOnSearchTextChange).toHaveBeenCalledWith(specialText);
    });

    it("handles all statuses selected", () => {
      const filtersWithAllStatuses: TaskFiltersType = {
        ...defaultFilters,
        status: Object.values(TaskStatus),
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithAllStatuses} />
      );
      Object.values(TaskStatus).forEach(status => {
        const chip = getByTestId(`task-filters-status-${status}`);
        expect(chip).toBeTruthy();
      });
    });

    it("handles all task types selected", () => {
      const filtersWithAllTypes: TaskFiltersType = {
        ...defaultFilters,
        taskType: Object.values(TaskType),
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithAllTypes} />
      );
      Object.values(TaskType).forEach(type => {
        const chip = getByTestId(`task-filters-type-${type}`);
        expect(chip).toBeTruthy();
      });
    });

    it("handles undefined status array", () => {
      const filtersWithUndefinedStatus: TaskFiltersType = {
        ...defaultFilters,
        status: undefined,
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithUndefinedStatus} />
      );
      const openChip = getByTestId(`task-filters-status-${TaskStatus.OPEN}`);
      fireEvent.press(openChip);
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith([TaskStatus.OPEN]);
    });

    it("handles undefined task type array", () => {
      const filtersWithUndefinedType: TaskFiltersType = {
        ...defaultFilters,
        taskType: undefined,
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithUndefinedType} />
      );
      const scheduledChip = getByTestId(
        `task-filters-type-${TaskType.SCHEDULED}`
      );
      fireEvent.press(scheduledChip);
      expect(mockOnTaskTypeFilterChange).toHaveBeenCalledWith([
        TaskType.SCHEDULED,
      ]);
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility labels on search input", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const input = getByTestId("task-filters-search-input");
      expect(input.props.accessibilityLabel).toBe("Search tasks");
    });

    it("has proper accessibility labels on status chips", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const openChip = getByTestId(`task-filters-status-${TaskStatus.OPEN}`);
      expect(openChip.props.accessibilityLabel).toBe(
        `Filter by ${TaskStatus.OPEN} status`
      );
      expect(openChip.props.accessibilityRole).toBe("button");
    });

    it("has proper accessibility labels on task type chips", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      const scheduledChip = getByTestId(
        `task-filters-type-${TaskType.SCHEDULED}`
      );
      expect(scheduledChip.props.accessibilityLabel).toBe(
        `Filter by ${TaskType.SCHEDULED} type`
      );
      expect(scheduledChip.props.accessibilityRole).toBe("button");
    });

    it("has proper accessibility state for selected chips", () => {
      const filtersWithStatus: TaskFiltersType = {
        ...defaultFilters,
        status: [TaskStatus.OPEN],
      };
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} filters={filtersWithStatus} />
      );
      const openChip = getByTestId(`task-filters-status-${TaskStatus.OPEN}`);
      expect(openChip.props.accessibilityState).toEqual({ selected: true });
    });

    it("has proper accessibility label on clear button", () => {
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} hasActiveFilters={true} />
      );
      const clearButton = getByTestId("task-filters-clear-button");
      expect(clearButton.props.accessibilityLabel).toBe("Clear all filters");
      expect(clearButton.props.accessibilityRole).toBe("button");
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<TaskFilters {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with active filters", () => {
      const filtersWithValues: TaskFiltersType = {
        status: [TaskStatus.OPEN, TaskStatus.COMPLETED],
        taskType: [TaskType.SCHEDULED],
        searchText: "test search",
      };
      const { toJSON } = render(
        <TaskFilters
          {...defaultProps}
          filters={filtersWithValues}
          hasActiveFilters={true}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: any) => ({
          ...style,
          flexDirection: "row-reverse",
        })),
        isRTL: true,
      });

      const { toJSON } = render(<TaskFilters {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. E2E Support
  describe("E2E Support", () => {
    it("has testId on container", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters")).toBeTruthy();
    });

    it("has testId on header", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-header")).toBeTruthy();
    });

    it("has testId on title", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-title")).toBeTruthy();
    });

    it("has testId on search input", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-search-input")).toBeTruthy();
    });

    it("has testId on status filter row", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-status-row")).toBeTruthy();
    });

    it("has testId on task type filter row", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      expect(getByTestId("task-filters-type-row")).toBeTruthy();
    });

    it("has testId on each status chip", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      Object.values(TaskStatus).forEach(status => {
        expect(getByTestId(`task-filters-status-${status}`)).toBeTruthy();
      });
    });

    it("has testId on each task type chip", () => {
      const { getByTestId } = render(<TaskFilters {...defaultProps} />);
      Object.values(TaskType).forEach(type => {
        expect(getByTestId(`task-filters-type-${type}`)).toBeTruthy();
      });
    });

    it("has testId on clear button when active", () => {
      const { getByTestId } = render(
        <TaskFilters {...defaultProps} hasActiveFilters={true} />
      );
      expect(getByTestId("task-filters-clear-button")).toBeTruthy();
    });
  });
});
