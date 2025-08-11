import { useState, useEffect } from 'react';
import { TodoService } from '../services/TodoService';
import { Todo } from '../../models';
import { useAmplify } from '../contexts/AmplifyContext';

interface UseTodoListReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  isSynced: boolean;
  isOnline: boolean;
  handleDeleteTodo: (id: string) => Promise<void>;
  retryLoading: () => void;
}

export const useTodoList = (): UseTodoListReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const { isOnline } = useAmplify();
  const [subscription, setSubscription] = useState<{ unsubscribe: () => void } | null>(null);

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
      console.error('Error initializing todos:', err);
      setError('Failed to load todos. Please try again.');
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
    // We're intentionally only running this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const retryLoading = () => {
    setLoading(true);
    setError(null);
    // The effect will re-run and try to fetch todos again
    if (subscription) {
      subscription.unsubscribe();
    }
    initTodos();
  };

  return {
    todos,
    loading,
    error,
    isSynced,
    isOnline,
    handleDeleteTodo,
    retryLoading
  };
};
