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

export async function initTaskSystem(
  options: TaskSystemInitOptions = {}
): Promise<void> {
  // Safe to call multiple times; this does NOT call Amplify.configure().
  logWithPlatform("⚙️", "", "TaskSystem", "Configuring conflict resolution");
  ConflictResolution.configure();
  logWithPlatform("✅", "", "TaskSystem", "Conflict resolution configured");

  if (options.startDataStore) {
    logWithPlatform(
      "☁️",
      "",
      "TaskSystem",
      "Starting AWS DataStore (via initTaskSystem option)"
    );
    // Only single-flight DataStore.start (avoid concurrent starts). Do not cache permanently.
    if (!startInFlight) {
      startInFlight = DataStore.start().finally(() => {
        startInFlight = null;
        logWithPlatform(
          "☁️",
          "",
          "TaskSystem",
          "AWS DataStore started (via initTaskSystem option)"
        );
      });
    }
    await startInFlight;
  }
}
