import { DataStore, OpType } from "@aws-amplify/datastore";

/**
 * Unified conflict resolution strategy for all DataStore models
 * This handles conflicts for Task, Question, Activity, DataPoint, 
 * DataPointInstance, TaskAnswer, TaskResult, and TaskHistory
 */
export class ConflictResolution {
  static configure() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        const modelName = modelConstructor.name;
        console.log(`[ConflictResolution] Handling conflict for ${modelName}, operation: ${operation}, attempts: ${attempts}`);

        // Task model has special handling for UPDATE operations
        if (modelName === "Task") {
          if (operation === OpType.UPDATE) {
            // Prefer local status changes, but remote timing updates
            const resolvedModel = {
              ...remoteModel, // Start with remote model as base
              status: localModel.status || remoteModel.status, // Prefer local status
              // For timing, prefer remote if it's more recent
              startTimeInMillSec: remoteModel.startTimeInMillSec || localModel.startTimeInMillSec,
              expireTimeInMillSec: remoteModel.expireTimeInMillSec || localModel.expireTimeInMillSec,
              endTimeInMillSec: remoteModel.endTimeInMillSec || localModel.endTimeInMillSec,
              // For activity responses, prefer local if it exists
              activityAnswer: localModel.activityAnswer || remoteModel.activityAnswer,
              activityResponse: localModel.activityResponse || remoteModel.activityResponse,
            };
            return resolvedModel;
          }
        }

        // Handle DELETE operations for all models
        if (operation === OpType.DELETE) {
          // If remote is already deleted, use that version
          if (remoteModel._deleted) {
            return remoteModel;
          }
          
          // If local model is incomplete, use remote with _deleted flag
          // Check for different identifying fields based on model type
          let isIncomplete = false;
          
          if (modelName === "Task") {
            isIncomplete = !localModel.title && !localModel.description;
          } else if (modelName === "Question") {
            isIncomplete = !localModel.question && !localModel.questionId;
          } else if (modelName === "Activity") {
            isIncomplete = !localModel.name && !localModel.title;
          } else {
            // For other models (DataPoint, DataPointInstance, TaskAnswer, TaskResult, TaskHistory)
            // Check if pk and sk are missing
            isIncomplete = !localModel.pk && !localModel.sk;
          }
          
          if (isIncomplete) {
            return { ...remoteModel, _deleted: true };
          }
          
          // Otherwise use local delete
          return localModel;
        }

        // Default to remote model for UPDATE and CREATE operations
        return remoteModel;
      },
    });
  }
}

