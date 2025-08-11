import { useState } from 'react';
import { TodoService } from '../services/TodoService';
import { Todo } from '../../models';
import { CreateTodoInput } from '../API';

interface UseTodoFormReturn {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: () => Promise<void>;
}

export const useTodoForm = (onTodoCreated?: (todo: Todo) => void): UseTodoFormReturn => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      setError('Todo name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Use the generated CreateTodoInput type
      const input: CreateTodoInput = {
        name: name.trim(),
        description: description.trim() || null // Handle empty string as null
      };
      
      // Pass the input object directly to createTodo
      const newTodo = await TodoService.createTodo(input);
      
      // Clear form
      setName('');
      setDescription('');
      
      // Notify parent component
      if (onTodoCreated) {
        onTodoCreated(newTodo);
      }
    } catch (err) {
      setError('Failed to create todo. Please try again.');
      console.error('Error creating todo:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    isSubmitting,
    error,
    handleSubmit
  };
};
