import { AppColors } from "@constants/AppColors";
import { getTaskIcon } from "@utils/taskIcon";
import { Task, TaskType } from "@task-types/Task";

describe("getTaskIcon", () => {
  const createMockTask = (
    title: string,
    taskType: TaskType = TaskType.SCHEDULED
  ): Task => ({
    id: "test-id",
    pk: "test-pk",
    sk: "test-sk",
    title,
    taskType,
    status: "OPEN" as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  describe("keyword-based icons", () => {
    it("should return pills icon for medication tasks", () => {
      const task = createMockTask("Medication Reminder");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("pills");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return pills icon for diary tasks", () => {
      const task = createMockTask("Daily Diary Entry");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("pills");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return questionmark.circle icon for survey tasks", () => {
      const task = createMockTask("Health Survey");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("questionmark.circle");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return questionmark.circle icon for health tasks", () => {
      const task = createMockTask("Health Assessment");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("questionmark.circle");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return list.clipboard icon for quality tasks", () => {
      const task = createMockTask("Quality of Life Assessment");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("list.clipboard");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return list.clipboard icon for life tasks", () => {
      const task = createMockTask("Life Assessment");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("list.clipboard");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return bell icon for recall tasks", () => {
      const task = createMockTask("Memory Recall Test");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("bell");
      expect(icon.color).toBe(AppColors.legacy.warning);
    });

    it("should return bell icon for recognition tasks", () => {
      const task = createMockTask("Recognition Task");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("bell");
      expect(icon.color).toBe(AppColors.legacy.warning);
    });

    it("should return questionmark.circle icon for symptom tasks", () => {
      const task = createMockTask("Symptom Tracker");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("questionmark.circle");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return questionmark.circle icon for pain tasks", () => {
      const task = createMockTask("Pain Assessment");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("questionmark.circle");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return questionmark.circle icon for neuropathic tasks", () => {
      const task = createMockTask("Neuropathic Pain Scale");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("questionmark.circle");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should be case-insensitive for keywords", () => {
      const task = createMockTask("MEDICATION REMINDER");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("pills");
    });

    it("should match keywords anywhere in title", () => {
      const task = createMockTask("Complete your daily medication log");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("pills");
    });
  });

  describe("task type-based icons", () => {
    it("should return calendar icon for SCHEDULED tasks when no keywords match", () => {
      const task = createMockTask("Regular Task", TaskType.SCHEDULED);
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("calendar");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return clock icon for TIMED tasks when no keywords match", () => {
      const task = createMockTask("Timed Activity", TaskType.TIMED);
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("clock");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return repeat icon for EPISODIC tasks when no keywords match", () => {
      const task = createMockTask("Episodic Event", TaskType.EPISODIC);
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("repeat");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should return doc.text icon for unknown task types", () => {
      const task = createMockTask("Unknown Task", "UNKNOWN" as TaskType);
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("doc.text");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });
  });

  describe("priority handling", () => {
    it("should prioritize keywords over task type", () => {
      // Even though it's a SCHEDULED task, the "medication" keyword should take precedence
      const task = createMockTask("Medication Schedule", TaskType.SCHEDULED);
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("pills");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should use task type when no keywords match", () => {
      const task = createMockTask("Generic Task", TaskType.TIMED);
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("clock");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });
  });

  describe("edge cases", () => {
    it("should handle empty title", () => {
      const task = createMockTask("", TaskType.SCHEDULED);
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("calendar");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should handle null title", () => {
      const task = {
        ...createMockTask("", TaskType.SCHEDULED),
        title: null as any,
      };
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("calendar");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should handle undefined title", () => {
      const task = {
        ...createMockTask("", TaskType.SCHEDULED),
        title: undefined as any,
      };
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("calendar");
      expect(icon.color).toBe(AppColors.legacy.primary);
    });

    it("should handle tasks with multiple matching keywords (first match wins)", () => {
      // "medication" comes before "survey" in the function, so pills should win
      const task = createMockTask("Medication Survey");
      const icon = getTaskIcon(task);
      expect(icon.name).toBe("pills");
    });
  });
});
