import { DataStore } from '@aws-amplify/datastore';
// Make sure we're importing the Todo model from the correct location
import { Todo } from '../../models';

interface TodoUpdateData {
  name?: string;
  description?: string;
}

export class TodoService {
  /**
   * Create a new Todo item
   * @param {string} name - The name of the todo item
   * @param {string} description - The description of the todo item
   * @returns {Promise<Todo>} - The created todo item
   */
  static async createTodo(name: string, description: string): Promise<Todo> {
    try {
      const todo = await DataStore.save(
        new Todo({
          name,
          description
        })
      );
      return todo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  /**
   * Get all Todo items
   * @returns {Promise<Todo[]>} - Array of todo items
   */
  static async getTodos(): Promise<Todo[]> {
    try {
      const todos = await DataStore.query(Todo);
      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  /**
   * Update a Todo item
   * @param {string} id - The id of the todo to update
   * @param {TodoUpdateData} data - The data to update
   * @returns {Promise<Todo>} - The updated todo
   */
  static async updateTodo(id: string, data: TodoUpdateData): Promise<Todo> {
    try {
      const original = await DataStore.query(Todo, id);
      if (!original) {
        throw new Error(`Todo with id ${id} not found`);
      }
      
      const updated = await DataStore.save(
        Todo.copyOf(original, updated => {
          if (data.name !== undefined) updated.name = data.name;
          if (data.description !== undefined) updated.description = data.description;
        })
      );
      
      return updated;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  /**
   * Delete a Todo item
   * @param {string} id - The id of the todo to delete
   * @returns {Promise<void>}
   */
  static async deleteTodo(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(Todo, id);
      if (!toDelete) {
        throw new Error(`Todo with id ${id} not found`);
      }
      
      await DataStore.delete(toDelete);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  /**
   * Subscribe to changes in Todo items
   * @param {Function} callback - Function to call when changes occur
   * @returns {Function} - Unsubscribe function
   */
  static subscribeTodos(callback: (items: Todo[], isSynced: boolean) => void): { unsubscribe: () => void } {
    return DataStore.observeQuery(Todo).subscribe(snapshot => {
      const { items, isSynced } = snapshot;
      callback(items, isSynced);
    });
  }
}
