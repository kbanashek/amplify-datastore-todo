import { DataStore } from "@aws-amplify/datastore";
import {
  ImportTaskSystemFixtureOptions,
  ImportTaskSystemFixtureResult,
  TaskSystemFixture,
} from "../fixtures/TaskSystemFixture";
import {
  Activity,
  DataPoint,
  DataPointInstance,
  Question,
  Task,
  TaskAnswer,
  TaskHistory,
  TaskResult,
} from "../models";
import { ActivityService } from "./ActivityService";
import { AppointmentService } from "./AppointmentService";
import { QuestionService } from "./QuestionService";
import { TaskService } from "./TaskService";

function applyDefined(target: any, source: any, omitKeys: string[] = []): void {
  Object.keys(source || {}).forEach(key => {
    if (omitKeys.includes(key)) return;
    const value = source[key];
    if (value !== undefined) {
      target[key] = value;
    }
  });
}

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
          (fixture as any)?.version
        )}. Expected 1.`
      );
    }

    const selectLatestByLastChanged = <T extends { _lastChangedAt?: number }>(
      items: T[]
    ): T => {
      return [...items].sort(
        (a, b) => (b._lastChangedAt ?? 0) - (a._lastChangedAt ?? 0)
      )[0];
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

    // Build pk maps for idempotent upserts.
    // Note: Dynamo primary key is "id", so pk is NOT unique. We explicitly dedupe by pk.
    const existingActivities = await DataStore.query(Activity);
    const activitiesByPkList = groupByPk(existingActivities as any[]);
    const duplicateActivities: any[] = [];
    const activityByPk = new Map<string, any>();
    activitiesByPkList.forEach((items, pk) => {
      if (items.length === 1) {
        activityByPk.set(pk, items[0]);
        return;
      }
      const keep = selectLatestByLastChanged(items as any[]);
      activityByPk.set(pk, keep);
      duplicateActivities.push(...items.filter(i => i !== keep));
    });

    const existingTasks = await DataStore.query(Task);
    const tasksByPkList = groupByPk(existingTasks as any[]);
    const duplicateTasks: any[] = [];
    const taskByPk = new Map<string, any>();
    tasksByPkList.forEach((items, pk) => {
      if (items.length === 1) {
        taskByPk.set(pk, items[0]);
        return;
      }
      const keep = selectLatestByLastChanged(items as any[]);
      taskByPk.set(pk, keep);
      duplicateTasks.push(...items.filter(i => i !== keep));
    });

    const existingQuestions = await DataStore.query(Question);
    const questionsByPkList = groupByPk(existingQuestions as any[]);
    const duplicateQuestions: any[] = [];
    const questionByPk = new Map<string, any>();
    questionsByPkList.forEach((items, pk) => {
      if (items.length === 1) {
        questionByPk.set(pk, items[0]);
        return;
      }
      const keep = selectLatestByLastChanged(items as any[]);
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
      const existing = activityByPk.get(activityInput.pk);
      if (!existing) {
        const created = await ActivityService.createActivity(activityInput);
        activityByPk.set(created.pk, created);
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

      activityByPk.set(updated.pk, updated);
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
        taskByPk.set(created.pk, created);
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
        const deleteAll = async <TModel extends Record<string, any>>(
          model: any
        ): Promise<void> => {
          const items = (await DataStore.query(model)) as any[];
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
