import { DataStore } from "@aws-amplify/datastore";
import type { PersistentModelConstructor } from "@aws-amplify/datastore";
import {
  ImportTaskSystemFixtureOptions,
  ImportTaskSystemFixtureResult,
  TaskSystemFixture,
} from "@fixtures/TaskSystemFixture";
import {
  Activity,
  DataPoint,
  DataPointInstance,
  Question,
  Task,
  TaskAnswer,
  TaskHistory,
  TaskResult,
} from "@models/index";
import { ActivityService } from "@services/ActivityService";
import { AppointmentService } from "@services/AppointmentService";
import { QuestionService } from "@services/QuestionService";
import { TaskService } from "@services/TaskService";

/**
 * Applies defined values from source to target object, optionally omitting specified keys.
 *
 * @param target - Object to apply values to
 * @param source - Object to copy values from
 * @param omitKeys - Keys to skip during copy
 */
function applyDefined(
  target: unknown,
  source: unknown,
  omitKeys: string[] = []
): void {
  Object.keys((source as Record<string, unknown>) || {}).forEach(key => {
    if (omitKeys.includes(key)) return;
    const value = (source as Record<string, unknown>)[key];
    if (value !== undefined) {
      (target as Record<string, unknown>)[key] = value;
    }
  });
}

/**
 * Service for importing TaskSystemFixture data into AWS DataStore.
 *
 * Handles bulk import of activities, questions, tasks, and related entities
 * from a structured fixture format. Supports updating existing records
 * and pruning non-fixture data.
 *
 * @example
 * ```typescript
 * import { TaskSystemFixture } from "@fixtures/TaskSystemFixture";
 *
 * const fixture: TaskSystemFixture = {
 *   version: 1,
 *   activities: [...],
 *   tasks: [...],
 *   questions: [...],
 * };
 *
 * const result = await FixtureImportService.importTaskSystemFixture(fixture, {
 *   updateExisting: true,
 *   pruneNonFixture: false,
 * });
 *
 * console.log(`Imported ${result.activitiesCreated} activities`);
 * ```
 */
