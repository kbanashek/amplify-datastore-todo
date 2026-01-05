import { defaultTempAnswersMapper } from "../tempAnswerDefaults";
import type { BuildSaveTempAnswersVariablesInput } from "@task-types/tempAnswerSync";
import type { Task } from "@task-types/Task";
import type { Activity } from "@task-types/Activity";

describe("defaultTempAnswersMapper", () => {
  const mockTask = {
    id: "task-123",
    pk: "TASK-TEST-1",
    sk: "TASK#2026-01-05",
    taskInstanceId: "instance-123",
    title: "Test Task",
    description: "Test Description",
    taskType: "SCHEDULED",
    status: "STARTED",
    showBeforeStart: false,
    allowEarlyCompletion: false,
    allowLateCompletion: false,
    allowLateEdits: false,
    syncState: 0,
    syncStateTaskAnswer: 0,
    syncStateTaskResult: 0,
  } as Task;

  const mockActivity = {
    id: "activity-123",
    pk: "ACTIVITY-TEST-1",
    sk: "ACTIVITY#2026-01-05",
    name: "Test Activity",
  } as Activity;

  it("should return correct structure with proper keys", () => {
    const input: BuildSaveTempAnswersVariablesInput = {
      task: mockTask,
      activity: mockActivity,
      answers: {
        question1: "answer1",
        question2: "answer2",
        question3: { nested: "object" },
      },
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const result = defaultTempAnswersMapper(input);
    expect(result).toBeDefined();

    expect(result).toEqual({
      stableKey: "TASK-TEST-1",
      variables: {
        taskPk: "TASK-TEST-1",
        activityId: "ACTIVITY-TEST-1",
        answers: JSON.stringify({
          question1: "answer1",
          question2: "answer2",
          question3: { nested: "object" },
        }),
        localtime: "2026-01-05T12:00:00.000Z",
      },
    });
  });

  it("should pass answers as object, not stringified", () => {
    const input: BuildSaveTempAnswersVariablesInput = {
      task: mockTask,
      activity: mockActivity,
      answers: { mp_q1: "Test 123", mp_q2: "Test 456" },
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const result = defaultTempAnswersMapper(input);
    expect(result).toBeDefined();

    // Critical: answers should be a JSON STRING (AWSJSON scalar requirement)
    expect(typeof result!.variables.answers).toBe("string");
    expect(result!.variables.answers).toBe(
      JSON.stringify({ mp_q1: "Test 123", mp_q2: "Test 456" })
    );

    // When parsed, it should be the correct object
    expect(JSON.parse(result!.variables.answers as string)).toEqual({
      mp_q1: "Test 123",
      mp_q2: "Test 456",
    });
  });

  it("should preserve question IDs as keys (not numeric)", () => {
    const input: BuildSaveTempAnswersVariablesInput = {
      task: mockTask,
      activity: mockActivity,
      answers: {
        "question-id-1": "value1",
        "question-id-2": "value2",
        nested_question: { subfield: "data" },
      },
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const result = defaultTempAnswersMapper(input);
    expect(result).toBeDefined();

    // Verify answers is a JSON string
    expect(typeof result!.variables.answers).toBe("string");

    // Parse it and verify keys are preserved exactly
    const parsedAnswers = JSON.parse(result!.variables.answers as string);
    const answerKeys = Object.keys(parsedAnswers);
    expect(answerKeys).toEqual([
      "question-id-1",
      "question-id-2",
      "nested_question",
    ]);

    // Verify no numeric keys (the corruption we were seeing)
    answerKeys.forEach(key => {
      expect(key).not.toMatch(/^\d+$/); // Should not be purely numeric
    });
  });

  it("should handle empty answers object", () => {
    const input: BuildSaveTempAnswersVariablesInput = {
      task: mockTask,
      activity: mockActivity,
      answers: {},
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const result = defaultTempAnswersMapper(input);
    expect(result).toBeDefined();

    expect(result!.variables.answers).toBe("{}");
    expect(typeof result!.variables.answers).toBe("string");
  });

  it("should handle complex nested answer structures", () => {
    const complexAnswers = {
      text_field: "simple string",
      number_field: 42,
      boolean_field: true,
      array_field: ["item1", "item2", "item3"],
      nested_object: {
        level1: {
          level2: {
            value: "deeply nested",
          },
        },
      },
      mixed_array: [
        { id: 1, label: "Option 1" },
        { id: 2, label: "Option 2" },
      ],
    };

    const input: BuildSaveTempAnswersVariablesInput = {
      task: mockTask,
      activity: mockActivity,
      answers: complexAnswers,
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const result = defaultTempAnswersMapper(input);
    expect(result).toBeDefined();

    // Verify answers is stringified
    expect(typeof result!.variables.answers).toBe("string");

    // Parse and verify structure is preserved exactly
    const parsed = JSON.parse(result!.variables.answers as string);
    expect(parsed).toEqual(complexAnswers);
    expect(parsed.nested_object.level1.level2.value).toBe("deeply nested");
  });

  it("should use activity.pk as activityId, fallback to activity.id", () => {
    const inputWithPk: BuildSaveTempAnswersVariablesInput = {
      task: mockTask,
      activity: { ...mockActivity, pk: "ACTIVITY-PK-123" },
      answers: { q1: "a1" },
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const resultWithPk = defaultTempAnswersMapper(inputWithPk);
    expect(resultWithPk).toBeDefined();
    expect(resultWithPk!.variables.activityId).toBe("ACTIVITY-PK-123");

    const inputWithoutPk: BuildSaveTempAnswersVariablesInput = {
      task: mockTask,
      activity: {
        ...mockActivity,
        pk: undefined as any,
        id: "ACTIVITY-ID-456",
      },
      answers: { q1: "a1" },
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const resultWithoutPk = defaultTempAnswersMapper(inputWithoutPk);
    expect(resultWithoutPk).toBeDefined();
    expect(resultWithoutPk!.variables.activityId).toBe("ACTIVITY-ID-456");
  });

  it("should use task.pk as stableKey for deduplication", () => {
    const input: BuildSaveTempAnswersVariablesInput = {
      task: { ...mockTask, pk: "UNIQUE-TASK-PK-789" },
      activity: mockActivity,
      answers: { q1: "a1" },
      localtime: "2026-01-05T12:00:00.000Z",
    };

    const result = defaultTempAnswersMapper(input);
    expect(result).toBeDefined();

    expect(result!.stableKey).toBe("UNIQUE-TASK-PK-789");
    expect(result!.variables.taskPk).toBe("UNIQUE-TASK-PK-789");
  });

  describe("serialization round-trip", () => {
    it("should survive JSON.stringify + JSON.parse without corruption", () => {
      const originalAnswers = {
        mp_q1: "Test 123",
        mp_q2: "Test 456",
        mp_q3: { nested: "value" },
      };

      const input: BuildSaveTempAnswersVariablesInput = {
        task: mockTask,
        activity: mockActivity,
        answers: originalAnswers,
        localtime: "2026-01-05T12:00:00.000Z",
      };

      const result = defaultTempAnswersMapper(input);
      expect(result).toBeDefined();

      // Mapper produces JSON string (AWSJSON requirement)
      expect(typeof result!.variables.answers).toBe("string");

      // VTL stores it as-is in DynamoDB (no additional serialization)
      const storedInDynamoDB = result!.variables.answers as string;

      // Simulate retrieval: parse once to get original object
      const retrieved = JSON.parse(storedInDynamoDB);

      // Verify no corruption occurred
      expect(retrieved).toEqual(originalAnswers);
      expect(Object.keys(retrieved)).toEqual(["mp_q1", "mp_q2", "mp_q3"]);

      // Verify keys are NOT numeric (the bug we fixed)
      Object.keys(retrieved).forEach(key => {
        expect(key).not.toMatch(/^\d+$/);
      });
    });

    it("should NOT have double-stringification issue", () => {
      const originalAnswers = { mp_q1: "Test Value" };

      const input: BuildSaveTempAnswersVariablesInput = {
        task: mockTask,
        activity: mockActivity,
        answers: originalAnswers,
        localtime: "2026-01-05T12:00:00.000Z",
      };

      const result = defaultTempAnswersMapper(input);
      expect(result).toBeDefined();

      // The mapper should return a JSON STRING (AWSJSON requirement)
      expect(typeof result!.variables.answers).toBe("string");
      expect(result!.variables.answers).toBe('{"mp_q1":"Test Value"}');

      // VTL stores it as-is (no additional serialization)
      const storedInDynamoDB = result!.variables.answers as string;

      // When retrieved and parsed once, we should get the original object
      const retrieved = JSON.parse(storedInDynamoDB);
      expect(retrieved).toEqual(originalAnswers);
      expect(typeof retrieved).toBe("object");
      expect(typeof retrieved.mp_q1).toBe("string");
      expect(retrieved.mp_q1).toBe("Test Value");

      // Verify NOT double-stringified (the bug we had)
      expect(storedInDynamoDB).not.toContain('\\"mp_q1\\"');
    });
  });
});
