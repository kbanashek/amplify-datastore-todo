export interface TaskResult {
  id: string;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  status?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
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

export interface CreateTaskResultInput {
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  status?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  hashKey?: string | null;
}

export interface UpdateTaskResultInput {
  id: string;
  taskInstanceId?: string | null;
  status?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;
}