export class FixtureImportService {
  static async importTaskSystemFixture(
    fixture: TaskSystemFixture,
    options: ImportTaskSystemFixtureOptions = {}
  ): Promise<ImportTaskSystemFixtureResult> {
    const updateExisting = options.updateExisting ?? true;
    const pruneNonFixture = options.pruneNonFixture ?? false;
    const pruneDerivedModels = options.pruneDerivedModels ?? false;

    if (!fixture || fixture.version !== 1) {
      throw new Error(
        `Unsupported fixture version: ${String(
          fixture?.version
        )}. Expected 1.`
      );
    }

    /**
     * Helper to select the latest item from an array based on _lastChangedAt timestamp.
     * DataStore models have _lastChangedAt at runtime, so this helper accepts any array
     * and adds the timestamp property to the constraint.
     */
    const selectLatestByLastChanged = <T>(items: T[]): T => {
      return [...items].sort((a, b) => {
        const aTime = (a as { _lastChangedAt?: number })._lastChangedAt ?? 0;
        const bTime = (b as { _lastChangedAt?: number })._lastChangedAt ?? 0;
        return bTime - aTime;
      })[0];
    };

    const groupByPk = <T extends { pk: string }>(
      items: T[]
    ): Map<string, T[]> => {
      const map = new Map<string, T[]>();
      items.forEach(item => {
        const existing = map.get(item.pk) ?? [];
        existing.push(item);
        map.set(item.pk, existing);
      });
      return map;
    };

    // Build pk+sk maps for idempotent upserts.
    // Note: Activities can have the same pk but different sk values (e.g., all activities in a study share the same pk)
    // We need to match by both pk AND sk to correctly identify existing activities
    const existingActivities = await DataStore.query(Activity);
    const activityByPkSk = new Map<string, Activity>(); // Key: `${pk}#${sk}`
    const duplicateActivities: Activity[] = [];

    existingActivities.forEach((activity: Activity) => {
      const key = `${activity.pk}#${activity.sk}`;
      const existing = activityByPkSk.get(key);
      if (!existing) {
        activityByPkSk.set(key, activity);
      } else {
        // If duplicate found, keep the latest one
        const keep = selectLatestByLastChanged([existing, activity]);
        activityByPkSk.set(key, keep);
        duplicateActivities.push(keep === existing ? activity : existing);
      }
    });

    const existingTasks = await DataStore.query(Task);
    const tasksByPkList = groupByPk(existingTasks as Task[]);
    const duplicateTasks: Task[] = [];
    // Map type must match DataStore query return type
    const taskByPk = new Map<string, (typeof existingTasks)[0]>();
    tasksByPkList.forEach((items, pk) => {
      if (items.length === 1) {
        taskByPk.set(pk, items[0]);
        return;
      }
      const keep = selectLatestByLastChanged(items);
      taskByPk.set(pk, keep);
      duplicateTasks.push(...items.filter(i => i !== keep));
    });

    const existingQuestions = await DataStore.query(Question);
    const questionsByPkList = groupByPk(existingQuestions as Question[]);
    const duplicateQuestions: Question[] = [];
    const questionByPk = new Map<string, Question>();
    questionsByPkList.forEach((items, pk) => {
      if (items.length === 1) {
        questionByPk.set(pk, items[0]);
        return;
      }
      const keep = selectLatestByLastChanged(items);
      questionByPk.set(pk, keep);
      duplicateQuestions.push(...items.filter(i => i !== keep));
    });

    const result: ImportTaskSystemFixtureResult = {
      activities: { created: 0, updated: 0, skipped: 0 },
      tasks: { created: 0, updated: 0, skipped: 0 },
      questions: { created: 0, updated: 0, skipped: 0 },
      appointments: { saved: false },
    };

    // Activities
    for (const activityInput of fixture.activities || []) {
      const key = `${activityInput.pk}#${activityInput.sk}`;
      const existing = activityByPkSk.get(key);
      if (!existing) {
        const created = await ActivityService.createActivity(activityInput);
        activityByPkSk.set(key, created);
        result.activities.created++;
        continue;
      }

      if (!updateExisting) {
        result.activities.skipped++;
        continue;
      }

      const updated = await DataStore.save(
        Activity.copyOf(existing, draft => {
          // pk/sk are immutable identifiers; do not change them.
          applyDefined(draft, activityInput, ["pk", "sk", "id"]);
        })
      );

      activityByPkSk.set(key, updated);
      result.activities.updated++;
    }

    // Questions (optional)
    for (const questionInput of fixture.questions || []) {
      const existing = questionByPk.get(questionInput.pk);
      if (!existing) {
        const created = await QuestionService.createQuestion(questionInput);
        questionByPk.set(created.pk, created);
        result.questions.created++;
        continue;
      }

      if (!updateExisting) {
        result.questions.skipped++;
        continue;
      }

      const updated = await DataStore.save(
        Question.copyOf(existing, draft => {
          applyDefined(draft, questionInput, ["pk", "sk", "id"]);
        })
      );

      questionByPk.set(updated.pk, updated);
      result.questions.updated++;
    }

    // Tasks
    for (const taskInput of fixture.tasks || []) {
      const existing = taskByPk.get(taskInput.pk);
      if (!existing) {
        const created = await TaskService.createTask(taskInput);
        // Cast to DataStore type to match map values from DataStore.query
        taskByPk.set(created.pk, created as (typeof existingTasks)[0]);
        result.tasks.created++;
        continue;
      }

      if (!updateExisting) {
        result.tasks.skipped++;
        continue;
      }

      const updated = await DataStore.save(
        Task.copyOf(existing, draft => {
          applyDefined(draft, taskInput, ["pk", "sk", "id"]);
        })
      );

      taskByPk.set(updated.pk, updated);
      result.tasks.updated++;
    }

    // Appointments (optional; stored in AsyncStorage)
    if (fixture.appointments) {
      await AppointmentService.saveAppointments(fixture.appointments);
      result.appointments.saved = true;
    }

    // Optional: prune non-fixture records so fixture is the authoritative dataset.
    if (pruneNonFixture) {
      const fixtureActivityPks = new Set(
        (fixture.activities || []).map(a => a.pk)
      );
      const fixtureTaskPks = new Set((fixture.tasks || []).map(t => t.pk));
      const fixtureQuestionPks = new Set(
        (fixture.questions || []).map(q => q.pk)
      );

      const activitiesToDelete = existingActivities.filter(
        a => !fixtureActivityPks.has(a.pk)
      );
      const tasksToDelete = existingTasks.filter(
        t => !fixtureTaskPks.has(t.pk)
      );
      const questionsToDelete = existingQuestions.filter(
        q => !fixtureQuestionPks.has(q.pk)
      );

      // Best-effort deletes: these will be synced to cloud by DataStore.
      // We prune only core content models (Task/Activity/Question) to avoid
      // deleting submitted answer/result/history data unintentionally.
      const coreDeletes = [
        // Dedupe by pk (pk is not the Dynamo primary key, so duplicates can exist in cloud)
        ...duplicateActivities.map(a => DataStore.delete(a)),
        ...duplicateTasks.map(t => DataStore.delete(t)),
        ...duplicateQuestions.map(q => DataStore.delete(q)),
        ...activitiesToDelete.map(a => DataStore.delete(a)),
        ...tasksToDelete.map(t => DataStore.delete(t)),
        ...questionsToDelete.map(q => DataStore.delete(q)),
      ];

      await Promise.all(coreDeletes);

      // Optional: also prune derived models for dev/test reseeds.
      // This is intentionally behind a flag to avoid deleting real user data in production flows.
      if (pruneDerivedModels) {
        const deleteAll = async <TModel extends { id: string }>(
          model: PersistentModelConstructor<TModel>
        ): Promise<void> => {
          const items = await DataStore.query(model);
          await Promise.all(items.map(item => DataStore.delete(item)));
        };

        await Promise.all([
          deleteAll(TaskAnswer),
          deleteAll(TaskResult),
          deleteAll(TaskHistory),
          deleteAll(DataPointInstance),
          deleteAll(DataPoint),
        ]);
      }
    }

    return result;
  }
}
