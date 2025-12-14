import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Todo } from "../../models";
import { useTodoList } from "../hooks/useTodoList";

interface TodoItemProps {
  todo: Todo & { _synced?: boolean };
  onDelete: (id: string) => void;
  isOnline: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete, isOnline }) => {
  // Determine sync status icon color based on network status and sync state
  const getSyncStatusColor = () => {
    // If we're offline, we need to determine if this todo was created locally
    // and hasn't been synced yet
    if (!isOnline) {
      // If the todo has _synced explicitly set to false, it was created offline
      if ((todo as any)._synced === false) {
        return "#ff6b6b"; // RED for unsynced todos when offline
      }
    }

    // Otherwise show green for synced items
    return "#1dd1a1"; // GREEN for synced todos
  };

  return (
    <View style={styles.todoItem}>
      <View style={styles.syncIconContainer}>
        <View
          style={[styles.syncIcon, { backgroundColor: getSyncStatusColor() }]}
        />
      </View>
      <View style={styles.todoContent}>
        <Text style={styles.todoTitle}>{todo.name}</Text>
        {todo.description && (
          <Text style={styles.todoDescription}>{todo.description}</Text>
        )}
        <Text style={styles.todoDate}>
          Created: {new Date(todo.createdAt || Date.now()).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(todo.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

export const TodoList: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);

  const {
    todos,
    loading,
    error,
    isSynced,
    isOnline,
    handleDeleteTodo,
    retryLoading,
    clearDataStore,
  } = useTodoList();

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryLoading}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleClearDataStore = () => {
    Alert.alert(
      "Clear DataStore",
      "This will clear all local data and sync from the server. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearDataStore();
            } catch (error) {
              console.error("Error clearing DataStore:", error);
              Alert.alert("Error", "Failed to clear DataStore");
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Todos</Text>
        <View style={styles.syncStatus}>
          <View
            style={[
              styles.syncIndicator,
              {
                backgroundColor: isOnline
                  ? isSynced
                    ? "#1dd1a1"
                    : "#feca57"
                  : "#ff6b6b",
              },
            ]}
          />
          <Text style={styles.syncText}>
            {!isOnline ? "Offline" : isSynced ? "Synced" : "Syncing..."}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClearDataStore}
        disabled={isClearing || loading}
      >
        <Text style={styles.clearButtonText}>
          {isClearing ? "Clearing..." : "Clear DataStore"}
        </Text>
      </TouchableOpacity>

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No todos yet. Create one!</Text>
        </View>
      ) : (
        // Using FlatList directly without wrapping it in a ScrollView
        <View style={{ flex: 1 }}>
          <FlatList
            data={todos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                onDelete={handleDeleteTodo}
                isOnline={isOnline}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  syncIconContainer: {
    justifyContent: "center",
    marginRight: 10,
  },
  syncIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
  },
  syncStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  syncText: {
    fontSize: 12,
    color: "#747d8c",
  },
  listContent: {
    padding: 16,
  },
  todoItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 4,
  },
  todoDescription: {
    fontSize: 14,
    color: "#57606f",
    marginBottom: 8,
  },
  todoDate: {
    fontSize: 12,
    color: "#a4b0be",
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#57606f",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#57606f",
    textAlign: "center",
  },
});
