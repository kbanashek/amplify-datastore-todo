import type { AppointmentData } from "../types/Appointment";
import type { CreateActivityInput } from "../types/Activity";
import type { CreateQuestionInput } from "../types/Question";
import type { CreateTaskInput } from "../types/Task";

export type TaskSystemFixtureVersion = 1;

/**
 * A host-owned, disk-persisted fixture format that LX can version control.
 *
 * Intent:
 * - LX owns the "seed" content (activities, tasks, etc.)
 * - The task-system package provides an importer to materialize it into DataStore / storage.
 * - Fixtures are designed to be human-editable and deterministic (stable pk/sk).
 */
export interface TaskSystemFixture {
  version: TaskSystemFixtureVersion;

  /**
   * Optional identifier to help humans track which fixture is in use.
   * Not used for idempotency; idempotency is driven by pk values.
   */
  fixtureId?: string;

  activities: CreateActivityInput[];
  tasks: CreateTaskInput[];

  /**
   * Optional: if you want to seed Question model records separately.
   * NOTE: The Questions UI primarily reads questions from Activity.layouts/activityGroups.
   */
  questions?: CreateQuestionInput[];

  /**
   * Appointments are stored outside DataStore (AsyncStorage) in this repo.
   */
  appointments?: AppointmentData;
}

export type ImportTaskSystemFixtureOptions = {
  /**
   * If true, existing records with matching pk will be updated to match fixture fields.
   * If false, existing records will be left unchanged.
   *
   * Default: true
   */
  updateExisting?: boolean;
};

export type ImportTaskSystemFixtureResult = {
  activities: { created: number; updated: number; skipped: number };
  tasks: { created: number; updated: number; skipped: number };
  questions: { created: number; updated: number; skipped: number };
  appointments: { saved: boolean };
};
