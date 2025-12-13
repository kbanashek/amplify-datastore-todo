import { useState, useEffect } from "react";
import { TodoService } from "../services/TodoService";
import { Todo } from "../../models";
import { useAmplify } from "../contexts/AmplifyContext";
import { NetworkStatus } from "./useAmplifyState";

interface UseTodoListReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  isSynced: boolean;
  isOnline: boolean;
  handleDeleteTodo: (id: string) => Promise<void>;
  retryLoading: () => void;
  clearDataStore: () => Promise<void>;
}

export const useTodoList = (): UseTodoListReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const { networkStatus } = useAmplify();
  const isOnline = networkStatus === NetworkStatus.Online;
  const [subscription, setSubscription] = useState<{
    unsubscribe: () => void;
  } | null>(null);

  const initTodos = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Subscribe to changes in todos
      const sub = TodoService.subscribeTodos((items, synced) => {
        setTodos(items);
        setIsSynced(synced);
        setLoading(false);
      });

      setSubscription(sub);
    } catch (err) {
      console.error("Error initializing todos:", err);
      setError("Failed to load todos. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    initTodos();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteTodo = async (id: string): Promise<void> => {
    try {
      await TodoService.deleteTodo(id);
      // The subscription will automatically update the UI
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete todo. Please try again.");
    }
  };

  const retryLoading = () => {
    setLoading(true);
    setError(null);
    // The effect will re-run and try to fetch todos again
    if (subscription) {
      subscription.unsubscribe();
    }
    initTodos();
  };

  const clearDataStore = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Unsubscribe from current subscription
      if (subscription) {
        subscription.unsubscribe();
      }

      // Clear the DataStore
      await TodoService.clearDataStore();

      // Reinitialize todos after clearing
      initTodos();
    } catch (err) {
      console.error("Error clearing DataStore:", err);
      setError("Failed to clear DataStore. Please try again.");
      setLoading(false);
    }
  };

  return {
    todos,
    loading,
    error,
    isSynced,
    isOnline,
    handleDeleteTodo,
    retryLoading,
    clearDataStore,
  };
};
