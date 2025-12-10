// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const TaskType = {
  "SCHEDULED": "SCHEDULED",
  "TIMED": "TIMED",
  "EPISODIC": "EPISODIC"
};

const TaskStatus = {
  "OPEN": "OPEN",
  "VISIBLE": "VISIBLE",
  "STARTED": "STARTED",
  "INPROGRESS": "INPROGRESS",
  "COMPLETED": "COMPLETED",
  "EXPIRED": "EXPIRED",
  "RECALLED": "RECALLED"
};

const { Todo, Task } = initSchema(schema);

export {
  Todo,
  Task,
  TaskType,
  TaskStatus
};