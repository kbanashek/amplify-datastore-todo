import { DataStore } from "@aws-amplify/datastore";
import { initTaskSystem } from "@orion/task-system";

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
    })().finally(() => {
      bootstrapInFlight = null;
    });
  }

  return bootstrapInFlight;
}
