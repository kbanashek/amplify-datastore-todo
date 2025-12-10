// Task type definitions matching the GraphQL schema
// These will be replaced by generated types once schema is deployed

export enum TaskType {
  SCHEDULED = 'SCHEDULED',
  TIMED = 'TIMED',
  EPISODIC = 'EPISODIC',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  VISIBLE = 'VISIBLE',
  STARTED = 'STARTED',
  INPROGRESS = 'INPROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  RECALLED = 'RECALLED',
}

export interface Task {
  id: string;
  // Core identifiers
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  
  // Content
  title: string;
  description?: string | null;
  
  // Timing
  startTime?: string | null;
  startTimeInMillSec?: number | null;
  expireTimeInMillSec?: number | null;
  endTimeInMillSec?: number | null;
  endTime?: string | null;
  dayOffset?: number | null;
  endDayOffset?: number | null;
  
  // Task Type
  taskType: TaskType;
  
  // Status
  status: TaskStatus;
  
  // Completion Rules
  showBeforeStart?: boolean | null;
  allowEarlyCompletion?: boolean | null;
  allowLateCompletion?: boolean | null;
  allowLateEdits?: boolean | null;
  
  // Anchors & Actions (stored as JSON strings)
  anchors?: string | null;
  anchorDayOffset?: number | null;
  actions?: string | null;
  
  // Activity Reference
  entityId?: string | null;
  activityIndex?: number | null;
  activityAnswer?: string | null;
  activityResponse?: string | null;
  
  // Sync State
  syncState?: number | null;
  syncStateTaskAnswer?: number | null;
  syncStateTaskResult?: number | null;
  syncStatus?: string | null;
  
  // Relationships
  hashKey?: string | null;
  occurrenceHashKey?: string | null;
  occurrenceParentHashKey?: string | null;
  parentTaskInstanceId?: string | null;
  tciSk?: string | null;
  
  // Study Information
  studyVersion?: string | null;
  studyStatus?: string | null;
  
  // DataStore fields
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
  _lastChangedAt?: number | null;
}

export interface CreateTaskInput {
  pk: string;
  sk: string;
  title: string;
  taskType: TaskType;
  status: TaskStatus;
  taskInstanceId?: string | null;
  description?: string | null;
  startTime?: string | null;
  startTimeInMillSec?: number | null;
  expireTimeInMillSec?: number | null;
  endTimeInMillSec?: number | null;
  endTime?: string | null;
  dayOffset?: number | null;
  endDayOffset?: number | null;
  showBeforeStart?: boolean | null;
  allowEarlyCompletion?: boolean | null;
  allowLateCompletion?: boolean | null;
  allowLateEdits?: boolean | null;
  anchors?: string | null;
  anchorDayOffset?: number | null;
  actions?: string | null;
  entityId?: string | null;
  activityIndex?: number | null;
  activityAnswer?: string | null;
  activityResponse?: string | null;
  syncState?: number | null;
  syncStateTaskAnswer?: number | null;
  syncStateTaskResult?: number | null;
  syncStatus?: string | null;
  hashKey?: string | null;
  occurrenceHashKey?: string | null;
  occurrenceParentHashKey?: string | null;
  parentTaskInstanceId?: string | null;
  tciSk?: string | null;
  studyVersion?: string | null;
  studyStatus?: string | null;
}

export interface UpdateTaskInput {
  id: string;
  pk?: string | null;
  sk?: string | null;
  title?: string | null;
  description?: string | null;
  taskInstanceId?: string | null;
  startTime?: string | null;
  startTimeInMillSec?: number | null;
  expireTimeInMillSec?: number | null;
  endTimeInMillSec?: number | null;
  endTime?: string | null;
  dayOffset?: number | null;
  endDayOffset?: number | null;
  taskType?: TaskType | null;
  status?: TaskStatus | null;
  showBeforeStart?: boolean | null;
  allowEarlyCompletion?: boolean | null;
  allowLateCompletion?: boolean | null;
  allowLateEdits?: boolean | null;
  anchors?: string | null;
  anchorDayOffset?: number | null;
  actions?: string | null;
  entityId?: string | null;
  activityIndex?: number | null;
  activityAnswer?: string | null;
  activityResponse?: string | null;
  syncState?: number | null;
  syncStateTaskAnswer?: number | null;
  syncStateTaskResult?: number | null;
  syncStatus?: string | null;
  hashKey?: string | null;
  occurrenceHashKey?: string | null;
  occurrenceParentHashKey?: string | null;
  parentTaskInstanceId?: string | null;
  tciSk?: string | null;
  studyVersion?: string | null;
  studyStatus?: string | null;
  _version?: number | null;
}

export interface TaskFilters {
  status?: TaskStatus[];
  taskType?: TaskType[];
  dateFrom?: Date;
  dateTo?: Date;
  searchText?: string;
}

