import { DataStore, OpType } from "@aws-amplify/datastore";
// Import the Todo model from the generated models
import { Todo } from "../../models";
// Import the generated types from API.ts
import { CreateTodoInput, UpdateTodoInput } from "../API";

// Use the generated UpdateTodoInput type instead of creating our own interface
type TodoUpdateData = Omit<UpdateTodoInput, "id" | "_version">;

export class TodoService {
  /**
   * Configure DataStore with custom conflict resolution strategy
   */
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        console.log(`Conflict detected for model ${modelConstructor.name}`);
        console.log(`Local model: `, localModel);
        console.log(`Remote model: `, remoteModel);
        console.log(`Operation: ${operation}, Attempts: ${attempts}`);

        // For Todo model conflicts
        if (modelConstructor.name === "Todo") {
          // For update operations
          if (operation === OpType.UPDATE) {
            // Custom merge strategy: take local name, but remote description if it exists
            const resolvedModel = {
              ...remoteModel, // Start with remote model as base
              name: localModel.name, // Always prefer local name changes
              // For description, prefer remote if it exists and is different from local
              description:
                remoteModel.description !== localModel.description &&
                remoteModel.description
                  ? remoteModel.description
                  : localModel.description,
            };

            return resolvedModel;
          }

          // For delete operations, always accept local delete
          if (operation === OpType.DELETE) {
            return localModel;
          }
        }

        // Default to remote model for other cases
        return remoteModel;
      },
    });

    console.log("DataStore configured with custom conflict resolution");
  }

  /**
   * Create a new Todo item
   * @param {CreateTodoInput} input - The input data for creating a todo
   * @returns {Promise<Todo>} - The created todo item
   */
  static async createTodo(input: CreateTodoInput): Promise<Todo> {
    try {
      const todo = await DataStore.save(
        new Todo({
          name: input.name,
          description: input.description ?? "",
        })
      );
      return todo;
    } catch (error) {
      console.error("Error creating todo:", error);
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
      console.error("Error fetching todos:", error);
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
        Todo.copyOf(original, (updated) => {
          // Handle name update with proper type checking
          if (data.name !== undefined && data.name !== null) {
            updated.name = data.name;
          }

          // Handle description update with proper type checking
          if (data.description !== undefined) {
            // description can be null in the API type, but our model requires a string
            // if null is provided, we'll use an empty string
            updated.description = data.description ?? "";
          }
        })
      );

      return updated;
    } catch (error) {
      console.error("Error updating todo:", error);
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
      console.error("Error deleting todo:", error);
      throw error;
    }
  }

  /**
   * Subscribe to changes in Todo items
   * @param {Function} callback - Function to call when changes occur
   * @returns {Function} - Unsubscribe function
   */
  static subscribeTodos(callback: (items: Todo[], isSynced: boolean) => void): {
    unsubscribe: () => void;
  } {
    return DataStore.observeQuery(Todo).subscribe((snapshot) => {
      const { items, isSynced } = snapshot;
      callback(items, isSynced);
    });
  }
}
