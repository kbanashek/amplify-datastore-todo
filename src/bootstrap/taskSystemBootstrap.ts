import { DataStore } from "@aws-amplify/datastore";
import { generateClient } from "@aws-amplify/api";
import { initTaskSystem, TempAnswerSyncService } from "@orion/task-system";

export type TaskSystemBootstrapOptions = {
  /**
   * If true, start DataStore after initializing task-system runtime.
   * Default: true for the harness app.
   */
  startDataStore?: boolean;
};

let bootstrapInFlight: Promise<void> | null = null;

/**
 * Host-owned bootstrap (LX-style):
 * - Host app owns Amplify.configure() (must run before calling this)
 * - Host app owns DataStore lifecycle (start/stop/clear)
 * - task-system package provides initTaskSystem() (conflict handler + optional start)
 */
export async function bootstrapTaskSystem(
  options: TaskSystemBootstrapOptions = {}
): Promise<void> {
  const startDataStore = options.startDataStore ?? true;

  if (!bootstrapInFlight) {
    bootstrapInFlight = (async () => {
      // Initialize task-system runtime configuration (no Amplify.configure() inside)
      await initTaskSystem({ startDataStore: false });

      if (startDataStore) {
        await DataStore.start();
      }

      // Configure TempAnswerSyncService with real Amplify GraphQL API
      // This enables temp-save functionality when users click Next in questionnaires
      const client = generateClient();
      TempAnswerSyncService.configure({
        document:
          "mutation SaveTempAnswers($input: JSON!) { saveTempAnswers(input: $input) }",
        executor: {
          execute: async ({ document, variables }) => {
            try {
              console.log(
                "[bootstrapTaskSystem] Temp-save execute (real API)",
                {
                  document: document.substring(0, 80),
                  variableKeys: Object.keys(variables ?? {}),
                }
              );

              // Use Amplify's real GraphQL API client
              const response = await client.graphql({
                query: document,
                variables,
              });

              // Handle GraphQLResult type
              const data = "data" in response ? response.data : undefined;

              console.log("[bootstrapTaskSystem] Temp-save success", {
                hasData: !!data,
              });

              return { data };
            } catch (error) {
              console.error("[bootstrapTaskSystem] Temp-save error", error);
              // Return error in GraphQL response format
              return {
                data: undefined,
                errors: [
                  error instanceof Error
                    ? { message: error.message }
                    : { message: String(error) },
                ],
              };
            }
          },
        },
        mapper: ({ task, activity, answers, localtime }) => {
          return {
            stableKey: task.pk,
            variables: {
              stableKey: task.pk,
              activityId: activity.pk ?? activity.id,
              localtime,
              answers,
            },
          };
        },
      });

      // Start auto-flush to retry queued temp answers when network comes back
      TempAnswerSyncService.startAutoFlush();
    })().finally(() => {
      bootstrapInFlight = null;
    });
  }

  return bootstrapInFlight;
}
