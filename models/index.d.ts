import {
  ModelInit,
  MutableModel,
  __modelMeta__,
  ManagedIdentifier,
} from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

export enum TaskType {
  SCHEDULED = "SCHEDULED",
  TIMED = "TIMED",
  EPISODIC = "EPISODIC",
}

export enum TaskStatus {
  OPEN = "OPEN",
  VISIBLE = "VISIBLE",
  STARTED = "STARTED",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
  RECALLED = "RECALLED",
}

type EagerTodo = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Todo, "id">;
    readOnlyFields: "createdAt" | "updatedAt";
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyTodo = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Todo, "id">;
    readOnlyFields: "createdAt" | "updatedAt";
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type Todo = LazyLoading extends LazyLoadingDisabled
  ? EagerTodo
  : LazyTodo;

export declare const Todo: (new (init: ModelInit<Todo>) => Todo) & {
  copyOf(
    source: Todo,
    mutator: (draft: MutableModel<Todo>) => MutableModel<Todo> | void
  ): Todo;
};

type EagerTask = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Task, "id">;
    readOnlyFields: "createdAt" | "updatedAt";
  };
  readonly id: string;
  readonly pk: string;
  readonly sk: string;
  readonly taskInstanceId?: string | null;
  readonly title: string;
  readonly description?: string | null;
  readonly startTime?: string | null;
  readonly startTimeInMillSec?: number | null;
  readonly expireTimeInMillSec?: number | null;
  readonly endTimeInMillSec?: number | null;
  readonly endTime?: string | null;
  readonly dayOffset?: number | null;
  readonly endDayOffset?: number | null;
  readonly taskType: TaskType | keyof typeof TaskType;
  readonly status: TaskStatus | keyof typeof TaskStatus;
  readonly showBeforeStart?: boolean | null;
  readonly allowEarlyCompletion?: boolean | null;
  readonly allowLateCompletion?: boolean | null;
  readonly allowLateEdits?: boolean | null;
  readonly anchors?: string | null;
  readonly anchorDayOffset?: number | null;
  readonly actions?: string | null;
  readonly entityId?: string | null;
  readonly activityIndex?: number | null;
  readonly activityAnswer?: string | null;
  readonly activityResponse?: string | null;
  readonly syncState?: number | null;
  readonly syncStateTaskAnswer?: number | null;
  readonly syncStateTaskResult?: number | null;
  readonly syncStatus?: string | null;
  readonly hashKey?: string | null;
  readonly occurrenceHashKey?: string | null;
  readonly occurrenceParentHashKey?: string | null;
  readonly parentTaskInstanceId?: string | null;
  readonly tciSk?: string | null;
  readonly studyVersion?: string | null;
  readonly studyStatus?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyTask = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Task, "id">;
    readOnlyFields: "createdAt" | "updatedAt";
  };
  readonly id: string;
  readonly pk: string;
  readonly sk: string;
  readonly taskInstanceId?: string | null;
  readonly title: string;
  readonly description?: string | null;
  readonly startTime?: string | null;
  readonly startTimeInMillSec?: number | null;
  readonly expireTimeInMillSec?: number | null;
  readonly endTimeInMillSec?: number | null;
  readonly endTime?: string | null;
  readonly dayOffset?: number | null;
  readonly endDayOffset?: number | null;
  readonly taskType: TaskType | keyof typeof TaskType;
  readonly status: TaskStatus | keyof typeof TaskStatus;
  readonly showBeforeStart?: boolean | null;
  readonly allowEarlyCompletion?: boolean | null;
  readonly allowLateCompletion?: boolean | null;
  readonly allowLateEdits?: boolean | null;
  readonly anchors?: string | null;
  readonly anchorDayOffset?: number | null;
  readonly actions?: string | null;
  readonly entityId?: string | null;
  readonly activityIndex?: number | null;
  readonly activityAnswer?: string | null;
  readonly activityResponse?: string | null;
  readonly syncState?: number | null;
  readonly syncStateTaskAnswer?: number | null;
  readonly syncStateTaskResult?: number | null;
  readonly syncStatus?: string | null;
  readonly hashKey?: string | null;
  readonly occurrenceHashKey?: string | null;
  readonly occurrenceParentHashKey?: string | null;
  readonly parentTaskInstanceId?: string | null;
  readonly tciSk?: string | null;
  readonly studyVersion?: string | null;
  readonly studyStatus?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type Task = LazyLoading extends LazyLoadingDisabled
  ? EagerTask
  : LazyTask;

export declare const Task: (new (init: ModelInit<Task>) => Task) & {
  copyOf(
    source: Task,
    mutator: (draft: MutableModel<Task>) => MutableModel<Task> | void
  ): Task;
};
