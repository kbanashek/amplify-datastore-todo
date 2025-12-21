import { generateClient } from "@aws-amplify/api";
import { DataStore } from "@aws-amplify/datastore";
import { initTaskSystem, TempAnswerSyncService } from "@orion/task-system";
import { logErrorWithPlatform, logWithPlatform } from "../utils/platformLogger";

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
      logWithPlatform(
        "🚀",
        "",
        "Bootstrap",
        "Initializing task-system runtime"
      );
      // Initialize task-system runtime configuration (no Amplify.configure() inside)
      await initTaskSystem({ startDataStore: false });
      logWithPlatform("✅", "", "Bootstrap", "Task-system runtime initialized");

      if (startDataStore) {
        logWithPlatform("☁️", "", "Bootstrap", "Starting AWS DataStore");
        await DataStore.start();
        logWithPlatform(
          "☁️",
          "",
          "Bootstrap",
          "AWS DataStore started - ready for cloud sync"
        );
      }

      // Configure TempAnswerSyncService with real Amplify GraphQL API
      // This enables temp-save functionality when users click Next in questionnaires
      logWithPlatform(
        "🚀",
        "",
        "Bootstrap",
        "Configuring temp answer sync service"
      );
      const client = generateClient();
      TempAnswerSyncService.configure({
        document:
          "mutation SaveTempAnswers($input: JSON!) { saveTempAnswers(input: $input) }",
        executor: {
          execute: async ({ document, variables }) => {
            try {
              logWithPlatform(
                "💾",
                "",
                "bootstrapTaskSystem",
                "Executing temp-save GraphQL mutation",
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

              logWithPlatform(
                "✅",
                "",
                "bootstrapTaskSystem",
                "Temp-save GraphQL mutation succeeded",
                {
                  hasData: !!data,
                }
              );

              return { data };
            } catch (error) {
              logErrorWithPlatform(
                "",
                "bootstrapTaskSystem",
                "Temp-save GraphQL mutation failed",
                error
              );
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

      // Start auto-flush to retry queued temp answers when network comes back.
      // This will automatically retry any queued temp answers from previous sessions
      // when the app starts (if network is online) or when network comes back online.
      // This is expected behavior - queued items persist across app restarts until synced.
      logWithPlatform(
        "🚀",
        "",
        "Bootstrap",
        "Starting auto-flush for queued temp answers"
      );
      TempAnswerSyncService.startAutoFlush();
      logWithPlatform(
        "✅",
        "",
        "Bootstrap",
        "Auto-flush started - will retry queued items on network online"
      );
      logWithPlatform(
        "✅",
        "",
        "Bootstrap",
        "All initialization complete - data services ready"
      );
    })().finally(() => {
      bootstrapInFlight = null;
    });
  }

  return bootstrapInFlight;
}
