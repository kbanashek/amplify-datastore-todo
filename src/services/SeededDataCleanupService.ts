import { DataStore } from "@aws-amplify/datastore";
import type { PersistentModelConstructor } from "@aws-amplify/datastore";
import { AppointmentService } from "./AppointmentService";
import {
  Activity,
  DataPoint,
  DataPointInstance,
  Question,
  Task,
  TaskAnswer,
  TaskHistory,
  TaskResult,
  Todo,
} from "../../models";

export interface ClearSeededDataResult {
  deleted: {
    todos: number;
    tasks: number;
    activities: number;
    questions: number;
    dataPoints: number;
    dataPointInstances: number;
    taskAnswers: number;
    taskResults: number;
    taskHistories: number;
  };
  clearedAppointments: boolean;
}

/**
 * Centralized cleanup helper intended for deterministic local testing (including E2E).
 *
 * NOTE: DataStore deletes are syncable and will propagate to the configured backend.
 * Use this only for development/testing environments.
 */
export class SeededDataCleanupService {
  private static async deleteAllForModel<TModel>(
    modelConstructor: PersistentModelConstructor<TModel>,
    label: string
  ): Promise<number> {
    const items = await DataStore.query(modelConstructor);
    let deletedCount = 0;

    for (const item of items) {
      await DataStore.delete(item);
      deletedCount++;
    }

    console.log("[SeededDataCleanupService] Deleted items", {
      label,
      deletedCount,
    });

    return deletedCount;
  }

  static async clearAllSeededData(): Promise<ClearSeededDataResult> {
    const taskAnswers = await this.deleteAllForModel(TaskAnswer, "TaskAnswer");
    const taskResults = await this.deleteAllForModel(TaskResult, "TaskResult");
    const taskHistories = await this.deleteAllForModel(
      TaskHistory,
      "TaskHistory"
    );

    const tasks = await this.deleteAllForModel(Task, "Task");
    const activities = await this.deleteAllForModel(Activity, "Activity");

    const questions = await this.deleteAllForModel(Question, "Question");
    const dataPoints = await this.deleteAllForModel(DataPoint, "DataPoint");
    const dataPointInstances = await this.deleteAllForModel(
      DataPointInstance,
      "DataPointInstance"
    );
    const todos = await this.deleteAllForModel(Todo, "Todo");

    await AppointmentService.clearAppointments();

    return {
      deleted: {
        todos,
        tasks,
        activities,
        questions,
        dataPoints,
        dataPointInstances,
        taskAnswers,
        taskResults,
        taskHistories,
      },
      clearedAppointments: true,
    };
  }
}
