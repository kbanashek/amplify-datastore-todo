import { DataStore } from "@aws-amplify/datastore";
import { Activity, Question, Task } from "../models";
import { AppointmentService } from "./AppointmentService";
import {
  ImportTaskSystemFixtureOptions,
  ImportTaskSystemFixtureResult,
  TaskSystemFixture,
} from "../fixtures/TaskSystemFixture";
import { ActivityService } from "./ActivityService";
import { TaskService } from "./TaskService";
import { QuestionService } from "./QuestionService";

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

    if (!fixture || fixture.version !== 1) {
      throw new Error(
        `Unsupported fixture version: ${String(
          (fixture as any)?.version
        )}. Expected 1.`
      );
    }

    // Build pk maps for idempotent upserts.
    const existingActivities = await DataStore.query(Activity);
    const activityByPk = new Map<string, any>(
      existingActivities.map(a => [a.pk, a])
    );

    const existingTasks = await DataStore.query(Task);
    const taskByPk = new Map<string, any>(existingTasks.map(t => [t.pk, t]));

    const existingQuestions = await DataStore.query(Question);
    const questionByPk = new Map<string, any>(
      existingQuestions.map(q => [q.pk, q])
    );

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

    return result;
  }
}
