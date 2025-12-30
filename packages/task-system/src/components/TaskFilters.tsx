/**
 * TaskFilters component module.
 *
 * @module TaskFilters
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  TaskStatus,
  TaskType,
  TaskFilters as TaskFiltersType,
} from "@task-types/Task";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

/**
 * Props for the TaskFilters component
 */
interface TaskFiltersProps {
  filters: TaskFiltersType;
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  onTaskTypeFilterChange: (types: TaskType[]) => void;
  onSearchTextChange: (text: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * TaskFilters component.
 *
 * @param props - Component props
 * @returns Rendered TaskFilters component
 */
export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onStatusFilterChange,
  onTaskTypeFilterChange,
  onSearchTextChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const toggleStatus = (status: TaskStatus) => {
    const current = filters.status || [];
    if (current.includes(status)) {
      onStatusFilterChange(current.filter(s => s !== status));
    } else {
      onStatusFilterChange([...current, status]);
    }
  };

  const toggleTaskType = (type: TaskType) => {
    const current = filters.taskType || [];
    if (current.includes(type)) {
      onTaskTypeFilterChange(current.filter(t => t !== type));
    } else {
      onTaskTypeFilterChange([...current, type]);
    }
  };

  return (
    <View style={styles.container} testID="task-filters">
      <View style={styles.header} testID="task-filters-header">
        <Text style={styles.title} testID="task-filters-title">
          Filters
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={onClearFilters}
            style={styles.clearButton}
            testID="task-filters-clear-button"
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks..."
        value={filters.searchText || ""}
        onChangeText={onSearchTextChange}
        autoCapitalize="none"
        autoCorrect={false}
        testID="task-filters-search-input"
        accessibilityLabel="Search tasks"
      />

      <Text style={styles.sectionTitle} testID="task-filters-status-title">
        Status
      </Text>
      <View style={styles.filterRow} testID="task-filters-status-row">
        {Object.values(TaskStatus).map(status => {
          const isSelected = filters.status?.includes(status);
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
              onPress={() => toggleStatus(status)}
              testID={`task-filters-status-${status}`}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${status} status`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextSelected,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle} testID="task-filters-type-title">
        Task Type
      </Text>
      <View style={styles.filterRow} testID="task-filters-type-row">
        {Object.values(TaskType).map(type => {
          const isSelected = filters.taskType?.includes(type);
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
              onPress={() => toggleTaskType(type)}
              testID={`task-filters-type-${type}`}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${type} type`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    ...AppFonts.subheading,
    color: AppColors.gray,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: AppColors.errorRed,
  },
  clearButtonText: {
    ...AppFonts.caption,
    color: AppColors.white,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    ...AppFonts.body,
  },
  sectionTitle: {
    ...AppFonts.label,
    color: AppColors.gray,
    marginBottom: 8,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    backgroundColor: "#f8f9fa",
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: AppColors.CIBlue,
    borderColor: AppColors.CIBlue,
  },
  filterChipText: {
    ...AppFonts.caption,
    color: AppColors.darkGray,
  },
  filterChipTextSelected: {
    color: AppColors.white,
  },
});
