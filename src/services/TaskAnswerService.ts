import { DataStore, OpType } from "@aws-amplify/datastore";
// @ts-ignore - TaskAnswer is exported from models/index.js at runtime
import { TaskAnswer } from "../../models";
import {
  CreateTaskAnswerInput,
  UpdateTaskAnswerInput,
} from "../types/TaskAnswer";

type TaskAnswerUpdateData = Omit<UpdateTaskAnswerInput, "id" | "_version">;

export class TaskAnswerService {
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        if (modelConstructor.name === "TaskAnswer") {
          if (operation === OpType.DELETE) {
            if (remoteModel._deleted) {
              return remoteModel;
            }
            if (!localModel.pk && !localModel.sk) {
              return { ...remoteModel, _deleted: true };
            }
            return localModel;
          }
        }
        return remoteModel;
      },
    });
  }

  static async createTaskAnswer(
    input: CreateTaskAnswerInput
  ): Promise<TaskAnswer> {
    try {
      console.log(
        "💾 [TaskAnswerService] Creating task answer with DataStore:",
        {
          pk: input.pk,
          sk: input.sk,
          taskInstanceId: input.taskInstanceId,
          activityId: input.activityId,
          questionId: input.questionId,
          answerLength: input.answer?.length || 0,
          answerPreview: input.answer?.substring(0, 50) || "null",
        }
      );

      const answer = await DataStore.save(
        new TaskAnswer({
          ...input,
        })
      );

      console.log("✅ [TaskAnswerService] TaskAnswer created successfully:", {
        id: answer.id,
        pk: answer.pk,
        questionId: answer.questionId,
        taskInstanceId: answer.taskInstanceId,
        hasAnswer: !!answer.answer,
      });
      return answer;
    } catch (error) {
      console.error("❌ [TaskAnswerService] Error creating task answer:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          pk: input.pk,
          questionId: input.questionId,
          taskInstanceId: input.taskInstanceId,
        },
      });
      throw error;
    }
  }

  static async getTaskAnswers(): Promise<TaskAnswer[]> {
    try {
      return await DataStore.query(TaskAnswer);
    } catch (error) {
      console.error("Error fetching task answers:", error);
      throw error;
    }
  }

  static async getTaskAnswer(id: string): Promise<TaskAnswer | null> {
    try {
      return await DataStore.query(TaskAnswer, id);
    } catch (error) {
      console.error("Error fetching task answer:", error);
      throw error;
    }
  }

  static async updateTaskAnswer(
    id: string,
    data: TaskAnswerUpdateData
  ): Promise<TaskAnswer> {
    try {
      console.log("🔄 [TaskAnswerService] Updating task answer:", {
        id,
        answerLength: data.answer?.length || 0,
        answerPreview: data.answer?.substring(0, 50) || "null",
      });

      const original = await DataStore.query(TaskAnswer, id);
      if (!original) {
        console.error(
          "❌ [TaskAnswerService] TaskAnswer not found for update:",
          { id }
        );
        throw new Error(`TaskAnswer with id ${id} not found`);
      }

      const updated = await DataStore.save(
        TaskAnswer.copyOf(original, (updated: any) => {
          Object.assign(updated, data);
        })
      );

      console.log("✅ [TaskAnswerService] TaskAnswer updated successfully:", {
        id: updated.id,
        questionId: updated.questionId,
        taskInstanceId: updated.taskInstanceId,
        hasAnswer: !!updated.answer,
      });

      return updated;
    } catch (error) {
      console.error("❌ [TaskAnswerService] Error updating task answer:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        id,
      });
      throw error;
    }
  }

  static async deleteTaskAnswer(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(TaskAnswer, id);
      if (!toDelete) {
        throw new Error(`TaskAnswer with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting task answer:", error);
      throw error;
    }
  }

  static subscribeTaskAnswers(
    callback: (items: TaskAnswer[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    console.log(
      "[TaskAnswerService] Setting up DataStore subscription for TaskAnswer"
    );

    const querySubscription = DataStore.observeQuery(TaskAnswer).subscribe(
      (snapshot) => {
        const { items, isSynced } = snapshot;

        console.log("[TaskAnswerService] DataStore subscription update:", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map((i) => i.id),
        });

        callback(items, isSynced);
      }
    );

    return {
      unsubscribe: () => {
        console.log("[TaskAnswerService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
      },
    };
  }

  static async clearDataStore(): Promise<void> {
    try {
      await DataStore.clear();
    } catch (error) {
      console.error("Error clearing DataStore:", error);
      throw error;
    }
  }
}
