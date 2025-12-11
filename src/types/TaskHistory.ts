export interface TaskHistory {
  id: string;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  status?: string | null;
  statusBeforeExpired?: string | null;
  timestamp?: string | null;
  action?: string | null;
  details?: string | null; // JSON string
  hashKey?: string | null;
  
  // DataStore fields
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
  _lastChangedAt?: number | null;
}

export interface CreateTaskHistoryInput {
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  status?: string | null;
  statusBeforeExpired?: string | null;
  timestamp?: string | null;
  action?: string | null;
  details?: string | null;
  hashKey?: string | null;
}

export interface UpdateTaskHistoryInput {
  id: string;
  taskInstanceId?: string | null;
  status?: string | null;
  statusBeforeExpired?: string | null;
  timestamp?: string | null;
  action?: string | null;
  details?: string | null;
  hashKey?: string | null;
}



