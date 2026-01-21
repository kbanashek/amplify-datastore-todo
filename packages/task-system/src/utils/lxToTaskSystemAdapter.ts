/**
 * Adapter utility to transform LX's GraphQL getTasks response into TaskSystemFixture format.
 *
 * This enables validation that task-system can render the same tasks LX uses in production.
 */

import type { TaskSystemFixture } from "@task-types/../fixtures/TaskSystemFixture";
import type { CreateTaskInput } from "@task-types/Task";
import { TaskStatus, TaskType } from "@task-types/Task";

/**
 * LX GraphQL getTasks response structure
 */
export interface LXGetTasksResponse {
  data: {
    getTasks: {
      date: string;
      dayOffset: number;
      tasks: LXTask[];
    }[];
  };
}

/**
 * LX Task structure from GraphQL API
 */
export interface LXTask {
  pk: string;
  sk: string;
  title: string;
  taskType: string;
  status?: string;
  description?: string | null;
  taskInstanceId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  dayOffset?: number | null;
  endDayOffset?: number | null;
  showBeforeStart?: boolean | null;
  allowEarlyCompletion?: boolean | null;
  allowLateCompletion?: boolean | null;
  allowLateEdits?: boolean | null;
  anchors?: unknown[] | string | null;
  anchorDayOffset?: number | null;
  actions?: unknown[] | string | null;
  hashKey?: string | null;
  occurrenceHashKey?: string | null;
  occurrenceParentHashKey?: string | null;
  parentTaskInstanceId?: string | null;
  tci?: {
    pk?: string;
    sk?: string;
    parentTaskInstanceId?: string;
    rescheduled?: number;
    canMoveSeriesWithVisit?: boolean;
    canRecall?: boolean;
  } | null;
  etci?: {
    pk?: string;
    startedBy?: string;
    startedAt?: string;
    startedByEvent?: string;
    endedAt?: string;
    endedBy?: string;
    endedByEvent?: string;
    latestTriggerAt?: string;
  } | null;
  rules?: unknown[] | string | null;
  isArchived?: boolean | null;
  isHidden?: boolean | null;
  isTranscribable?: boolean | null;
  systemName?: string | null;
  canRecall?: boolean | null;
  noEndTime?: boolean | null;
  taskTemplateId?: string | null;
  taskDefinitionId?: string | null;
  data?: string | null;
  icon?: string | null;
  offset?: number | null;
  endAfter?: number | null;
  activityAnswer?: string | null;
  activityResponse?: string | null;
  expireTimeInMillSec?: number | null;
  expireDate?: string | Date | null;
}

/**
 * Options for the adapter
 */
export interface LXToTaskSystemAdapterOptions {
  studyVersion?: string;
  studyStatus?: string;
  fixtureId?: string;
}

/**
 * Transform LX's GraphQL getTasks response into TaskSystemFixture format.
 *
 * @param lxResponse - The raw GraphQL response from LX's getTasks API
 * @param options - Optional configuration for the transformation
 * @returns A TaskSystemFixture ready for import into task-system
 *
 * @example
 * ```typescript
 * const lxResponse = await APIDataManager.getInstance().getTasks(...);
 * const fixture = lxToTaskSystemAdapter(lxResponse, {
 *   studyVersion: "1.0",
 *   studyStatus: "LIVE",
 *   fixtureId: "lx-production-2025-01-20"
 * });
 * await importTaskSystemFixture(fixture);
 * ```
 */
export const lxToTaskSystemAdapter = (
  lxResponse: LXGetTasksResponse,
  options: LXToTaskSystemAdapterOptions = {}
): TaskSystemFixture => {
  const { studyVersion = "1.0", studyStatus = "LIVE", fixtureId } = options;

  // Flatten all tasks from all dates into a single array
  const allTasks: CreateTaskInput[] = [];

  lxResponse.data.getTasks.forEach((taskGroup) => {
    taskGroup.tasks.forEach((lxTask) => {
      const transformedTask = transformLXTask(lxTask, studyVersion, studyStatus);
      allTasks.push(transformedTask);
    });
  });

  return {
    version: 1,
    fixtureId,
    activities: [], // LX activities would need separate transformation
    tasks: allTasks,
    questions: [],
    appointments: undefined,
  };
};

