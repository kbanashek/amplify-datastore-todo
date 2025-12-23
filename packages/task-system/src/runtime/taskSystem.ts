import { DataStore } from "@aws-amplify/datastore";
import { ConflictResolution } from "../services/ConflictResolution";
import { logWithPlatform } from "../utils/platformLogger";

/**
 * LX ownership contract:
 * - Host app owns Amplify.configure()
 * - task-system package never calls Amplify.configure()
 * - Package may optionally start DataStore if the host asks it to
 */

export type TaskSystemInitOptions = {
  /**
   * If true, start DataStore after configuring package-level DataStore options.
   * Default: false (LX-style host ownership of DataStore lifecycle)
   */
  startDataStore?: boolean;
};

let startInFlight: Promise<void> | null = null;
const taskSystemLogs = new Map<string, number>();
const TASK_SYSTEM_LOG_DEDUP_MS = 10000; // 10 second window (React Strict Mode)

/**
 * Deduplicated TaskSystem logging
 */
function logTaskSystem(icon: string, message: string): void {
  const signature = `tasksystem-${message}`;
  const now = Date.now();
  const lastLogTime = taskSystemLogs.get(signature) || 0;

  if (now - lastLogTime < TASK_SYSTEM_LOG_DEDUP_MS) {
    return; // Skip duplicate
  }

  logWithPlatform(icon, "", "TaskSystem", message);
  taskSystemLogs.set(signature, now);
}

export async function initTaskSystem(
  options: TaskSystemInitOptions = {}
): Promise<void> {
  // Safe to call multiple times; this does NOT call Amplify.configure().
  logTaskSystem("⚙️", "Configuring conflict resolution");
  ConflictResolution.configure();
  logTaskSystem("✅", "Conflict resolution configured");

  if (options.startDataStore) {
    logTaskSystem("☁️", "Starting AWS DataStore (via initTaskSystem option)");
    // Only single-flight DataStore.start (avoid concurrent starts). Do not cache permanently.
    if (!startInFlight) {
      startInFlight = DataStore.start().finally(() => {
        startInFlight = null;
        logTaskSystem(
          "☁️",
          "AWS DataStore started (via initTaskSystem option)"
        );
      });
    }
    await startInFlight;
  }
}
