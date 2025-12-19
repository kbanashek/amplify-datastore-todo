import { DataStore } from "@aws-amplify/datastore";
import { ConflictResolution } from "../services/ConflictResolution";

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
  ConflictResolution.configure();

  if (options.startDataStore) {
    // Only single-flight DataStore.start (avoid concurrent starts). Do not cache permanently.
    if (!startInFlight) {
      startInFlight = DataStore.start().finally(() => {
        startInFlight = null;
      });
    }
    await startInFlight;
  }
}
