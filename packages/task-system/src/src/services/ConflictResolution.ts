import { DataStore, OpType } from "@aws-amplify/datastore";
import { ModelName } from "../constants/modelNames";

function ensurePkSk(model: any, fallback?: any): any {
  if (!model) return model;
  const merged = { ...model };
  const pk = merged.pk ?? fallback?.pk;
  const sk = merged.sk ?? fallback?.sk;
  const id = merged.id ?? fallback?.id;
  if (pk != null) merged.pk = pk;
  if (sk != null) merged.sk = sk;
  if (id != null) merged.id = id;
  return merged;
}

/**
 * Unified conflict resolution strategy for all DataStore models
 * This handles conflicts for Task, Question, Activity, DataPoint,
 * DataPointInstance, TaskAnswer, TaskResult, and TaskHistory
 * Note: Todo model conflict resolution is included for schema compatibility but Todo components are not used in this package
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
        console.log(
          `[ConflictResolution] Handling conflict for ${modelName}, operation: ${operation}, attempts: ${attempts}`
        );

        // Defensive: Amplify can sometimes surface conflict callbacks with partial/null models.
        // Always prefer returning a model that includes required keys (pk/sk/id) when available.
        const safeLocal = localModel ?? null;
        const safeRemote = remoteModel ?? null;

        // Task model has special handling for UPDATE operations
        if (modelName === ModelName.Task) {
          if (operation === OpType.UPDATE) {
            // Prefer local status changes, but remote timing updates
            const resolvedModel = {
              ...(safeRemote || {}), // Start with remote model as base (may be missing pk/sk on tombstones)
              status: safeLocal?.status || safeRemote?.status, // Prefer local status
              // For timing, prefer remote if it's more recent
              startTimeInMillSec:
                safeRemote?.startTimeInMillSec || safeLocal?.startTimeInMillSec,
              expireTimeInMillSec:
                safeRemote?.expireTimeInMillSec ||
                safeLocal?.expireTimeInMillSec,
              endTimeInMillSec:
                safeRemote?.endTimeInMillSec || safeLocal?.endTimeInMillSec,
              // For activity responses, prefer local if it exists
              activityAnswer:
                safeLocal?.activityAnswer || safeRemote?.activityAnswer,
              activityResponse:
                safeLocal?.activityResponse || safeRemote?.activityResponse,
            };
            return ensurePkSk(resolvedModel, safeLocal);
          }
        }

        // Handle DELETE operations for all models
        if (operation === OpType.DELETE) {
          // If remote is already deleted, use that version
          if (safeRemote?._deleted) {
            // Amplify can provide a "tombstone" remoteModel missing required fields like pk/sk.
            return ensurePkSk(safeRemote, safeLocal);
          }

          // If local model is incomplete, use remote with _deleted flag
          // Check for different identifying fields based on model type
          let isIncomplete = false;

          if (modelName === ModelName.Task) {
            isIncomplete = !safeLocal?.title && !safeLocal?.description;
          } else if (modelName === ModelName.Todo) {
            isIncomplete = !safeLocal?.name;
          } else if (modelName === ModelName.Question) {
            isIncomplete = !safeLocal?.question && !safeLocal?.questionId;
          } else if (modelName === ModelName.Activity) {
            isIncomplete = !safeLocal?.name && !safeLocal?.title;
          } else {
            // For other models (DataPoint, DataPointInstance, TaskAnswer, TaskResult, TaskHistory)
            // Check if pk and sk are missing
            isIncomplete = !safeLocal?.pk && !safeLocal?.sk;
          }

          if (isIncomplete) {
            // If we have no remote, fall back to local (ensuring keys).
            if (!safeRemote) {
              return ensurePkSk(safeLocal, safeRemote);
            }
            return ensurePkSk({ ...safeRemote, _deleted: true }, safeLocal);
          }

          // Otherwise use local delete
          return ensurePkSk(safeLocal, safeRemote);
        }

        // Default to remote model for UPDATE and CREATE operations
        // Prefer remote, but if remote is missing, fall back to local.
        return (
          ensurePkSk(safeRemote, safeLocal) ?? ensurePkSk(safeLocal, safeRemote)
        );
      },
    });
  }
}
