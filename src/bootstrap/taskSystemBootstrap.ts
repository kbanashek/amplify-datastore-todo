import { generateClient } from "@aws-amplify/api";
import { Amplify } from "@aws-amplify/core";
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
const bootstrapLogs = new Map<string, number>();
const BOOTSTRAP_LOG_DEDUP_MS = 10000; // 10 second window for bootstrap logs (React Strict Mode)

/**
 * Deduplicated bootstrap logging
 * Uses module-level cache to prevent duplicates even with React Strict Mode double renders
 */
function logBootstrap(icon: string, message: string): void {
  const signature = `bootstrap-${message}`;
  const now = Date.now();
  const lastLogTime = bootstrapLogs.get(signature) || 0;

  // Skip if logged within the deduplication window
  if (now - lastLogTime < BOOTSTRAP_LOG_DEDUP_MS) {
    return; // Skip duplicate
  }

  logWithPlatform(icon, "", "Bootstrap", message);
  bootstrapLogs.set(signature, now);

  // Clean up old entries periodically
  if (bootstrapLogs.size > 50) {
    const entries = Array.from(bootstrapLogs.entries());
    entries
      .sort((a, b) => a[1] - b[1])
      .slice(0, 25)
      .forEach(([key]) => bootstrapLogs.delete(key));
  }
}

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
      logBootstrap("🚀", "Initializing task-system runtime");
      // Initialize task-system runtime configuration (no Amplify.configure() inside)
      await initTaskSystem({ startDataStore: false });
      logBootstrap("✅", "Task-system runtime initialized");

      if (startDataStore) {
        logBootstrap("☁️", "Starting AWS DataStore");
        await DataStore.start();
        logBootstrap("☁️", "AWS DataStore started - ready for cloud sync");
      }

      // Configure TempAnswerSyncService with real Amplify GraphQL API
      // This enables temp-save functionality when users click Next in questionnaires
      logBootstrap("🚀", "Configuring temp answer sync service");

      // Verify Amplify is configured before calling generateClient
      // Note: We check isConfigured flag directly to avoid triggering the warning
      // from Amplify.getConfig() if Amplify isn't configured yet
      const isConfigured = (Amplify as any).isConfigured;
      if (!isConfigured) {
        const error = new Error(
          "Amplify must be configured before calling bootstrapTaskSystem. Ensure amplify-init-sync.ts is imported before this function is called."
        );
        logErrorWithPlatform(
          "",
          "Bootstrap",
          "Amplify not configured before generateClient() call",
          error
        );
        throw error;
      }

      const client = generateClient();
      TempAnswerSyncService.configure({
        document:
          "mutation SaveTempAnswers($input: JSON!) { saveTempAnswers(input: $input) }",
        executor: {
          execute: async ({ document, variables }) => {
            try {
              // Deduplicate GraphQL mutation logs - use a more specific signature
              const variableKeysStr = Object.keys(variables ?? {})
                .sort()
                .join(",");
              const mutationSignature = `mutation-exec-${document.substring(0, 40)}-${variableKeysStr}`;
              const mutationLastLog = bootstrapLogs.get(mutationSignature) || 0;
              const now = Date.now();

              // Only log if not a duplicate (but still execute the mutation)
              if (now - mutationLastLog >= BOOTSTRAP_LOG_DEDUP_MS) {
                // Format metadata as readable list
                const metadataList = [
                  `  • document: ${document.substring(0, 80)}`,
                  `  • variableKeys: [${Object.keys(variables ?? {}).join(", ")}]`,
                ].join("\n");

                logWithPlatform(
                  "💾",
                  "",
                  "bootstrapTaskSystem",
                  `Executing temp-save GraphQL mutation\n${metadataList}`
                );
                bootstrapLogs.set(mutationSignature, now);
              }

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
      logBootstrap("🚀", "Starting auto-flush for queued temp answers");
      TempAnswerSyncService.startAutoFlush();
      logBootstrap(
        "✅",
        "Auto-flush started - will retry queued items on network online"
      );
      logBootstrap("✅", "All initialization complete - data services ready");
    })().finally(() => {
      // Don't reset bootstrapInFlight immediately - keep it for a bit to prevent rapid re-initialization
      // This helps with React Strict Mode double renders
      setTimeout(() => {
        bootstrapInFlight = null;
      }, 1000); // Keep for 1 second after completion
    });
  }

  return bootstrapInFlight;
}
