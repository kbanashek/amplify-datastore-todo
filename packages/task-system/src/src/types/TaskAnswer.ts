export interface TaskAnswer {
  id: string;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  activityId?: string | null;
  questionId?: string | null;
  answer?: string | null; // JSON string of answer data
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;

  // DataStore fields
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
  _lastChangedAt?: number | null;
}

export interface CreateTaskAnswerInput {
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  activityId?: string | null;
  questionId?: string | null;
  answer?: string | null;
  hashKey?: string | null;
}

export interface UpdateTaskAnswerInput {
  id: string;
  taskInstanceId?: string | null;
  activityId?: string | null;
  questionId?: string | null;
  answer?: string | null;
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;
}
