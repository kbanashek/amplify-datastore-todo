import { DataStore, OpType } from "@aws-amplify/datastore";
// @ts-ignore - Model will be generated after schema update
import { Question } from "../../models";
import { CreateQuestionInput, UpdateQuestionInput } from "../types/Question";

type QuestionUpdateData = Omit<UpdateQuestionInput, "id" | "_version">;

export class QuestionService {
  /**
   * Configure DataStore with custom conflict resolution strategy for Question model
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
        // For Question model conflicts
        if (modelConstructor.name === "Question") {
          // For delete operations, handle carefully
          if (operation === OpType.DELETE) {
            if (remoteModel._deleted) {
              return remoteModel;
            }
            if (!localModel.question && !localModel.questionId) {
              return { ...remoteModel, _deleted: true };
            }
            return localModel;
          }
        }
        // Default to remote model for other cases
        return remoteModel;
      },
    });
  }

  /**
   * Create a new Question
   */
  static async createQuestion(input: CreateQuestionInput): Promise<Question> {
    try {
      console.log('[QuestionService] Creating question with DataStore:', input);
      const question = await DataStore.save(
        new Question({
          ...input,
        })
      );
      
      console.log('[QuestionService] Question created successfully:', question.id);
      return question;
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  }

  /**
   * Get all Questions
   */
  static async getQuestions(): Promise<Question[]> {
    try {
      return await DataStore.query(Question);
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  }

  /**
   * Get a Question by ID
   */
  static async getQuestion(id: string): Promise<Question | null> {
    try {
      return await DataStore.query(Question, id);
    } catch (error) {
      console.error("Error fetching question:", error);
      throw error;
    }
  }

  /**
   * Update a Question
   */
  static async updateQuestion(id: string, data: QuestionUpdateData): Promise<Question> {
    try {
      const original = await DataStore.query(Question, id);
      if (!original) {
        throw new Error(`Question with id ${id} not found`);
      }

      const updated = await DataStore.save(
        Question.copyOf(original, (updated) => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  }

  /**
   * Delete a Question
   */
  static async deleteQuestion(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(Question, id);
      if (!toDelete) {
        throw new Error(`Question with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  }

  /**
   * Subscribe to changes in Question items
   */
  static subscribeQuestions(callback: (items: Question[], isSynced: boolean) => void): {
    unsubscribe: () => void;
  } {
    console.log('[QuestionService] Setting up DataStore subscription for Question');
    
    const querySubscription = DataStore.observeQuery(Question).subscribe((snapshot) => {
      const { items, isSynced } = snapshot;
      
      console.log('[QuestionService] DataStore subscription update:', {
        itemCount: items.length,
        isSynced,
        itemIds: items.map(i => i.id)
      });
      
      callback(items, isSynced);
    });
    
    return {
      unsubscribe: () => {
        console.log('[QuestionService] Unsubscribing from DataStore');
        querySubscription.unsubscribe();
      }
    };
  }

  /**
   * Clear the DataStore completely
   */
  static async clearDataStore(): Promise<void> {
    try {
      await DataStore.clear();
    } catch (error) {
      console.error("Error clearing DataStore:", error);
      throw error;
    }
  }
}
