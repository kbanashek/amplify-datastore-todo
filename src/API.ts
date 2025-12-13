/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTodoInput = {
  id?: string | null;
  name: string;
  description?: string | null;
  _version?: number | null;
};

export type ModelTodoConditionInput = {
  name?: ModelStringInput | null;
  description?: ModelStringInput | null;
  and?: Array<ModelTodoConditionInput | null> | null;
  or?: Array<ModelTodoConditionInput | null> | null;
  not?: ModelTodoConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type ModelStringInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  size?: ModelSizeInput | null;
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}

export type ModelSizeInput = {
  ne?: number | null;
  eq?: number | null;
  le?: number | null;
  lt?: number | null;
  ge?: number | null;
  gt?: number | null;
  between?: Array<number | null> | null;
};

export type ModelBooleanInput = {
  ne?: boolean | null;
  eq?: boolean | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
};

export type Todo = {
  __typename: "Todo";
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateTodoInput = {
  id: string;
  name?: string | null;
  description?: string | null;
  _version?: number | null;
};

export type DeleteTodoInput = {
  id: string;
  _version?: number | null;
};

export type CreateTaskInput = {
  id?: string | null;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  title: string;
  description?: string | null;
  startTime?: string | null;
  startTimeInMillSec?: number | null;
  expireTimeInMillSec?: number | null;
  endTimeInMillSec?: number | null;
  endTime?: string | null;
  dayOffset?: number | null;
  endDayOffset?: number | null;
  taskType: TaskType;
  status: TaskStatus;
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
};

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

export type ModelTaskConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  title?: ModelStringInput | null;
  description?: ModelStringInput | null;
  startTime?: ModelStringInput | null;
  startTimeInMillSec?: ModelIntInput | null;
  expireTimeInMillSec?: ModelIntInput | null;
  endTimeInMillSec?: ModelIntInput | null;
  endTime?: ModelStringInput | null;
  dayOffset?: ModelIntInput | null;
  endDayOffset?: ModelIntInput | null;
  taskType?: ModelTaskTypeInput | null;
  status?: ModelTaskStatusInput | null;
  showBeforeStart?: ModelBooleanInput | null;
  allowEarlyCompletion?: ModelBooleanInput | null;
  allowLateCompletion?: ModelBooleanInput | null;
  allowLateEdits?: ModelBooleanInput | null;
  anchors?: ModelStringInput | null;
  anchorDayOffset?: ModelIntInput | null;
  actions?: ModelStringInput | null;
  entityId?: ModelStringInput | null;
  activityIndex?: ModelIntInput | null;
  activityAnswer?: ModelStringInput | null;
  activityResponse?: ModelStringInput | null;
  syncState?: ModelIntInput | null;
  syncStateTaskAnswer?: ModelIntInput | null;
  syncStateTaskResult?: ModelIntInput | null;
  syncStatus?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  occurrenceHashKey?: ModelStringInput | null;
  occurrenceParentHashKey?: ModelStringInput | null;
  parentTaskInstanceId?: ModelStringInput | null;
  tciSk?: ModelStringInput | null;
  studyVersion?: ModelStringInput | null;
  studyStatus?: ModelStringInput | null;
  and?: Array<ModelTaskConditionInput | null> | null;
  or?: Array<ModelTaskConditionInput | null> | null;
  not?: ModelTaskConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type ModelIntInput = {
  ne?: number | null;
  eq?: number | null;
  le?: number | null;
  lt?: number | null;
  ge?: number | null;
  gt?: number | null;
  between?: Array<number | null> | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
};

export type ModelTaskTypeInput = {
  eq?: TaskType | null;
  ne?: TaskType | null;
};

export type ModelTaskStatusInput = {
  eq?: TaskStatus | null;
  ne?: TaskStatus | null;
};

export type Task = {
  __typename: "Task";
  id: string;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  title: string;
  description?: string | null;
  startTime?: string | null;
  startTimeInMillSec?: number | null;
  expireTimeInMillSec?: number | null;
  endTimeInMillSec?: number | null;
  endTime?: string | null;
  dayOffset?: number | null;
  endDayOffset?: number | null;
  taskType: TaskType;
  status: TaskStatus;
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
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateTaskInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  taskInstanceId?: string | null;
  title?: string | null;
  description?: string | null;
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
};

export type DeleteTaskInput = {
  id: string;
  _version?: number | null;
};

export type CreateQuestionInput = {
  id?: string | null;
  pk: string;
  sk: string;
  question: string;
  questionId: string;
  questionText?: string | null;
  questionEnText?: string | null;
  friendlyName: string;
  answer?: string | null;
  controlType: string;
  type?: string | null;
  validations?: string | null;
  codedSelection?: string | null;
  answerId?: string | null;
  answersValue?: string | null;
  answerEnText?: string | null;
  answerCodedValue?: string | null;
  answersImages?: string | null;
  value?: string | null;
  codedValue?: number | null;
  imageS3Key?: string | null;
  multiSelectOverride?: string | null;
  version: number;
  index: number;
  _version?: number | null;
};

export type ModelQuestionConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  question?: ModelStringInput | null;
  questionId?: ModelStringInput | null;
  questionText?: ModelStringInput | null;
  questionEnText?: ModelStringInput | null;
  friendlyName?: ModelStringInput | null;
  answer?: ModelStringInput | null;
  controlType?: ModelStringInput | null;
  type?: ModelStringInput | null;
  validations?: ModelStringInput | null;
  codedSelection?: ModelStringInput | null;
  answerId?: ModelStringInput | null;
  answersValue?: ModelStringInput | null;
  answerEnText?: ModelStringInput | null;
  answerCodedValue?: ModelStringInput | null;
  answersImages?: ModelStringInput | null;
  value?: ModelStringInput | null;
  codedValue?: ModelIntInput | null;
  imageS3Key?: ModelStringInput | null;
  multiSelectOverride?: ModelStringInput | null;
  version?: ModelIntInput | null;
  index?: ModelIntInput | null;
  and?: Array<ModelQuestionConditionInput | null> | null;
  or?: Array<ModelQuestionConditionInput | null> | null;
  not?: ModelQuestionConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type Question = {
  __typename: "Question";
  id: string;
  pk: string;
  sk: string;
  question: string;
  questionId: string;
  questionText?: string | null;
  questionEnText?: string | null;
  friendlyName: string;
  answer?: string | null;
  controlType: string;
  type?: string | null;
  validations?: string | null;
  codedSelection?: string | null;
  answerId?: string | null;
  answersValue?: string | null;
  answerEnText?: string | null;
  answerCodedValue?: string | null;
  answersImages?: string | null;
  value?: string | null;
  codedValue?: number | null;
  imageS3Key?: string | null;
  multiSelectOverride?: string | null;
  version: number;
  index: number;
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateQuestionInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  question?: string | null;
  questionId?: string | null;
  questionText?: string | null;
  questionEnText?: string | null;
  friendlyName?: string | null;
  answer?: string | null;
  controlType?: string | null;
  type?: string | null;
  validations?: string | null;
  codedSelection?: string | null;
  answerId?: string | null;
  answersValue?: string | null;
  answerEnText?: string | null;
  answerCodedValue?: string | null;
  answersImages?: string | null;
  value?: string | null;
  codedValue?: number | null;
  imageS3Key?: string | null;
  multiSelectOverride?: string | null;
  version?: number | null;
  index?: number | null;
  _version?: number | null;
};

export type DeleteQuestionInput = {
  id: string;
  _version?: number | null;
};

export type CreateActivityInput = {
  id?: string | null;
  pk: string;
  sk: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  activityGroups?: string | null;
  layouts?: string | null;
  rules?: string | null;
  resumable?: boolean | null;
  transcribable?: boolean | null;
  respondentType?: string | null;
  progressBar?: boolean | null;
  displayHistoryDetail?: string | null;
  fontFamily?: string | null;
  fontWeight?: number | null;
  fontColor?: string | null;
  fontSize?: number | null;
  lineHeight?: string | null;
  s3Files?: string | null;
  externalContent?: string | null;
  calculatedValues?: string | null;
  _version?: number | null;
};

export type ModelActivityConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  name?: ModelStringInput | null;
  title?: ModelStringInput | null;
  description?: ModelStringInput | null;
  type?: ModelStringInput | null;
  activityGroups?: ModelStringInput | null;
  layouts?: ModelStringInput | null;
  rules?: ModelStringInput | null;
  resumable?: ModelBooleanInput | null;
  transcribable?: ModelBooleanInput | null;
  respondentType?: ModelStringInput | null;
  progressBar?: ModelBooleanInput | null;
  displayHistoryDetail?: ModelStringInput | null;
  fontFamily?: ModelStringInput | null;
  fontWeight?: ModelIntInput | null;
  fontColor?: ModelStringInput | null;
  fontSize?: ModelIntInput | null;
  lineHeight?: ModelStringInput | null;
  s3Files?: ModelStringInput | null;
  externalContent?: ModelStringInput | null;
  calculatedValues?: ModelStringInput | null;
  and?: Array<ModelActivityConditionInput | null> | null;
  or?: Array<ModelActivityConditionInput | null> | null;
  not?: ModelActivityConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type Activity = {
  __typename: "Activity";
  id: string;
  pk: string;
  sk: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  activityGroups?: string | null;
  layouts?: string | null;
  rules?: string | null;
  resumable?: boolean | null;
  transcribable?: boolean | null;
  respondentType?: string | null;
  progressBar?: boolean | null;
  displayHistoryDetail?: string | null;
  fontFamily?: string | null;
  fontWeight?: number | null;
  fontColor?: string | null;
  fontSize?: number | null;
  lineHeight?: string | null;
  s3Files?: string | null;
  externalContent?: string | null;
  calculatedValues?: string | null;
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateActivityInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  activityGroups?: string | null;
  layouts?: string | null;
  rules?: string | null;
  resumable?: boolean | null;
  transcribable?: boolean | null;
  respondentType?: string | null;
  progressBar?: boolean | null;
  displayHistoryDetail?: string | null;
  fontFamily?: string | null;
  fontWeight?: number | null;
  fontColor?: string | null;
  fontSize?: number | null;
  lineHeight?: string | null;
  s3Files?: string | null;
  externalContent?: string | null;
  calculatedValues?: string | null;
  _version?: number | null;
};

export type DeleteActivityInput = {
  id: string;
  _version?: number | null;
};

export type CreateDataPointInput = {
  id?: string | null;
  pk: string;
  sk: string;
  dataPointKey?: string | null;
  type?: string | null;
  anchors?: string | null;
  _version?: number | null;
};

export type ModelDataPointConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  dataPointKey?: ModelStringInput | null;
  type?: ModelStringInput | null;
  anchors?: ModelStringInput | null;
  and?: Array<ModelDataPointConditionInput | null> | null;
  or?: Array<ModelDataPointConditionInput | null> | null;
  not?: ModelDataPointConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type DataPoint = {
  __typename: "DataPoint";
  id: string;
  pk: string;
  sk: string;
  dataPointKey?: string | null;
  type?: string | null;
  anchors?: string | null;
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateDataPointInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  dataPointKey?: string | null;
  type?: string | null;
  anchors?: string | null;
  _version?: number | null;
};

export type DeleteDataPointInput = {
  id: string;
  _version?: number | null;
};

export type CreateDataPointInstanceInput = {
  id?: string | null;
  pk: string;
  sk: string;
  dataPointKey?: string | null;
  type?: string | null;
  studyId?: string | null;
  patientId?: string | null;
  hashKey?: string | null;
  armId?: string | null;
  eventGroupId?: string | null;
  eventId?: string | null;
  activityGroupId?: string | null;
  activityId?: string | null;
  eventDayOffset?: number | null;
  eventTime?: string | null;
  questionId?: string | null;
  answers?: string | null;
  _version?: number | null;
};

export type ModelDataPointInstanceConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  dataPointKey?: ModelStringInput | null;
  type?: ModelStringInput | null;
  studyId?: ModelStringInput | null;
  patientId?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  armId?: ModelStringInput | null;
  eventGroupId?: ModelStringInput | null;
  eventId?: ModelStringInput | null;
  activityGroupId?: ModelStringInput | null;
  activityId?: ModelStringInput | null;
  eventDayOffset?: ModelIntInput | null;
  eventTime?: ModelStringInput | null;
  questionId?: ModelStringInput | null;
  answers?: ModelStringInput | null;
  and?: Array<ModelDataPointInstanceConditionInput | null> | null;
  or?: Array<ModelDataPointInstanceConditionInput | null> | null;
  not?: ModelDataPointInstanceConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type DataPointInstance = {
  __typename: "DataPointInstance";
  id: string;
  pk: string;
  sk: string;
  dataPointKey?: string | null;
  type?: string | null;
  studyId?: string | null;
  patientId?: string | null;
  hashKey?: string | null;
  armId?: string | null;
  eventGroupId?: string | null;
  eventId?: string | null;
  activityGroupId?: string | null;
  activityId?: string | null;
  eventDayOffset?: number | null;
  eventTime?: string | null;
  questionId?: string | null;
  answers?: string | null;
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateDataPointInstanceInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  dataPointKey?: string | null;
  type?: string | null;
  studyId?: string | null;
  patientId?: string | null;
  hashKey?: string | null;
  armId?: string | null;
  eventGroupId?: string | null;
  eventId?: string | null;
  activityGroupId?: string | null;
  activityId?: string | null;
  eventDayOffset?: number | null;
  eventTime?: string | null;
  questionId?: string | null;
  answers?: string | null;
  _version?: number | null;
};

export type DeleteDataPointInstanceInput = {
  id: string;
  _version?: number | null;
};

export type CreateTaskAnswerInput = {
  id?: string | null;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  activityId?: string | null;
  questionId?: string | null;
  answer?: string | null;
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;
  _version?: number | null;
};

export type ModelTaskAnswerConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  activityId?: ModelStringInput | null;
  questionId?: ModelStringInput | null;
  answer?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  syncState?: ModelIntInput | null;
  syncStatus?: ModelStringInput | null;
  and?: Array<ModelTaskAnswerConditionInput | null> | null;
  or?: Array<ModelTaskAnswerConditionInput | null> | null;
  not?: ModelTaskAnswerConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type TaskAnswer = {
  __typename: "TaskAnswer";
  id: string;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  activityId?: string | null;
  questionId?: string | null;
  answer?: string | null;
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateTaskAnswerInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  taskInstanceId?: string | null;
  activityId?: string | null;
  questionId?: string | null;
  answer?: string | null;
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;
  _version?: number | null;
};

export type DeleteTaskAnswerInput = {
  id: string;
  _version?: number | null;
};

export type CreateTaskResultInput = {
  id?: string | null;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  status?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;
  _version?: number | null;
};

export type ModelTaskResultConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  status?: ModelStringInput | null;
  startedAt?: ModelStringInput | null;
  completedAt?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  syncState?: ModelIntInput | null;
  syncStatus?: ModelStringInput | null;
  and?: Array<ModelTaskResultConditionInput | null> | null;
  or?: Array<ModelTaskResultConditionInput | null> | null;
  not?: ModelTaskResultConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type TaskResult = {
  __typename: "TaskResult";
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
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateTaskResultInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  taskInstanceId?: string | null;
  status?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  hashKey?: string | null;
  syncState?: number | null;
  syncStatus?: string | null;
  _version?: number | null;
};

export type DeleteTaskResultInput = {
  id: string;
  _version?: number | null;
};

export type CreateTaskHistoryInput = {
  id?: string | null;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  status?: string | null;
  statusBeforeExpired?: string | null;
  timestamp?: string | null;
  action?: string | null;
  details?: string | null;
  hashKey?: string | null;
  _version?: number | null;
};

export type ModelTaskHistoryConditionInput = {
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  status?: ModelStringInput | null;
  statusBeforeExpired?: ModelStringInput | null;
  timestamp?: ModelStringInput | null;
  action?: ModelStringInput | null;
  details?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  and?: Array<ModelTaskHistoryConditionInput | null> | null;
  or?: Array<ModelTaskHistoryConditionInput | null> | null;
  not?: ModelTaskHistoryConditionInput | null;
  _deleted?: ModelBooleanInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type TaskHistory = {
  __typename: "TaskHistory";
  id: string;
  pk: string;
  sk: string;
  taskInstanceId?: string | null;
  status?: string | null;
  statusBeforeExpired?: string | null;
  timestamp?: string | null;
  action?: string | null;
  details?: string | null;
  hashKey?: string | null;
  createdAt: string;
  updatedAt: string;
  _version: number;
  _deleted?: boolean | null;
  _lastChangedAt: number;
};

export type UpdateTaskHistoryInput = {
  id: string;
  pk?: string | null;
  sk?: string | null;
  taskInstanceId?: string | null;
  status?: string | null;
  statusBeforeExpired?: string | null;
  timestamp?: string | null;
  action?: string | null;
  details?: string | null;
  hashKey?: string | null;
  _version?: number | null;
};

export type DeleteTaskHistoryInput = {
  id: string;
  _version?: number | null;
};

export type ModelTodoFilterInput = {
  id?: ModelIDInput | null;
  name?: ModelStringInput | null;
  description?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelTodoFilterInput | null> | null;
  or?: Array<ModelTodoFilterInput | null> | null;
  not?: ModelTodoFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelIDInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  size?: ModelSizeInput | null;
};

export type ModelTodoConnection = {
  __typename: "ModelTodoConnection";
  items: Array<Todo | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelTaskFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  title?: ModelStringInput | null;
  description?: ModelStringInput | null;
  startTime?: ModelStringInput | null;
  startTimeInMillSec?: ModelIntInput | null;
  expireTimeInMillSec?: ModelIntInput | null;
  endTimeInMillSec?: ModelIntInput | null;
  endTime?: ModelStringInput | null;
  dayOffset?: ModelIntInput | null;
  endDayOffset?: ModelIntInput | null;
  taskType?: ModelTaskTypeInput | null;
  status?: ModelTaskStatusInput | null;
  showBeforeStart?: ModelBooleanInput | null;
  allowEarlyCompletion?: ModelBooleanInput | null;
  allowLateCompletion?: ModelBooleanInput | null;
  allowLateEdits?: ModelBooleanInput | null;
  anchors?: ModelStringInput | null;
  anchorDayOffset?: ModelIntInput | null;
  actions?: ModelStringInput | null;
  entityId?: ModelStringInput | null;
  activityIndex?: ModelIntInput | null;
  activityAnswer?: ModelStringInput | null;
  activityResponse?: ModelStringInput | null;
  syncState?: ModelIntInput | null;
  syncStateTaskAnswer?: ModelIntInput | null;
  syncStateTaskResult?: ModelIntInput | null;
  syncStatus?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  occurrenceHashKey?: ModelStringInput | null;
  occurrenceParentHashKey?: ModelStringInput | null;
  parentTaskInstanceId?: ModelStringInput | null;
  tciSk?: ModelStringInput | null;
  studyVersion?: ModelStringInput | null;
  studyStatus?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelTaskFilterInput | null> | null;
  or?: Array<ModelTaskFilterInput | null> | null;
  not?: ModelTaskFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelTaskConnection = {
  __typename: "ModelTaskConnection";
  items: Array<Task | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelQuestionFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  question?: ModelStringInput | null;
  questionId?: ModelStringInput | null;
  questionText?: ModelStringInput | null;
  questionEnText?: ModelStringInput | null;
  friendlyName?: ModelStringInput | null;
  answer?: ModelStringInput | null;
  controlType?: ModelStringInput | null;
  type?: ModelStringInput | null;
  validations?: ModelStringInput | null;
  codedSelection?: ModelStringInput | null;
  answerId?: ModelStringInput | null;
  answersValue?: ModelStringInput | null;
  answerEnText?: ModelStringInput | null;
  answerCodedValue?: ModelStringInput | null;
  answersImages?: ModelStringInput | null;
  value?: ModelStringInput | null;
  codedValue?: ModelIntInput | null;
  imageS3Key?: ModelStringInput | null;
  multiSelectOverride?: ModelStringInput | null;
  version?: ModelIntInput | null;
  index?: ModelIntInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelQuestionFilterInput | null> | null;
  or?: Array<ModelQuestionFilterInput | null> | null;
  not?: ModelQuestionFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelQuestionConnection = {
  __typename: "ModelQuestionConnection";
  items: Array<Question | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelActivityFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  name?: ModelStringInput | null;
  title?: ModelStringInput | null;
  description?: ModelStringInput | null;
  type?: ModelStringInput | null;
  activityGroups?: ModelStringInput | null;
  layouts?: ModelStringInput | null;
  rules?: ModelStringInput | null;
  resumable?: ModelBooleanInput | null;
  transcribable?: ModelBooleanInput | null;
  respondentType?: ModelStringInput | null;
  progressBar?: ModelBooleanInput | null;
  displayHistoryDetail?: ModelStringInput | null;
  fontFamily?: ModelStringInput | null;
  fontWeight?: ModelIntInput | null;
  fontColor?: ModelStringInput | null;
  fontSize?: ModelIntInput | null;
  lineHeight?: ModelStringInput | null;
  s3Files?: ModelStringInput | null;
  externalContent?: ModelStringInput | null;
  calculatedValues?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelActivityFilterInput | null> | null;
  or?: Array<ModelActivityFilterInput | null> | null;
  not?: ModelActivityFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelActivityConnection = {
  __typename: "ModelActivityConnection";
  items: Array<Activity | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelDataPointFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  dataPointKey?: ModelStringInput | null;
  type?: ModelStringInput | null;
  anchors?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelDataPointFilterInput | null> | null;
  or?: Array<ModelDataPointFilterInput | null> | null;
  not?: ModelDataPointFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelDataPointConnection = {
  __typename: "ModelDataPointConnection";
  items: Array<DataPoint | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelDataPointInstanceFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  dataPointKey?: ModelStringInput | null;
  type?: ModelStringInput | null;
  studyId?: ModelStringInput | null;
  patientId?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  armId?: ModelStringInput | null;
  eventGroupId?: ModelStringInput | null;
  eventId?: ModelStringInput | null;
  activityGroupId?: ModelStringInput | null;
  activityId?: ModelStringInput | null;
  eventDayOffset?: ModelIntInput | null;
  eventTime?: ModelStringInput | null;
  questionId?: ModelStringInput | null;
  answers?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelDataPointInstanceFilterInput | null> | null;
  or?: Array<ModelDataPointInstanceFilterInput | null> | null;
  not?: ModelDataPointInstanceFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelDataPointInstanceConnection = {
  __typename: "ModelDataPointInstanceConnection";
  items: Array<DataPointInstance | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelTaskAnswerFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  activityId?: ModelStringInput | null;
  questionId?: ModelStringInput | null;
  answer?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  syncState?: ModelIntInput | null;
  syncStatus?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelTaskAnswerFilterInput | null> | null;
  or?: Array<ModelTaskAnswerFilterInput | null> | null;
  not?: ModelTaskAnswerFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelTaskAnswerConnection = {
  __typename: "ModelTaskAnswerConnection";
  items: Array<TaskAnswer | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelTaskResultFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  status?: ModelStringInput | null;
  startedAt?: ModelStringInput | null;
  completedAt?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  syncState?: ModelIntInput | null;
  syncStatus?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelTaskResultFilterInput | null> | null;
  or?: Array<ModelTaskResultFilterInput | null> | null;
  not?: ModelTaskResultFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelTaskResultConnection = {
  __typename: "ModelTaskResultConnection";
  items: Array<TaskResult | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelTaskHistoryFilterInput = {
  id?: ModelIDInput | null;
  pk?: ModelStringInput | null;
  sk?: ModelStringInput | null;
  taskInstanceId?: ModelStringInput | null;
  status?: ModelStringInput | null;
  statusBeforeExpired?: ModelStringInput | null;
  timestamp?: ModelStringInput | null;
  action?: ModelStringInput | null;
  details?: ModelStringInput | null;
  hashKey?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelTaskHistoryFilterInput | null> | null;
  or?: Array<ModelTaskHistoryFilterInput | null> | null;
  not?: ModelTaskHistoryFilterInput | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelTaskHistoryConnection = {
  __typename: "ModelTaskHistoryConnection";
  items: Array<TaskHistory | null>;
  nextToken?: string | null;
  startedAt?: number | null;
};

export type ModelSubscriptionTodoFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  name?: ModelSubscriptionStringInput | null;
  description?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionTodoFilterInput | null> | null;
  or?: Array<ModelSubscriptionTodoFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionIDInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  in?: Array<string | null> | null;
  notIn?: Array<string | null> | null;
};

export type ModelSubscriptionStringInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  in?: Array<string | null> | null;
  notIn?: Array<string | null> | null;
};

export type ModelSubscriptionTaskFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  taskInstanceId?: ModelSubscriptionStringInput | null;
  title?: ModelSubscriptionStringInput | null;
  description?: ModelSubscriptionStringInput | null;
  startTime?: ModelSubscriptionStringInput | null;
  startTimeInMillSec?: ModelSubscriptionIntInput | null;
  expireTimeInMillSec?: ModelSubscriptionIntInput | null;
  endTimeInMillSec?: ModelSubscriptionIntInput | null;
  endTime?: ModelSubscriptionStringInput | null;
  dayOffset?: ModelSubscriptionIntInput | null;
  endDayOffset?: ModelSubscriptionIntInput | null;
  taskType?: ModelSubscriptionStringInput | null;
  status?: ModelSubscriptionStringInput | null;
  showBeforeStart?: ModelSubscriptionBooleanInput | null;
  allowEarlyCompletion?: ModelSubscriptionBooleanInput | null;
  allowLateCompletion?: ModelSubscriptionBooleanInput | null;
  allowLateEdits?: ModelSubscriptionBooleanInput | null;
  anchors?: ModelSubscriptionStringInput | null;
  anchorDayOffset?: ModelSubscriptionIntInput | null;
  actions?: ModelSubscriptionStringInput | null;
  entityId?: ModelSubscriptionStringInput | null;
  activityIndex?: ModelSubscriptionIntInput | null;
  activityAnswer?: ModelSubscriptionStringInput | null;
  activityResponse?: ModelSubscriptionStringInput | null;
  syncState?: ModelSubscriptionIntInput | null;
  syncStateTaskAnswer?: ModelSubscriptionIntInput | null;
  syncStateTaskResult?: ModelSubscriptionIntInput | null;
  syncStatus?: ModelSubscriptionStringInput | null;
  hashKey?: ModelSubscriptionStringInput | null;
  occurrenceHashKey?: ModelSubscriptionStringInput | null;
  occurrenceParentHashKey?: ModelSubscriptionStringInput | null;
  parentTaskInstanceId?: ModelSubscriptionStringInput | null;
  tciSk?: ModelSubscriptionStringInput | null;
  studyVersion?: ModelSubscriptionStringInput | null;
  studyStatus?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionTaskFilterInput | null> | null;
  or?: Array<ModelSubscriptionTaskFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionIntInput = {
  ne?: number | null;
  eq?: number | null;
  le?: number | null;
  lt?: number | null;
  ge?: number | null;
  gt?: number | null;
  between?: Array<number | null> | null;
  in?: Array<number | null> | null;
  notIn?: Array<number | null> | null;
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null;
  eq?: boolean | null;
};

export type ModelSubscriptionQuestionFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  question?: ModelSubscriptionStringInput | null;
  questionId?: ModelSubscriptionStringInput | null;
  questionText?: ModelSubscriptionStringInput | null;
  questionEnText?: ModelSubscriptionStringInput | null;
  friendlyName?: ModelSubscriptionStringInput | null;
  answer?: ModelSubscriptionStringInput | null;
  controlType?: ModelSubscriptionStringInput | null;
  type?: ModelSubscriptionStringInput | null;
  validations?: ModelSubscriptionStringInput | null;
  codedSelection?: ModelSubscriptionStringInput | null;
  answerId?: ModelSubscriptionStringInput | null;
  answersValue?: ModelSubscriptionStringInput | null;
  answerEnText?: ModelSubscriptionStringInput | null;
  answerCodedValue?: ModelSubscriptionStringInput | null;
  answersImages?: ModelSubscriptionStringInput | null;
  value?: ModelSubscriptionStringInput | null;
  codedValue?: ModelSubscriptionIntInput | null;
  imageS3Key?: ModelSubscriptionStringInput | null;
  multiSelectOverride?: ModelSubscriptionStringInput | null;
  version?: ModelSubscriptionIntInput | null;
  index?: ModelSubscriptionIntInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionQuestionFilterInput | null> | null;
  or?: Array<ModelSubscriptionQuestionFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionActivityFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  name?: ModelSubscriptionStringInput | null;
  title?: ModelSubscriptionStringInput | null;
  description?: ModelSubscriptionStringInput | null;
  type?: ModelSubscriptionStringInput | null;
  activityGroups?: ModelSubscriptionStringInput | null;
  layouts?: ModelSubscriptionStringInput | null;
  rules?: ModelSubscriptionStringInput | null;
  resumable?: ModelSubscriptionBooleanInput | null;
  transcribable?: ModelSubscriptionBooleanInput | null;
  respondentType?: ModelSubscriptionStringInput | null;
  progressBar?: ModelSubscriptionBooleanInput | null;
  displayHistoryDetail?: ModelSubscriptionStringInput | null;
  fontFamily?: ModelSubscriptionStringInput | null;
  fontWeight?: ModelSubscriptionIntInput | null;
  fontColor?: ModelSubscriptionStringInput | null;
  fontSize?: ModelSubscriptionIntInput | null;
  lineHeight?: ModelSubscriptionStringInput | null;
  s3Files?: ModelSubscriptionStringInput | null;
  externalContent?: ModelSubscriptionStringInput | null;
  calculatedValues?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionActivityFilterInput | null> | null;
  or?: Array<ModelSubscriptionActivityFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionDataPointFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  dataPointKey?: ModelSubscriptionStringInput | null;
  type?: ModelSubscriptionStringInput | null;
  anchors?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionDataPointFilterInput | null> | null;
  or?: Array<ModelSubscriptionDataPointFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionDataPointInstanceFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  dataPointKey?: ModelSubscriptionStringInput | null;
  type?: ModelSubscriptionStringInput | null;
  studyId?: ModelSubscriptionStringInput | null;
  patientId?: ModelSubscriptionStringInput | null;
  hashKey?: ModelSubscriptionStringInput | null;
  armId?: ModelSubscriptionStringInput | null;
  eventGroupId?: ModelSubscriptionStringInput | null;
  eventId?: ModelSubscriptionStringInput | null;
  activityGroupId?: ModelSubscriptionStringInput | null;
  activityId?: ModelSubscriptionStringInput | null;
  eventDayOffset?: ModelSubscriptionIntInput | null;
  eventTime?: ModelSubscriptionStringInput | null;
  questionId?: ModelSubscriptionStringInput | null;
  answers?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionDataPointInstanceFilterInput | null> | null;
  or?: Array<ModelSubscriptionDataPointInstanceFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionTaskAnswerFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  taskInstanceId?: ModelSubscriptionStringInput | null;
  activityId?: ModelSubscriptionStringInput | null;
  questionId?: ModelSubscriptionStringInput | null;
  answer?: ModelSubscriptionStringInput | null;
  hashKey?: ModelSubscriptionStringInput | null;
  syncState?: ModelSubscriptionIntInput | null;
  syncStatus?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionTaskAnswerFilterInput | null> | null;
  or?: Array<ModelSubscriptionTaskAnswerFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionTaskResultFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  taskInstanceId?: ModelSubscriptionStringInput | null;
  status?: ModelSubscriptionStringInput | null;
  startedAt?: ModelSubscriptionStringInput | null;
  completedAt?: ModelSubscriptionStringInput | null;
  hashKey?: ModelSubscriptionStringInput | null;
  syncState?: ModelSubscriptionIntInput | null;
  syncStatus?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionTaskResultFilterInput | null> | null;
  or?: Array<ModelSubscriptionTaskResultFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type ModelSubscriptionTaskHistoryFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  pk?: ModelSubscriptionStringInput | null;
  sk?: ModelSubscriptionStringInput | null;
  taskInstanceId?: ModelSubscriptionStringInput | null;
  status?: ModelSubscriptionStringInput | null;
  statusBeforeExpired?: ModelSubscriptionStringInput | null;
  timestamp?: ModelSubscriptionStringInput | null;
  action?: ModelSubscriptionStringInput | null;
  details?: ModelSubscriptionStringInput | null;
  hashKey?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionTaskHistoryFilterInput | null> | null;
  or?: Array<ModelSubscriptionTaskHistoryFilterInput | null> | null;
  _deleted?: ModelBooleanInput | null;
};

export type CreateTodoMutationVariables = {
  input: CreateTodoInput;
  condition?: ModelTodoConditionInput | null;
};

export type CreateTodoMutation = {
  createTodo?: {
    __typename: "Todo";
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateTodoMutationVariables = {
  input: UpdateTodoInput;
  condition?: ModelTodoConditionInput | null;
};

export type UpdateTodoMutation = {
  updateTodo?: {
    __typename: "Todo";
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteTodoMutationVariables = {
  input: DeleteTodoInput;
  condition?: ModelTodoConditionInput | null;
};

export type DeleteTodoMutation = {
  deleteTodo?: {
    __typename: "Todo";
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateTaskMutationVariables = {
  input: CreateTaskInput;
  condition?: ModelTaskConditionInput | null;
};

export type CreateTaskMutation = {
  createTask?: {
    __typename: "Task";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    title: string;
    description?: string | null;
    startTime?: string | null;
    startTimeInMillSec?: number | null;
    expireTimeInMillSec?: number | null;
    endTimeInMillSec?: number | null;
    endTime?: string | null;
    dayOffset?: number | null;
    endDayOffset?: number | null;
    taskType: TaskType;
    status: TaskStatus;
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateTaskMutationVariables = {
  input: UpdateTaskInput;
  condition?: ModelTaskConditionInput | null;
};

export type UpdateTaskMutation = {
  updateTask?: {
    __typename: "Task";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    title: string;
    description?: string | null;
    startTime?: string | null;
    startTimeInMillSec?: number | null;
    expireTimeInMillSec?: number | null;
    endTimeInMillSec?: number | null;
    endTime?: string | null;
    dayOffset?: number | null;
    endDayOffset?: number | null;
    taskType: TaskType;
    status: TaskStatus;
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteTaskMutationVariables = {
  input: DeleteTaskInput;
  condition?: ModelTaskConditionInput | null;
};

export type DeleteTaskMutation = {
  deleteTask?: {
    __typename: "Task";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    title: string;
    description?: string | null;
    startTime?: string | null;
    startTimeInMillSec?: number | null;
    expireTimeInMillSec?: number | null;
    endTimeInMillSec?: number | null;
    endTime?: string | null;
    dayOffset?: number | null;
    endDayOffset?: number | null;
    taskType: TaskType;
    status: TaskStatus;
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateQuestionMutationVariables = {
  input: CreateQuestionInput;
  condition?: ModelQuestionConditionInput | null;
};

export type CreateQuestionMutation = {
  createQuestion?: {
    __typename: "Question";
    id: string;
    pk: string;
    sk: string;
    question: string;
    questionId: string;
    questionText?: string | null;
    questionEnText?: string | null;
    friendlyName: string;
    answer?: string | null;
    controlType: string;
    type?: string | null;
    validations?: string | null;
    codedSelection?: string | null;
    answerId?: string | null;
    answersValue?: string | null;
    answerEnText?: string | null;
    answerCodedValue?: string | null;
    answersImages?: string | null;
    value?: string | null;
    codedValue?: number | null;
    imageS3Key?: string | null;
    multiSelectOverride?: string | null;
    version: number;
    index: number;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateQuestionMutationVariables = {
  input: UpdateQuestionInput;
  condition?: ModelQuestionConditionInput | null;
};

export type UpdateQuestionMutation = {
  updateQuestion?: {
    __typename: "Question";
    id: string;
    pk: string;
    sk: string;
    question: string;
    questionId: string;
    questionText?: string | null;
    questionEnText?: string | null;
    friendlyName: string;
    answer?: string | null;
    controlType: string;
    type?: string | null;
    validations?: string | null;
    codedSelection?: string | null;
    answerId?: string | null;
    answersValue?: string | null;
    answerEnText?: string | null;
    answerCodedValue?: string | null;
    answersImages?: string | null;
    value?: string | null;
    codedValue?: number | null;
    imageS3Key?: string | null;
    multiSelectOverride?: string | null;
    version: number;
    index: number;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteQuestionMutationVariables = {
  input: DeleteQuestionInput;
  condition?: ModelQuestionConditionInput | null;
};

export type DeleteQuestionMutation = {
  deleteQuestion?: {
    __typename: "Question";
    id: string;
    pk: string;
    sk: string;
    question: string;
    questionId: string;
    questionText?: string | null;
    questionEnText?: string | null;
    friendlyName: string;
    answer?: string | null;
    controlType: string;
    type?: string | null;
    validations?: string | null;
    codedSelection?: string | null;
    answerId?: string | null;
    answersValue?: string | null;
    answerEnText?: string | null;
    answerCodedValue?: string | null;
    answersImages?: string | null;
    value?: string | null;
    codedValue?: number | null;
    imageS3Key?: string | null;
    multiSelectOverride?: string | null;
    version: number;
    index: number;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateActivityMutationVariables = {
  input: CreateActivityInput;
  condition?: ModelActivityConditionInput | null;
};

export type CreateActivityMutation = {
  createActivity?: {
    __typename: "Activity";
    id: string;
    pk: string;
    sk: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    type?: string | null;
    activityGroups?: string | null;
    layouts?: string | null;
    rules?: string | null;
    resumable?: boolean | null;
    transcribable?: boolean | null;
    respondentType?: string | null;
    progressBar?: boolean | null;
    displayHistoryDetail?: string | null;
    fontFamily?: string | null;
    fontWeight?: number | null;
    fontColor?: string | null;
    fontSize?: number | null;
    lineHeight?: string | null;
    s3Files?: string | null;
    externalContent?: string | null;
    calculatedValues?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateActivityMutationVariables = {
  input: UpdateActivityInput;
  condition?: ModelActivityConditionInput | null;
};

export type UpdateActivityMutation = {
  updateActivity?: {
    __typename: "Activity";
    id: string;
    pk: string;
    sk: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    type?: string | null;
    activityGroups?: string | null;
    layouts?: string | null;
    rules?: string | null;
    resumable?: boolean | null;
    transcribable?: boolean | null;
    respondentType?: string | null;
    progressBar?: boolean | null;
    displayHistoryDetail?: string | null;
    fontFamily?: string | null;
    fontWeight?: number | null;
    fontColor?: string | null;
    fontSize?: number | null;
    lineHeight?: string | null;
    s3Files?: string | null;
    externalContent?: string | null;
    calculatedValues?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteActivityMutationVariables = {
  input: DeleteActivityInput;
  condition?: ModelActivityConditionInput | null;
};

export type DeleteActivityMutation = {
  deleteActivity?: {
    __typename: "Activity";
    id: string;
    pk: string;
    sk: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    type?: string | null;
    activityGroups?: string | null;
    layouts?: string | null;
    rules?: string | null;
    resumable?: boolean | null;
    transcribable?: boolean | null;
    respondentType?: string | null;
    progressBar?: boolean | null;
    displayHistoryDetail?: string | null;
    fontFamily?: string | null;
    fontWeight?: number | null;
    fontColor?: string | null;
    fontSize?: number | null;
    lineHeight?: string | null;
    s3Files?: string | null;
    externalContent?: string | null;
    calculatedValues?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateDataPointMutationVariables = {
  input: CreateDataPointInput;
  condition?: ModelDataPointConditionInput | null;
};

export type CreateDataPointMutation = {
  createDataPoint?: {
    __typename: "DataPoint";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    anchors?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateDataPointMutationVariables = {
  input: UpdateDataPointInput;
  condition?: ModelDataPointConditionInput | null;
};

export type UpdateDataPointMutation = {
  updateDataPoint?: {
    __typename: "DataPoint";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    anchors?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteDataPointMutationVariables = {
  input: DeleteDataPointInput;
  condition?: ModelDataPointConditionInput | null;
};

export type DeleteDataPointMutation = {
  deleteDataPoint?: {
    __typename: "DataPoint";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    anchors?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateDataPointInstanceMutationVariables = {
  input: CreateDataPointInstanceInput;
  condition?: ModelDataPointInstanceConditionInput | null;
};

export type CreateDataPointInstanceMutation = {
  createDataPointInstance?: {
    __typename: "DataPointInstance";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    studyId?: string | null;
    patientId?: string | null;
    hashKey?: string | null;
    armId?: string | null;
    eventGroupId?: string | null;
    eventId?: string | null;
    activityGroupId?: string | null;
    activityId?: string | null;
    eventDayOffset?: number | null;
    eventTime?: string | null;
    questionId?: string | null;
    answers?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateDataPointInstanceMutationVariables = {
  input: UpdateDataPointInstanceInput;
  condition?: ModelDataPointInstanceConditionInput | null;
};

export type UpdateDataPointInstanceMutation = {
  updateDataPointInstance?: {
    __typename: "DataPointInstance";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    studyId?: string | null;
    patientId?: string | null;
    hashKey?: string | null;
    armId?: string | null;
    eventGroupId?: string | null;
    eventId?: string | null;
    activityGroupId?: string | null;
    activityId?: string | null;
    eventDayOffset?: number | null;
    eventTime?: string | null;
    questionId?: string | null;
    answers?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteDataPointInstanceMutationVariables = {
  input: DeleteDataPointInstanceInput;
  condition?: ModelDataPointInstanceConditionInput | null;
};

export type DeleteDataPointInstanceMutation = {
  deleteDataPointInstance?: {
    __typename: "DataPointInstance";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    studyId?: string | null;
    patientId?: string | null;
    hashKey?: string | null;
    armId?: string | null;
    eventGroupId?: string | null;
    eventId?: string | null;
    activityGroupId?: string | null;
    activityId?: string | null;
    eventDayOffset?: number | null;
    eventTime?: string | null;
    questionId?: string | null;
    answers?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateTaskAnswerMutationVariables = {
  input: CreateTaskAnswerInput;
  condition?: ModelTaskAnswerConditionInput | null;
};

export type CreateTaskAnswerMutation = {
  createTaskAnswer?: {
    __typename: "TaskAnswer";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    activityId?: string | null;
    questionId?: string | null;
    answer?: string | null;
    hashKey?: string | null;
    syncState?: number | null;
    syncStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateTaskAnswerMutationVariables = {
  input: UpdateTaskAnswerInput;
  condition?: ModelTaskAnswerConditionInput | null;
};

export type UpdateTaskAnswerMutation = {
  updateTaskAnswer?: {
    __typename: "TaskAnswer";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    activityId?: string | null;
    questionId?: string | null;
    answer?: string | null;
    hashKey?: string | null;
    syncState?: number | null;
    syncStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteTaskAnswerMutationVariables = {
  input: DeleteTaskAnswerInput;
  condition?: ModelTaskAnswerConditionInput | null;
};

export type DeleteTaskAnswerMutation = {
  deleteTaskAnswer?: {
    __typename: "TaskAnswer";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    activityId?: string | null;
    questionId?: string | null;
    answer?: string | null;
    hashKey?: string | null;
    syncState?: number | null;
    syncStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateTaskResultMutationVariables = {
  input: CreateTaskResultInput;
  condition?: ModelTaskResultConditionInput | null;
};

export type CreateTaskResultMutation = {
  createTaskResult?: {
    __typename: "TaskResult";
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateTaskResultMutationVariables = {
  input: UpdateTaskResultInput;
  condition?: ModelTaskResultConditionInput | null;
};

export type UpdateTaskResultMutation = {
  updateTaskResult?: {
    __typename: "TaskResult";
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteTaskResultMutationVariables = {
  input: DeleteTaskResultInput;
  condition?: ModelTaskResultConditionInput | null;
};

export type DeleteTaskResultMutation = {
  deleteTaskResult?: {
    __typename: "TaskResult";
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type CreateTaskHistoryMutationVariables = {
  input: CreateTaskHistoryInput;
  condition?: ModelTaskHistoryConditionInput | null;
};

export type CreateTaskHistoryMutation = {
  createTaskHistory?: {
    __typename: "TaskHistory";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    status?: string | null;
    statusBeforeExpired?: string | null;
    timestamp?: string | null;
    action?: string | null;
    details?: string | null;
    hashKey?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type UpdateTaskHistoryMutationVariables = {
  input: UpdateTaskHistoryInput;
  condition?: ModelTaskHistoryConditionInput | null;
};

export type UpdateTaskHistoryMutation = {
  updateTaskHistory?: {
    __typename: "TaskHistory";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    status?: string | null;
    statusBeforeExpired?: string | null;
    timestamp?: string | null;
    action?: string | null;
    details?: string | null;
    hashKey?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type DeleteTaskHistoryMutationVariables = {
  input: DeleteTaskHistoryInput;
  condition?: ModelTaskHistoryConditionInput | null;
};

export type DeleteTaskHistoryMutation = {
  deleteTaskHistory?: {
    __typename: "TaskHistory";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    status?: string | null;
    statusBeforeExpired?: string | null;
    timestamp?: string | null;
    action?: string | null;
    details?: string | null;
    hashKey?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type GetTodoQueryVariables = {
  id: string;
};

export type GetTodoQuery = {
  getTodo?: {
    __typename: "Todo";
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListTodosQueryVariables = {
  filter?: ModelTodoFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListTodosQuery = {
  listTodos?: {
    __typename: "ModelTodoConnection";
    items: Array<{
      __typename: "Todo";
      id: string;
      name: string;
      description?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncTodosQueryVariables = {
  filter?: ModelTodoFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncTodosQuery = {
  syncTodos?: {
    __typename: "ModelTodoConnection";
    items: Array<{
      __typename: "Todo";
      id: string;
      name: string;
      description?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetTaskQueryVariables = {
  id: string;
};

export type GetTaskQuery = {
  getTask?: {
    __typename: "Task";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    title: string;
    description?: string | null;
    startTime?: string | null;
    startTimeInMillSec?: number | null;
    expireTimeInMillSec?: number | null;
    endTimeInMillSec?: number | null;
    endTime?: string | null;
    dayOffset?: number | null;
    endDayOffset?: number | null;
    taskType: TaskType;
    status: TaskStatus;
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListTasksQueryVariables = {
  filter?: ModelTaskFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListTasksQuery = {
  listTasks?: {
    __typename: "ModelTaskConnection";
    items: Array<{
      __typename: "Task";
      id: string;
      pk: string;
      sk: string;
      taskInstanceId?: string | null;
      title: string;
      description?: string | null;
      startTime?: string | null;
      startTimeInMillSec?: number | null;
      expireTimeInMillSec?: number | null;
      endTimeInMillSec?: number | null;
      endTime?: string | null;
      dayOffset?: number | null;
      endDayOffset?: number | null;
      taskType: TaskType;
      status: TaskStatus;
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
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncTasksQueryVariables = {
  filter?: ModelTaskFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncTasksQuery = {
  syncTasks?: {
    __typename: "ModelTaskConnection";
    items: Array<{
      __typename: "Task";
      id: string;
      pk: string;
      sk: string;
      taskInstanceId?: string | null;
      title: string;
      description?: string | null;
      startTime?: string | null;
      startTimeInMillSec?: number | null;
      expireTimeInMillSec?: number | null;
      endTimeInMillSec?: number | null;
      endTime?: string | null;
      dayOffset?: number | null;
      endDayOffset?: number | null;
      taskType: TaskType;
      status: TaskStatus;
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
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetQuestionQueryVariables = {
  id: string;
};

export type GetQuestionQuery = {
  getQuestion?: {
    __typename: "Question";
    id: string;
    pk: string;
    sk: string;
    question: string;
    questionId: string;
    questionText?: string | null;
    questionEnText?: string | null;
    friendlyName: string;
    answer?: string | null;
    controlType: string;
    type?: string | null;
    validations?: string | null;
    codedSelection?: string | null;
    answerId?: string | null;
    answersValue?: string | null;
    answerEnText?: string | null;
    answerCodedValue?: string | null;
    answersImages?: string | null;
    value?: string | null;
    codedValue?: number | null;
    imageS3Key?: string | null;
    multiSelectOverride?: string | null;
    version: number;
    index: number;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListQuestionsQueryVariables = {
  filter?: ModelQuestionFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListQuestionsQuery = {
  listQuestions?: {
    __typename: "ModelQuestionConnection";
    items: Array<{
      __typename: "Question";
      id: string;
      pk: string;
      sk: string;
      question: string;
      questionId: string;
      questionText?: string | null;
      questionEnText?: string | null;
      friendlyName: string;
      answer?: string | null;
      controlType: string;
      type?: string | null;
      validations?: string | null;
      codedSelection?: string | null;
      answerId?: string | null;
      answersValue?: string | null;
      answerEnText?: string | null;
      answerCodedValue?: string | null;
      answersImages?: string | null;
      value?: string | null;
      codedValue?: number | null;
      imageS3Key?: string | null;
      multiSelectOverride?: string | null;
      version: number;
      index: number;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncQuestionsQueryVariables = {
  filter?: ModelQuestionFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncQuestionsQuery = {
  syncQuestions?: {
    __typename: "ModelQuestionConnection";
    items: Array<{
      __typename: "Question";
      id: string;
      pk: string;
      sk: string;
      question: string;
      questionId: string;
      questionText?: string | null;
      questionEnText?: string | null;
      friendlyName: string;
      answer?: string | null;
      controlType: string;
      type?: string | null;
      validations?: string | null;
      codedSelection?: string | null;
      answerId?: string | null;
      answersValue?: string | null;
      answerEnText?: string | null;
      answerCodedValue?: string | null;
      answersImages?: string | null;
      value?: string | null;
      codedValue?: number | null;
      imageS3Key?: string | null;
      multiSelectOverride?: string | null;
      version: number;
      index: number;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetActivityQueryVariables = {
  id: string;
};

export type GetActivityQuery = {
  getActivity?: {
    __typename: "Activity";
    id: string;
    pk: string;
    sk: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    type?: string | null;
    activityGroups?: string | null;
    layouts?: string | null;
    rules?: string | null;
    resumable?: boolean | null;
    transcribable?: boolean | null;
    respondentType?: string | null;
    progressBar?: boolean | null;
    displayHistoryDetail?: string | null;
    fontFamily?: string | null;
    fontWeight?: number | null;
    fontColor?: string | null;
    fontSize?: number | null;
    lineHeight?: string | null;
    s3Files?: string | null;
    externalContent?: string | null;
    calculatedValues?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListActivitiesQueryVariables = {
  filter?: ModelActivityFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListActivitiesQuery = {
  listActivities?: {
    __typename: "ModelActivityConnection";
    items: Array<{
      __typename: "Activity";
      id: string;
      pk: string;
      sk: string;
      name?: string | null;
      title?: string | null;
      description?: string | null;
      type?: string | null;
      activityGroups?: string | null;
      layouts?: string | null;
      rules?: string | null;
      resumable?: boolean | null;
      transcribable?: boolean | null;
      respondentType?: string | null;
      progressBar?: boolean | null;
      displayHistoryDetail?: string | null;
      fontFamily?: string | null;
      fontWeight?: number | null;
      fontColor?: string | null;
      fontSize?: number | null;
      lineHeight?: string | null;
      s3Files?: string | null;
      externalContent?: string | null;
      calculatedValues?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncActivitiesQueryVariables = {
  filter?: ModelActivityFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncActivitiesQuery = {
  syncActivities?: {
    __typename: "ModelActivityConnection";
    items: Array<{
      __typename: "Activity";
      id: string;
      pk: string;
      sk: string;
      name?: string | null;
      title?: string | null;
      description?: string | null;
      type?: string | null;
      activityGroups?: string | null;
      layouts?: string | null;
      rules?: string | null;
      resumable?: boolean | null;
      transcribable?: boolean | null;
      respondentType?: string | null;
      progressBar?: boolean | null;
      displayHistoryDetail?: string | null;
      fontFamily?: string | null;
      fontWeight?: number | null;
      fontColor?: string | null;
      fontSize?: number | null;
      lineHeight?: string | null;
      s3Files?: string | null;
      externalContent?: string | null;
      calculatedValues?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetDataPointQueryVariables = {
  id: string;
};

export type GetDataPointQuery = {
  getDataPoint?: {
    __typename: "DataPoint";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    anchors?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListDataPointsQueryVariables = {
  filter?: ModelDataPointFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListDataPointsQuery = {
  listDataPoints?: {
    __typename: "ModelDataPointConnection";
    items: Array<{
      __typename: "DataPoint";
      id: string;
      pk: string;
      sk: string;
      dataPointKey?: string | null;
      type?: string | null;
      anchors?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncDataPointsQueryVariables = {
  filter?: ModelDataPointFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncDataPointsQuery = {
  syncDataPoints?: {
    __typename: "ModelDataPointConnection";
    items: Array<{
      __typename: "DataPoint";
      id: string;
      pk: string;
      sk: string;
      dataPointKey?: string | null;
      type?: string | null;
      anchors?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetDataPointInstanceQueryVariables = {
  id: string;
};

export type GetDataPointInstanceQuery = {
  getDataPointInstance?: {
    __typename: "DataPointInstance";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    studyId?: string | null;
    patientId?: string | null;
    hashKey?: string | null;
    armId?: string | null;
    eventGroupId?: string | null;
    eventId?: string | null;
    activityGroupId?: string | null;
    activityId?: string | null;
    eventDayOffset?: number | null;
    eventTime?: string | null;
    questionId?: string | null;
    answers?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListDataPointInstancesQueryVariables = {
  filter?: ModelDataPointInstanceFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListDataPointInstancesQuery = {
  listDataPointInstances?: {
    __typename: "ModelDataPointInstanceConnection";
    items: Array<{
      __typename: "DataPointInstance";
      id: string;
      pk: string;
      sk: string;
      dataPointKey?: string | null;
      type?: string | null;
      studyId?: string | null;
      patientId?: string | null;
      hashKey?: string | null;
      armId?: string | null;
      eventGroupId?: string | null;
      eventId?: string | null;
      activityGroupId?: string | null;
      activityId?: string | null;
      eventDayOffset?: number | null;
      eventTime?: string | null;
      questionId?: string | null;
      answers?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncDataPointInstancesQueryVariables = {
  filter?: ModelDataPointInstanceFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncDataPointInstancesQuery = {
  syncDataPointInstances?: {
    __typename: "ModelDataPointInstanceConnection";
    items: Array<{
      __typename: "DataPointInstance";
      id: string;
      pk: string;
      sk: string;
      dataPointKey?: string | null;
      type?: string | null;
      studyId?: string | null;
      patientId?: string | null;
      hashKey?: string | null;
      armId?: string | null;
      eventGroupId?: string | null;
      eventId?: string | null;
      activityGroupId?: string | null;
      activityId?: string | null;
      eventDayOffset?: number | null;
      eventTime?: string | null;
      questionId?: string | null;
      answers?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetTaskAnswerQueryVariables = {
  id: string;
};

export type GetTaskAnswerQuery = {
  getTaskAnswer?: {
    __typename: "TaskAnswer";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    activityId?: string | null;
    questionId?: string | null;
    answer?: string | null;
    hashKey?: string | null;
    syncState?: number | null;
    syncStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListTaskAnswersQueryVariables = {
  filter?: ModelTaskAnswerFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListTaskAnswersQuery = {
  listTaskAnswers?: {
    __typename: "ModelTaskAnswerConnection";
    items: Array<{
      __typename: "TaskAnswer";
      id: string;
      pk: string;
      sk: string;
      taskInstanceId?: string | null;
      activityId?: string | null;
      questionId?: string | null;
      answer?: string | null;
      hashKey?: string | null;
      syncState?: number | null;
      syncStatus?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncTaskAnswersQueryVariables = {
  filter?: ModelTaskAnswerFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncTaskAnswersQuery = {
  syncTaskAnswers?: {
    __typename: "ModelTaskAnswerConnection";
    items: Array<{
      __typename: "TaskAnswer";
      id: string;
      pk: string;
      sk: string;
      taskInstanceId?: string | null;
      activityId?: string | null;
      questionId?: string | null;
      answer?: string | null;
      hashKey?: string | null;
      syncState?: number | null;
      syncStatus?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetTaskResultQueryVariables = {
  id: string;
};

export type GetTaskResultQuery = {
  getTaskResult?: {
    __typename: "TaskResult";
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListTaskResultsQueryVariables = {
  filter?: ModelTaskResultFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListTaskResultsQuery = {
  listTaskResults?: {
    __typename: "ModelTaskResultConnection";
    items: Array<{
      __typename: "TaskResult";
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
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncTaskResultsQueryVariables = {
  filter?: ModelTaskResultFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncTaskResultsQuery = {
  syncTaskResults?: {
    __typename: "ModelTaskResultConnection";
    items: Array<{
      __typename: "TaskResult";
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
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type GetTaskHistoryQueryVariables = {
  id: string;
};

export type GetTaskHistoryQuery = {
  getTaskHistory?: {
    __typename: "TaskHistory";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    status?: string | null;
    statusBeforeExpired?: string | null;
    timestamp?: string | null;
    action?: string | null;
    details?: string | null;
    hashKey?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type ListTaskHistoriesQueryVariables = {
  filter?: ModelTaskHistoryFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
};

export type ListTaskHistoriesQuery = {
  listTaskHistories?: {
    __typename: "ModelTaskHistoryConnection";
    items: Array<{
      __typename: "TaskHistory";
      id: string;
      pk: string;
      sk: string;
      taskInstanceId?: string | null;
      status?: string | null;
      statusBeforeExpired?: string | null;
      timestamp?: string | null;
      action?: string | null;
      details?: string | null;
      hashKey?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type SyncTaskHistoriesQueryVariables = {
  filter?: ModelTaskHistoryFilterInput | null;
  limit?: number | null;
  nextToken?: string | null;
  lastSync?: number | null;
};

export type SyncTaskHistoriesQuery = {
  syncTaskHistories?: {
    __typename: "ModelTaskHistoryConnection";
    items: Array<{
      __typename: "TaskHistory";
      id: string;
      pk: string;
      sk: string;
      taskInstanceId?: string | null;
      status?: string | null;
      statusBeforeExpired?: string | null;
      timestamp?: string | null;
      action?: string | null;
      details?: string | null;
      hashKey?: string | null;
      createdAt: string;
      updatedAt: string;
      _version: number;
      _deleted?: boolean | null;
      _lastChangedAt: number;
    } | null>;
    nextToken?: string | null;
    startedAt?: number | null;
  } | null;
};

export type OnCreateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null;
};

export type OnCreateTodoSubscription = {
  onCreateTodo?: {
    __typename: "Todo";
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null;
};

export type OnUpdateTodoSubscription = {
  onUpdateTodo?: {
    __typename: "Todo";
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null;
};

export type OnDeleteTodoSubscription = {
  onDeleteTodo?: {
    __typename: "Todo";
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateTaskSubscriptionVariables = {
  filter?: ModelSubscriptionTaskFilterInput | null;
};

export type OnCreateTaskSubscription = {
  onCreateTask?: {
    __typename: "Task";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    title: string;
    description?: string | null;
    startTime?: string | null;
    startTimeInMillSec?: number | null;
    expireTimeInMillSec?: number | null;
    endTimeInMillSec?: number | null;
    endTime?: string | null;
    dayOffset?: number | null;
    endDayOffset?: number | null;
    taskType: TaskType;
    status: TaskStatus;
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateTaskSubscriptionVariables = {
  filter?: ModelSubscriptionTaskFilterInput | null;
};

export type OnUpdateTaskSubscription = {
  onUpdateTask?: {
    __typename: "Task";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    title: string;
    description?: string | null;
    startTime?: string | null;
    startTimeInMillSec?: number | null;
    expireTimeInMillSec?: number | null;
    endTimeInMillSec?: number | null;
    endTime?: string | null;
    dayOffset?: number | null;
    endDayOffset?: number | null;
    taskType: TaskType;
    status: TaskStatus;
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteTaskSubscriptionVariables = {
  filter?: ModelSubscriptionTaskFilterInput | null;
};

export type OnDeleteTaskSubscription = {
  onDeleteTask?: {
    __typename: "Task";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    title: string;
    description?: string | null;
    startTime?: string | null;
    startTimeInMillSec?: number | null;
    expireTimeInMillSec?: number | null;
    endTimeInMillSec?: number | null;
    endTime?: string | null;
    dayOffset?: number | null;
    endDayOffset?: number | null;
    taskType: TaskType;
    status: TaskStatus;
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null;
};

export type OnCreateQuestionSubscription = {
  onCreateQuestion?: {
    __typename: "Question";
    id: string;
    pk: string;
    sk: string;
    question: string;
    questionId: string;
    questionText?: string | null;
    questionEnText?: string | null;
    friendlyName: string;
    answer?: string | null;
    controlType: string;
    type?: string | null;
    validations?: string | null;
    codedSelection?: string | null;
    answerId?: string | null;
    answersValue?: string | null;
    answerEnText?: string | null;
    answerCodedValue?: string | null;
    answersImages?: string | null;
    value?: string | null;
    codedValue?: number | null;
    imageS3Key?: string | null;
    multiSelectOverride?: string | null;
    version: number;
    index: number;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null;
};

export type OnUpdateQuestionSubscription = {
  onUpdateQuestion?: {
    __typename: "Question";
    id: string;
    pk: string;
    sk: string;
    question: string;
    questionId: string;
    questionText?: string | null;
    questionEnText?: string | null;
    friendlyName: string;
    answer?: string | null;
    controlType: string;
    type?: string | null;
    validations?: string | null;
    codedSelection?: string | null;
    answerId?: string | null;
    answersValue?: string | null;
    answerEnText?: string | null;
    answerCodedValue?: string | null;
    answersImages?: string | null;
    value?: string | null;
    codedValue?: number | null;
    imageS3Key?: string | null;
    multiSelectOverride?: string | null;
    version: number;
    index: number;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null;
};

export type OnDeleteQuestionSubscription = {
  onDeleteQuestion?: {
    __typename: "Question";
    id: string;
    pk: string;
    sk: string;
    question: string;
    questionId: string;
    questionText?: string | null;
    questionEnText?: string | null;
    friendlyName: string;
    answer?: string | null;
    controlType: string;
    type?: string | null;
    validations?: string | null;
    codedSelection?: string | null;
    answerId?: string | null;
    answersValue?: string | null;
    answerEnText?: string | null;
    answerCodedValue?: string | null;
    answersImages?: string | null;
    value?: string | null;
    codedValue?: number | null;
    imageS3Key?: string | null;
    multiSelectOverride?: string | null;
    version: number;
    index: number;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateActivitySubscriptionVariables = {
  filter?: ModelSubscriptionActivityFilterInput | null;
};

export type OnCreateActivitySubscription = {
  onCreateActivity?: {
    __typename: "Activity";
    id: string;
    pk: string;
    sk: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    type?: string | null;
    activityGroups?: string | null;
    layouts?: string | null;
    rules?: string | null;
    resumable?: boolean | null;
    transcribable?: boolean | null;
    respondentType?: string | null;
    progressBar?: boolean | null;
    displayHistoryDetail?: string | null;
    fontFamily?: string | null;
    fontWeight?: number | null;
    fontColor?: string | null;
    fontSize?: number | null;
    lineHeight?: string | null;
    s3Files?: string | null;
    externalContent?: string | null;
    calculatedValues?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateActivitySubscriptionVariables = {
  filter?: ModelSubscriptionActivityFilterInput | null;
};

export type OnUpdateActivitySubscription = {
  onUpdateActivity?: {
    __typename: "Activity";
    id: string;
    pk: string;
    sk: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    type?: string | null;
    activityGroups?: string | null;
    layouts?: string | null;
    rules?: string | null;
    resumable?: boolean | null;
    transcribable?: boolean | null;
    respondentType?: string | null;
    progressBar?: boolean | null;
    displayHistoryDetail?: string | null;
    fontFamily?: string | null;
    fontWeight?: number | null;
    fontColor?: string | null;
    fontSize?: number | null;
    lineHeight?: string | null;
    s3Files?: string | null;
    externalContent?: string | null;
    calculatedValues?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteActivitySubscriptionVariables = {
  filter?: ModelSubscriptionActivityFilterInput | null;
};

export type OnDeleteActivitySubscription = {
  onDeleteActivity?: {
    __typename: "Activity";
    id: string;
    pk: string;
    sk: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    type?: string | null;
    activityGroups?: string | null;
    layouts?: string | null;
    rules?: string | null;
    resumable?: boolean | null;
    transcribable?: boolean | null;
    respondentType?: string | null;
    progressBar?: boolean | null;
    displayHistoryDetail?: string | null;
    fontFamily?: string | null;
    fontWeight?: number | null;
    fontColor?: string | null;
    fontSize?: number | null;
    lineHeight?: string | null;
    s3Files?: string | null;
    externalContent?: string | null;
    calculatedValues?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateDataPointSubscriptionVariables = {
  filter?: ModelSubscriptionDataPointFilterInput | null;
};

export type OnCreateDataPointSubscription = {
  onCreateDataPoint?: {
    __typename: "DataPoint";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    anchors?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateDataPointSubscriptionVariables = {
  filter?: ModelSubscriptionDataPointFilterInput | null;
};

export type OnUpdateDataPointSubscription = {
  onUpdateDataPoint?: {
    __typename: "DataPoint";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    anchors?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteDataPointSubscriptionVariables = {
  filter?: ModelSubscriptionDataPointFilterInput | null;
};

export type OnDeleteDataPointSubscription = {
  onDeleteDataPoint?: {
    __typename: "DataPoint";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    anchors?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateDataPointInstanceSubscriptionVariables = {
  filter?: ModelSubscriptionDataPointInstanceFilterInput | null;
};

export type OnCreateDataPointInstanceSubscription = {
  onCreateDataPointInstance?: {
    __typename: "DataPointInstance";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    studyId?: string | null;
    patientId?: string | null;
    hashKey?: string | null;
    armId?: string | null;
    eventGroupId?: string | null;
    eventId?: string | null;
    activityGroupId?: string | null;
    activityId?: string | null;
    eventDayOffset?: number | null;
    eventTime?: string | null;
    questionId?: string | null;
    answers?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateDataPointInstanceSubscriptionVariables = {
  filter?: ModelSubscriptionDataPointInstanceFilterInput | null;
};

export type OnUpdateDataPointInstanceSubscription = {
  onUpdateDataPointInstance?: {
    __typename: "DataPointInstance";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    studyId?: string | null;
    patientId?: string | null;
    hashKey?: string | null;
    armId?: string | null;
    eventGroupId?: string | null;
    eventId?: string | null;
    activityGroupId?: string | null;
    activityId?: string | null;
    eventDayOffset?: number | null;
    eventTime?: string | null;
    questionId?: string | null;
    answers?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteDataPointInstanceSubscriptionVariables = {
  filter?: ModelSubscriptionDataPointInstanceFilterInput | null;
};

export type OnDeleteDataPointInstanceSubscription = {
  onDeleteDataPointInstance?: {
    __typename: "DataPointInstance";
    id: string;
    pk: string;
    sk: string;
    dataPointKey?: string | null;
    type?: string | null;
    studyId?: string | null;
    patientId?: string | null;
    hashKey?: string | null;
    armId?: string | null;
    eventGroupId?: string | null;
    eventId?: string | null;
    activityGroupId?: string | null;
    activityId?: string | null;
    eventDayOffset?: number | null;
    eventTime?: string | null;
    questionId?: string | null;
    answers?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateTaskAnswerSubscriptionVariables = {
  filter?: ModelSubscriptionTaskAnswerFilterInput | null;
};

export type OnCreateTaskAnswerSubscription = {
  onCreateTaskAnswer?: {
    __typename: "TaskAnswer";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    activityId?: string | null;
    questionId?: string | null;
    answer?: string | null;
    hashKey?: string | null;
    syncState?: number | null;
    syncStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateTaskAnswerSubscriptionVariables = {
  filter?: ModelSubscriptionTaskAnswerFilterInput | null;
};

export type OnUpdateTaskAnswerSubscription = {
  onUpdateTaskAnswer?: {
    __typename: "TaskAnswer";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    activityId?: string | null;
    questionId?: string | null;
    answer?: string | null;
    hashKey?: string | null;
    syncState?: number | null;
    syncStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteTaskAnswerSubscriptionVariables = {
  filter?: ModelSubscriptionTaskAnswerFilterInput | null;
};

export type OnDeleteTaskAnswerSubscription = {
  onDeleteTaskAnswer?: {
    __typename: "TaskAnswer";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    activityId?: string | null;
    questionId?: string | null;
    answer?: string | null;
    hashKey?: string | null;
    syncState?: number | null;
    syncStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateTaskResultSubscriptionVariables = {
  filter?: ModelSubscriptionTaskResultFilterInput | null;
};

export type OnCreateTaskResultSubscription = {
  onCreateTaskResult?: {
    __typename: "TaskResult";
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateTaskResultSubscriptionVariables = {
  filter?: ModelSubscriptionTaskResultFilterInput | null;
};

export type OnUpdateTaskResultSubscription = {
  onUpdateTaskResult?: {
    __typename: "TaskResult";
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteTaskResultSubscriptionVariables = {
  filter?: ModelSubscriptionTaskResultFilterInput | null;
};

export type OnDeleteTaskResultSubscription = {
  onDeleteTaskResult?: {
    __typename: "TaskResult";
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
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnCreateTaskHistorySubscriptionVariables = {
  filter?: ModelSubscriptionTaskHistoryFilterInput | null;
};

export type OnCreateTaskHistorySubscription = {
  onCreateTaskHistory?: {
    __typename: "TaskHistory";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    status?: string | null;
    statusBeforeExpired?: string | null;
    timestamp?: string | null;
    action?: string | null;
    details?: string | null;
    hashKey?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnUpdateTaskHistorySubscriptionVariables = {
  filter?: ModelSubscriptionTaskHistoryFilterInput | null;
};

export type OnUpdateTaskHistorySubscription = {
  onUpdateTaskHistory?: {
    __typename: "TaskHistory";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    status?: string | null;
    statusBeforeExpired?: string | null;
    timestamp?: string | null;
    action?: string | null;
    details?: string | null;
    hashKey?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};

export type OnDeleteTaskHistorySubscriptionVariables = {
  filter?: ModelSubscriptionTaskHistoryFilterInput | null;
};

export type OnDeleteTaskHistorySubscription = {
  onDeleteTaskHistory?: {
    __typename: "TaskHistory";
    id: string;
    pk: string;
    sk: string;
    taskInstanceId?: string | null;
    status?: string | null;
    statusBeforeExpired?: string | null;
    timestamp?: string | null;
    action?: string | null;
    details?: string | null;
    hashKey?: string | null;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _deleted?: boolean | null;
    _lastChangedAt: number;
  } | null;
};