/**
 * Transform a single LX task into CreateTaskInput format.
 *
 * @param lxTask - The LX task object from GraphQL
 * @param studyVersion - Study version to assign
 * @param studyStatus - Study status to assign
 * @returns CreateTaskInput ready for DataStore
 */
const transformLXTask = (
  lxTask: LXTask,
  studyVersion: string,
  studyStatus: string
): CreateTaskInput => {
  // Convert actions array to JSON string if needed
  let actionsStr: string | null = null;
  let entityId: string | null = null;
  let hashKey: string | null = lxTask.hashKey ?? null;

  if (lxTask.actions) {
    if (Array.isArray(lxTask.actions)) {
      actionsStr = JSON.stringify(lxTask.actions);
      // Extract entityId from actions[0].entityId
      if (lxTask.actions.length > 0) {
        const firstAction = lxTask.actions[0] as { [key: string]: unknown };
        if (firstAction?.entityId && typeof firstAction.entityId === "string") {
          entityId = firstAction.entityId;
        }
        // Extract hashKey from actions[0].ref.hashKey if not already set
        if (!hashKey && firstAction?.ref && typeof firstAction.ref === "object") {
          const ref = firstAction.ref as { [key: string]: unknown };
          if (ref?.hashKey && typeof ref.hashKey === "string") {
            hashKey = ref.hashKey;
          }
        }
      }
    } else if (typeof lxTask.actions === "string") {
      actionsStr = lxTask.actions;
      // Try to parse to extract entityId and hashKey
      try {
        const parsed = JSON.parse(lxTask.actions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstAction = parsed[0] as { [key: string]: unknown };
          if (firstAction?.entityId && typeof firstAction.entityId === "string") {
            entityId = firstAction.entityId;
          }
          if (!hashKey && firstAction?.ref && typeof firstAction.ref === "object") {
            const ref = firstAction.ref as { [key: string]: unknown };
            if (ref?.hashKey && typeof ref.hashKey === "string") {
              hashKey = ref.hashKey;
            }
          }
        }
      } catch {
        // Invalid JSON, keep as-is
      }
    }
  }

  // Convert anchors array to JSON string if needed
  let anchorsStr: string | null = null;
  if (lxTask.anchors) {
    if (Array.isArray(lxTask.anchors)) {
      anchorsStr = JSON.stringify(lxTask.anchors);
    } else if (typeof lxTask.anchors === "string") {
      anchorsStr = lxTask.anchors;
    }
  }

  // Compute millisecond timestamps
  let startTimeInMillSec: number | null = null;
  if (lxTask.startTime) {
    try {
      const timestamp = new Date(lxTask.startTime).getTime();
      // Check for NaN (invalid date)
      startTimeInMillSec = isNaN(timestamp) ? null : timestamp;
    } catch {
      // Invalid date, leave as null
    }
  }

  let endTimeInMillSec: number | null = null;
  if (lxTask.endTime) {
    try {
      const timestamp = new Date(lxTask.endTime).getTime();
      // Check for NaN (invalid date)
      endTimeInMillSec = isNaN(timestamp) ? null : timestamp;
    } catch {
      // Invalid date, leave as null
    }
  }

  // Use LX's expireTimeInMillSec if available, otherwise compute from expireDate
  // Note: expireTimeInMillSec: 0 is allowed for episodic tasks
  let expireTimeInMillSec: number | null = null;
  if (typeof lxTask.expireTimeInMillSec === 'number') {
    expireTimeInMillSec = lxTask.expireTimeInMillSec;
  } else if (lxTask.expireDate) {
    try {
      const timestamp = new Date(lxTask.expireDate).getTime();
      expireTimeInMillSec = isNaN(timestamp) ? null : timestamp;
    } catch {
      // Invalid date, leave as null
    }
  }

  // Extract tciSk from tci object
  const tciSk = lxTask.tci?.sk ?? null;

  // Normalize task type - respect the original taskType from LX data
  const taskType = normalizeTaskType(lxTask.taskType);

  // Log episodic task detection for debugging
  const isEpisodic = taskType === TaskType.EPISODIC || String(taskType).toUpperCase() === 'EPISODIC';
  
  if (isEpisodic) {
    console.warn('[lxToTaskSystemAdapter] ✅ Episodic task detected', {
      title: lxTask.title,
      taskType: lxTask.taskType,
      normalizedTaskType: taskType,
      expireTimeInMillSec,
      pk: lxTask.pk,
    });
  }

  // Normalize status
  const status = normalizeTaskStatus(lxTask.status);

  return {
    pk: lxTask.pk,
    sk: lxTask.sk,
    title: lxTask.title,
    taskType,
    status,
    description: lxTask.description ?? null,
    taskInstanceId: lxTask.taskInstanceId ?? null,
    startTime: lxTask.startTime ?? null,
    startTimeInMillSec,
    endTime: lxTask.endTime ?? null,
    endTimeInMillSec,
    expireTimeInMillSec,
    dayOffset: lxTask.dayOffset ?? null,
    endDayOffset: lxTask.endDayOffset ?? null,
    showBeforeStart: lxTask.showBeforeStart ?? null,
    allowEarlyCompletion: lxTask.allowEarlyCompletion ?? null,
    allowLateCompletion: lxTask.allowLateCompletion ?? null,
    allowLateEdits: lxTask.allowLateEdits ?? null,
    anchors: anchorsStr,
    anchorDayOffset: lxTask.anchorDayOffset ?? null,
    actions: actionsStr,
    entityId,
    activityIndex: null, // Not provided by LX
    activityAnswer: lxTask.activityAnswer ?? null,
    activityResponse: lxTask.activityResponse ?? null,
    syncState: null, // Will be set by DataStore
    syncStateTaskAnswer: null,
    syncStateTaskResult: null,
    syncStatus: null,
    hashKey,
    occurrenceHashKey: lxTask.occurrenceHashKey ?? null,
    occurrenceParentHashKey: lxTask.occurrenceParentHashKey ?? null,
    parentTaskInstanceId: lxTask.parentTaskInstanceId ?? null,
    tciSk,
    studyVersion,
    studyStatus,
  };
};

