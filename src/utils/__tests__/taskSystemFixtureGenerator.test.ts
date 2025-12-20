import { buildTaskSystemFixtureV1 } from "../taskSystemFixtureGenerator";

describe("buildTaskSystemFixtureV1", () => {
  it("builds a deterministic v1 fixture with absolute timestamps", () => {
    const baseDate = new Date(2025, 11, 19, 13, 37, 0, 0); // local time

    const fixture = buildTaskSystemFixtureV1({
      fixtureId: "test-fixture",
      baseDate,
      allTypesHour: 8,
    });

    expect(fixture.version).toBe(1);
    expect(fixture.fixtureId).toBe("test-fixture");
    expect(fixture.activities.length).toBe(1);
    expect(fixture.tasks.length).toBe(10);

    const task = fixture.tasks[0] as any;
    expect(task.pk).toBe("TASK-ALL-TYPES-FIXTURE-1");
    expect(task.entityId).toBe("ACTIVITY-ALL-TYPES-FIXTURE-1");

    // 8:00–8:30 AM local on 2025-12-19
    expect(task.startTimeInMillSec).toBe(
      new Date(2025, 11, 19, 8, 0, 0, 0).getTime()
    );
    expect(task.expireTimeInMillSec).toBe(
      new Date(2025, 11, 19, 8, 30, 0, 0).getTime()
    );
  });
});
