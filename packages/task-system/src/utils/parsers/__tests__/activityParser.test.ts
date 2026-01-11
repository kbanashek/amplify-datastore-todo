import { parseActivityConfig } from "@utils/parsers/activityParser";
import type { ActivityConfig } from "@task-types/ActivityConfig";

describe("parseActivityConfig", () => {
  it("does not crash when activityGroups is a single object (fixture/import shape) and maps element.id to question", () => {
    const cfg = {
      activityGroups: {
        id: "group-1",
        questions: [
          {
            id: "q1",
            type: "TEXT",
            text: "Question 1",
            friendlyName: "Question 1",
          },
        ],
      },
      screens: [
        {
          id: "screen-1",
          order: 0,
          elements: [{ id: "q1", order: 0 }],
        },
      ],
    } as unknown as ActivityConfig;

    const result = parseActivityConfig(cfg, {});

    expect(result.screens).toHaveLength(1);
    expect(result.screens[0].elements).toHaveLength(1);
    expect(result.screens[0].elements[0].question.id).toBe("q1");
    expect(result.questions.map(q => q.id)).toContain("q1");
  });

  it("does not crash when activityGroups is a JSON string of a single group", () => {
    const cfg = {
      activityGroups: JSON.stringify({
        id: "group-1",
        questions: [
          {
            id: "q1",
            type: "TEXT",
            text: "Question 1",
            friendlyName: "Question 1",
          },
        ],
      }),
      screens: [
        {
          id: "screen-1",
          order: 0,
          elements: [{ id: "q1", order: 0 }],
        },
      ],
    } as unknown as ActivityConfig;

    const result = parseActivityConfig(cfg, {});

    expect(result.screens[0].elements[0].question.id).toBe("q1");
  });
});
