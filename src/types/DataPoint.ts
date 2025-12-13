export interface DataPoint {
  id: string;
  pk: string;
  sk: string;
  dataPointKey?: string | null;
  type?: string | null;
  anchors?: string | null; // JSON string of DataPointAnchor[]

  // DataStore fields
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
  _lastChangedAt?: number | null;
}

export interface DataPointInstance {
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
  answers?: string | null; // JSON string of StudyAnswer[]

  // DataStore fields
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
  _lastChangedAt?: number | null;
}

export interface CreateDataPointInput {
  pk: string;
  sk: string;
  dataPointKey?: string | null;
  type?: string | null;
  anchors?: string | null;
}

export interface CreateDataPointInstanceInput {
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
}

export interface UpdateDataPointInput {
  id: string;
  dataPointKey?: string | null;
  type?: string | null;
  anchors?: string | null;
}

export interface UpdateDataPointInstanceInput {
  id: string;
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
}
