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

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  onTaskTypeFilterChange: (types: TaskType[]) => void;
  onSearchTextChange: (text: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

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
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3542",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#e74c3c",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2f3542",
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
    borderColor: "#dfe4ea",
    backgroundColor: "#f8f9fa",
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  filterChipText: {
    fontSize: 12,
    color: "#57606f",
    fontWeight: "600",
  },
  filterChipTextSelected: {
    color: "#fff",
  },
});
