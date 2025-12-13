/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateTodo =
  /* GraphQL */ `subscription OnCreateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onCreateTodo(filter: $filter) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateTodoSubscriptionVariables,
    APITypes.OnCreateTodoSubscription
  >;
export const onUpdateTodo =
  /* GraphQL */ `subscription OnUpdateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onUpdateTodo(filter: $filter) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateTodoSubscriptionVariables,
    APITypes.OnUpdateTodoSubscription
  >;
export const onDeleteTodo =
  /* GraphQL */ `subscription OnDeleteTodo($filter: ModelSubscriptionTodoFilterInput) {
  onDeleteTodo(filter: $filter) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteTodoSubscriptionVariables,
    APITypes.OnDeleteTodoSubscription
  >;
export const onCreateTask =
  /* GraphQL */ `subscription OnCreateTask($filter: ModelSubscriptionTaskFilterInput) {
  onCreateTask(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    title
    description
    startTime
    startTimeInMillSec
    expireTimeInMillSec
    endTimeInMillSec
    endTime
    dayOffset
    endDayOffset
    taskType
    status
    showBeforeStart
    allowEarlyCompletion
    allowLateCompletion
    allowLateEdits
    anchors
    anchorDayOffset
    actions
    entityId
    activityIndex
    activityAnswer
    activityResponse
    syncState
    syncStateTaskAnswer
    syncStateTaskResult
    syncStatus
    hashKey
    occurrenceHashKey
    occurrenceParentHashKey
    parentTaskInstanceId
    tciSk
    studyVersion
    studyStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateTaskSubscriptionVariables,
    APITypes.OnCreateTaskSubscription
  >;
export const onUpdateTask =
  /* GraphQL */ `subscription OnUpdateTask($filter: ModelSubscriptionTaskFilterInput) {
  onUpdateTask(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    title
    description
    startTime
    startTimeInMillSec
    expireTimeInMillSec
    endTimeInMillSec
    endTime
    dayOffset
    endDayOffset
    taskType
    status
    showBeforeStart
    allowEarlyCompletion
    allowLateCompletion
    allowLateEdits
    anchors
    anchorDayOffset
    actions
    entityId
    activityIndex
    activityAnswer
    activityResponse
    syncState
    syncStateTaskAnswer
    syncStateTaskResult
    syncStatus
    hashKey
    occurrenceHashKey
    occurrenceParentHashKey
    parentTaskInstanceId
    tciSk
    studyVersion
    studyStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateTaskSubscriptionVariables,
    APITypes.OnUpdateTaskSubscription
  >;
export const onDeleteTask =
  /* GraphQL */ `subscription OnDeleteTask($filter: ModelSubscriptionTaskFilterInput) {
  onDeleteTask(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    title
    description
    startTime
    startTimeInMillSec
    expireTimeInMillSec
    endTimeInMillSec
    endTime
    dayOffset
    endDayOffset
    taskType
    status
    showBeforeStart
    allowEarlyCompletion
    allowLateCompletion
    allowLateEdits
    anchors
    anchorDayOffset
    actions
    entityId
    activityIndex
    activityAnswer
    activityResponse
    syncState
    syncStateTaskAnswer
    syncStateTaskResult
    syncStatus
    hashKey
    occurrenceHashKey
    occurrenceParentHashKey
    parentTaskInstanceId
    tciSk
    studyVersion
    studyStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteTaskSubscriptionVariables,
    APITypes.OnDeleteTaskSubscription
  >;
export const onCreateQuestion =
  /* GraphQL */ `subscription OnCreateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onCreateQuestion(filter: $filter) {
    id
    pk
    sk
    question
    questionId
    questionText
    questionEnText
    friendlyName
    answer
    controlType
    type
    validations
    codedSelection
    answerId
    answersValue
    answerEnText
    answerCodedValue
    answersImages
    value
    codedValue
    imageS3Key
    multiSelectOverride
    version
    index
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateQuestionSubscriptionVariables,
    APITypes.OnCreateQuestionSubscription
  >;
export const onUpdateQuestion =
  /* GraphQL */ `subscription OnUpdateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onUpdateQuestion(filter: $filter) {
    id
    pk
    sk
    question
    questionId
    questionText
    questionEnText
    friendlyName
    answer
    controlType
    type
    validations
    codedSelection
    answerId
    answersValue
    answerEnText
    answerCodedValue
    answersImages
    value
    codedValue
    imageS3Key
    multiSelectOverride
    version
    index
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateQuestionSubscriptionVariables,
    APITypes.OnUpdateQuestionSubscription
  >;
export const onDeleteQuestion =
  /* GraphQL */ `subscription OnDeleteQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onDeleteQuestion(filter: $filter) {
    id
    pk
    sk
    question
    questionId
    questionText
    questionEnText
    friendlyName
    answer
    controlType
    type
    validations
    codedSelection
    answerId
    answersValue
    answerEnText
    answerCodedValue
    answersImages
    value
    codedValue
    imageS3Key
    multiSelectOverride
    version
    index
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteQuestionSubscriptionVariables,
    APITypes.OnDeleteQuestionSubscription
  >;
export const onCreateActivity =
  /* GraphQL */ `subscription OnCreateActivity($filter: ModelSubscriptionActivityFilterInput) {
  onCreateActivity(filter: $filter) {
    id
    pk
    sk
    name
    title
    description
    type
    activityGroups
    layouts
    rules
    resumable
    transcribable
    respondentType
    progressBar
    displayHistoryDetail
    fontFamily
    fontWeight
    fontColor
    fontSize
    lineHeight
    s3Files
    externalContent
    calculatedValues
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateActivitySubscriptionVariables,
    APITypes.OnCreateActivitySubscription
  >;
export const onUpdateActivity =
  /* GraphQL */ `subscription OnUpdateActivity($filter: ModelSubscriptionActivityFilterInput) {
  onUpdateActivity(filter: $filter) {
    id
    pk
    sk
    name
    title
    description
    type
    activityGroups
    layouts
    rules
    resumable
    transcribable
    respondentType
    progressBar
    displayHistoryDetail
    fontFamily
    fontWeight
    fontColor
    fontSize
    lineHeight
    s3Files
    externalContent
    calculatedValues
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateActivitySubscriptionVariables,
    APITypes.OnUpdateActivitySubscription
  >;
export const onDeleteActivity =
  /* GraphQL */ `subscription OnDeleteActivity($filter: ModelSubscriptionActivityFilterInput) {
  onDeleteActivity(filter: $filter) {
    id
    pk
    sk
    name
    title
    description
    type
    activityGroups
    layouts
    rules
    resumable
    transcribable
    respondentType
    progressBar
    displayHistoryDetail
    fontFamily
    fontWeight
    fontColor
    fontSize
    lineHeight
    s3Files
    externalContent
    calculatedValues
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteActivitySubscriptionVariables,
    APITypes.OnDeleteActivitySubscription
  >;
export const onCreateDataPoint =
  /* GraphQL */ `subscription OnCreateDataPoint($filter: ModelSubscriptionDataPointFilterInput) {
  onCreateDataPoint(filter: $filter) {
    id
    pk
    sk
    dataPointKey
    type
    anchors
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateDataPointSubscriptionVariables,
    APITypes.OnCreateDataPointSubscription
  >;
export const onUpdateDataPoint =
  /* GraphQL */ `subscription OnUpdateDataPoint($filter: ModelSubscriptionDataPointFilterInput) {
  onUpdateDataPoint(filter: $filter) {
    id
    pk
    sk
    dataPointKey
    type
    anchors
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateDataPointSubscriptionVariables,
    APITypes.OnUpdateDataPointSubscription
  >;
export const onDeleteDataPoint =
  /* GraphQL */ `subscription OnDeleteDataPoint($filter: ModelSubscriptionDataPointFilterInput) {
  onDeleteDataPoint(filter: $filter) {
    id
    pk
    sk
    dataPointKey
    type
    anchors
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteDataPointSubscriptionVariables,
    APITypes.OnDeleteDataPointSubscription
  >;
export const onCreateDataPointInstance =
  /* GraphQL */ `subscription OnCreateDataPointInstance(
  $filter: ModelSubscriptionDataPointInstanceFilterInput
) {
  onCreateDataPointInstance(filter: $filter) {
    id
    pk
    sk
    dataPointKey
    type
    studyId
    patientId
    hashKey
    armId
    eventGroupId
    eventId
    activityGroupId
    activityId
    eventDayOffset
    eventTime
    questionId
    answers
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateDataPointInstanceSubscriptionVariables,
    APITypes.OnCreateDataPointInstanceSubscription
  >;
export const onUpdateDataPointInstance =
  /* GraphQL */ `subscription OnUpdateDataPointInstance(
  $filter: ModelSubscriptionDataPointInstanceFilterInput
) {
  onUpdateDataPointInstance(filter: $filter) {
    id
    pk
    sk
    dataPointKey
    type
    studyId
    patientId
    hashKey
    armId
    eventGroupId
    eventId
    activityGroupId
    activityId
    eventDayOffset
    eventTime
    questionId
    answers
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateDataPointInstanceSubscriptionVariables,
    APITypes.OnUpdateDataPointInstanceSubscription
  >;
export const onDeleteDataPointInstance =
  /* GraphQL */ `subscription OnDeleteDataPointInstance(
  $filter: ModelSubscriptionDataPointInstanceFilterInput
) {
  onDeleteDataPointInstance(filter: $filter) {
    id
    pk
    sk
    dataPointKey
    type
    studyId
    patientId
    hashKey
    armId
    eventGroupId
    eventId
    activityGroupId
    activityId
    eventDayOffset
    eventTime
    questionId
    answers
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteDataPointInstanceSubscriptionVariables,
    APITypes.OnDeleteDataPointInstanceSubscription
  >;
export const onCreateTaskAnswer =
  /* GraphQL */ `subscription OnCreateTaskAnswer(
  $filter: ModelSubscriptionTaskAnswerFilterInput
) {
  onCreateTaskAnswer(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    activityId
    questionId
    answer
    hashKey
    syncState
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateTaskAnswerSubscriptionVariables,
    APITypes.OnCreateTaskAnswerSubscription
  >;
export const onUpdateTaskAnswer =
  /* GraphQL */ `subscription OnUpdateTaskAnswer(
  $filter: ModelSubscriptionTaskAnswerFilterInput
) {
  onUpdateTaskAnswer(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    activityId
    questionId
    answer
    hashKey
    syncState
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateTaskAnswerSubscriptionVariables,
    APITypes.OnUpdateTaskAnswerSubscription
  >;
export const onDeleteTaskAnswer =
  /* GraphQL */ `subscription OnDeleteTaskAnswer(
  $filter: ModelSubscriptionTaskAnswerFilterInput
) {
  onDeleteTaskAnswer(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    activityId
    questionId
    answer
    hashKey
    syncState
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteTaskAnswerSubscriptionVariables,
    APITypes.OnDeleteTaskAnswerSubscription
  >;
export const onCreateTaskResult =
  /* GraphQL */ `subscription OnCreateTaskResult(
  $filter: ModelSubscriptionTaskResultFilterInput
) {
  onCreateTaskResult(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    status
    startedAt
    completedAt
    hashKey
    syncState
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateTaskResultSubscriptionVariables,
    APITypes.OnCreateTaskResultSubscription
  >;
export const onUpdateTaskResult =
  /* GraphQL */ `subscription OnUpdateTaskResult(
  $filter: ModelSubscriptionTaskResultFilterInput
) {
  onUpdateTaskResult(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    status
    startedAt
    completedAt
    hashKey
    syncState
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateTaskResultSubscriptionVariables,
    APITypes.OnUpdateTaskResultSubscription
  >;
export const onDeleteTaskResult =
  /* GraphQL */ `subscription OnDeleteTaskResult(
  $filter: ModelSubscriptionTaskResultFilterInput
) {
  onDeleteTaskResult(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    status
    startedAt
    completedAt
    hashKey
    syncState
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteTaskResultSubscriptionVariables,
    APITypes.OnDeleteTaskResultSubscription
  >;
export const onCreateTaskHistory =
  /* GraphQL */ `subscription OnCreateTaskHistory(
  $filter: ModelSubscriptionTaskHistoryFilterInput
) {
  onCreateTaskHistory(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    status
    statusBeforeExpired
    timestamp
    action
    details
    hashKey
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreateTaskHistorySubscriptionVariables,
    APITypes.OnCreateTaskHistorySubscription
  >;
export const onUpdateTaskHistory =
  /* GraphQL */ `subscription OnUpdateTaskHistory(
  $filter: ModelSubscriptionTaskHistoryFilterInput
) {
  onUpdateTaskHistory(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    status
    statusBeforeExpired
    timestamp
    action
    details
    hashKey
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdateTaskHistorySubscriptionVariables,
    APITypes.OnUpdateTaskHistorySubscription
  >;
export const onDeleteTaskHistory =
  /* GraphQL */ `subscription OnDeleteTaskHistory(
  $filter: ModelSubscriptionTaskHistoryFilterInput
) {
  onDeleteTaskHistory(filter: $filter) {
    id
    pk
    sk
    taskInstanceId
    status
    statusBeforeExpired
    timestamp
    action
    details
    hashKey
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeleteTaskHistorySubscriptionVariables,
    APITypes.OnDeleteTaskHistorySubscription
  >;
