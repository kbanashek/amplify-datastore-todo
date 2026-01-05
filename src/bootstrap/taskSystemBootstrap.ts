import { DataStore } from "@aws-amplify/datastore";
import { getLoggingService, initTaskSystem } from "@orion/task-system";
import { logWithPlatform } from "../utils/platformLogger";

export interface TaskSystemBootstrapOptions {
  /**
   * If true, start DataStore after initializing task-system runtime.
   * Default: true for the harness app.
   */
  startDataStore?: boolean;

  /**
   * Organization identifier (parentId in Lumiere).
   * Used for S3 image storage path hierarchy.
   * LX should pass this from their app configuration.
   */
  organizationId?: string;

  /**
   * Study identifier.
   * Used for S3 image storage path hierarchy.
   * LX should pass this from their app configuration.
   */
  studyId?: string;

  /**
   * Study instance identifier.
   * Used for S3 image storage path hierarchy.
   * LX should pass this from their app configuration.
   */
  studyInstanceId?: string;
}

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
      await initTaskSystem({
        startDataStore: false,
        organizationId: options.organizationId,
        studyId: options.studyId,
        studyInstanceId: options.studyInstanceId,
      });
      logBootstrap("✅", "Task-system runtime initialized");

      if (startDataStore) {
        logBootstrap("☁️", "Starting AWS DataStore");
        await DataStore.start();
        logBootstrap("☁️", "AWS DataStore started - ready for cloud sync");
      }

      // TempAnswerSyncService now uses DataStore directly
      // No configuration needed - DataStore handles sync automatically
      logBootstrap(
        "✅",
        "Temp answer sync enabled via DataStore (no configuration needed)"
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