/**
 * Normalize LX task type to TaskType enum.
 */
const normalizeTaskType = (taskType: string): TaskType => {
  const upperType = taskType.toUpperCase();
  if (upperType === "SCHEDULED") return TaskType.SCHEDULED;
  if (upperType === "TIMED") return TaskType.TIMED;
  if (upperType === "EPISODIC") return TaskType.EPISODIC;
  // Default to SCHEDULED if unknown
  return TaskType.SCHEDULED;
};

/**
 * Normalize LX task status to TaskStatus enum.
 */
const normalizeTaskStatus = (status?: string): TaskStatus => {
  if (!status) return TaskStatus.OPEN;
  const upperStatus = status.toUpperCase();
  if (upperStatus === "OPEN") return TaskStatus.OPEN;
  if (upperStatus === "VISIBLE") return TaskStatus.VISIBLE;
  if (upperStatus === "STARTED") return TaskStatus.STARTED;
  if (upperStatus === "INPROGRESS") return TaskStatus.INPROGRESS;
  if (upperStatus === "COMPLETED") return TaskStatus.COMPLETED;
  if (upperStatus === "EXPIRED") return TaskStatus.EXPIRED;
  if (upperStatus === "RECALLED") return TaskStatus.RECALLED;
  // Default to OPEN if unknown
  return TaskStatus.OPEN;
};
