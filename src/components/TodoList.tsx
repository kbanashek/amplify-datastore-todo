import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TodoService } from '../services/TodoService';
import { Todo } from '../../models';
import { useAmplify } from '../contexts/AmplifyContext';

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete }) => {
  return (
    <View style={styles.todoItem}>
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const { isOnline } = useAmplify();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initTodos = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to changes in todos
        subscription = TodoService.subscribeTodos((items, synced) => {
          setTodos(items);
          setIsSynced(synced);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error initializing todos:', err);
        setError('Failed to load todos. Please try again.');
        setLoading(false);
      }
    };

    initTodos();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleDeleteTodo = async (id: string): Promise<void> => {
    try {
      await TodoService.deleteTodo(id);
      // The subscription will automatically update the UI
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // The effect will re-run and try to fetch todos again
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Todos</Text>
        <View style={styles.syncStatus}>
          <View
            style={[
              styles.syncIndicator,
              { backgroundColor: isOnline ? (isSynced ? '#1dd1a1' : '#feca57') : '#ff6b6b' }
            ]}
          />
          <Text style={styles.syncText}>
            {!isOnline
              ? 'Offline'
              : isSynced
              ? 'Synced'
              : 'Syncing...'}
          </Text>
        </View>
      </View>

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No todos yet. Create one!</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem todo={item} onDelete={handleDeleteTodo} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  syncText: {
    fontSize: 12,
    color: '#747d8c',
  },
  listContent: {
    padding: 16,
  },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
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
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 4,
  },
  todoDescription: {
    fontSize: 14,
    color: '#57606f',
    marginBottom: 8,
  },
  todoDate: {
    fontSize: 12,
    color: '#a4b0be',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#57606f',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#57606f',
    textAlign: 'center',
  },
});
