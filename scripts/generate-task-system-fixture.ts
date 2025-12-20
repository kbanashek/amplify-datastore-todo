import fs from "node:fs";
import path from "node:path";

import { buildTaskSystemFixtureV1 } from "../src/utils/taskSystemFixtureGenerator";

const repoRoot = path.resolve(__dirname, "..");
const outPath = path.join(repoRoot, "src/fixtures/task-system.fixture.v1.json");

const today = new Date();
today.setHours(0, 0, 0, 0);

const fixture = buildTaskSystemFixtureV1({
  fixtureId: "generated-all-question-types",
  baseDate: today,
  allTypesHour: 8,
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

// eslint-disable-next-line no-console
console.log(`[generate-task-system-fixture] wrote ${outPath}`);
