/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTodo = /* GraphQL */ `query GetTodo($id: ID!) {
  getTodo(id: $id) {
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
` as GeneratedQuery<APITypes.GetTodoQueryVariables, APITypes.GetTodoQuery>;
export const listTodos = /* GraphQL */ `query ListTodos(
  $filter: ModelTodoFilterInput
  $limit: Int
  $nextToken: String
) {
  listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTodosQueryVariables, APITypes.ListTodosQuery>;
export const syncTodos = /* GraphQL */ `query SyncTodos(
  $filter: ModelTodoFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncTodos(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.SyncTodosQueryVariables, APITypes.SyncTodosQuery>;
export const getTask = /* GraphQL */ `query GetTask($id: ID!) {
  getTask(id: $id) {
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
` as GeneratedQuery<APITypes.GetTaskQueryVariables, APITypes.GetTaskQuery>;
export const listTasks = /* GraphQL */ `query ListTasks(
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
) {
  listTasks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTasksQueryVariables, APITypes.ListTasksQuery>;
export const syncTasks = /* GraphQL */ `query SyncTasks(
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncTasks(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.SyncTasksQueryVariables, APITypes.SyncTasksQuery>;
export const getQuestion = /* GraphQL */ `query GetQuestion($id: ID!) {
  getQuestion(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetQuestionQueryVariables,
  APITypes.GetQuestionQuery
>;
export const listQuestions = /* GraphQL */ `query ListQuestions(
  $filter: ModelQuestionFilterInput
  $limit: Int
  $nextToken: String
) {
  listQuestions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListQuestionsQueryVariables,
  APITypes.ListQuestionsQuery
>;
export const syncQuestions = /* GraphQL */ `query SyncQuestions(
  $filter: ModelQuestionFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncQuestions(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncQuestionsQueryVariables,
  APITypes.SyncQuestionsQuery
>;
export const getActivity = /* GraphQL */ `query GetActivity($id: ID!) {
  getActivity(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetActivityQueryVariables,
  APITypes.GetActivityQuery
>;
export const listActivities = /* GraphQL */ `query ListActivities(
  $filter: ModelActivityFilterInput
  $limit: Int
  $nextToken: String
) {
  listActivities(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListActivitiesQueryVariables,
  APITypes.ListActivitiesQuery
>;
export const syncActivities = /* GraphQL */ `query SyncActivities(
  $filter: ModelActivityFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncActivities(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncActivitiesQueryVariables,
  APITypes.SyncActivitiesQuery
>;
export const getDataPoint = /* GraphQL */ `query GetDataPoint($id: ID!) {
  getDataPoint(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDataPointQueryVariables,
  APITypes.GetDataPointQuery
>;
export const listDataPoints = /* GraphQL */ `query ListDataPoints(
  $filter: ModelDataPointFilterInput
  $limit: Int
  $nextToken: String
) {
  listDataPoints(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDataPointsQueryVariables,
  APITypes.ListDataPointsQuery
>;
export const syncDataPoints = /* GraphQL */ `query SyncDataPoints(
  $filter: ModelDataPointFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncDataPoints(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncDataPointsQueryVariables,
  APITypes.SyncDataPointsQuery
>;
export const getDataPointInstance =
  /* GraphQL */ `query GetDataPointInstance($id: ID!) {
  getDataPointInstance(id: $id) {
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
` as GeneratedQuery<
    APITypes.GetDataPointInstanceQueryVariables,
    APITypes.GetDataPointInstanceQuery
  >;
export const listDataPointInstances =
  /* GraphQL */ `query ListDataPointInstances(
  $filter: ModelDataPointInstanceFilterInput
  $limit: Int
  $nextToken: String
) {
  listDataPointInstances(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
    APITypes.ListDataPointInstancesQueryVariables,
    APITypes.ListDataPointInstancesQuery
  >;
export const syncDataPointInstances =
  /* GraphQL */ `query SyncDataPointInstances(
  $filter: ModelDataPointInstanceFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncDataPointInstances(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
    APITypes.SyncDataPointInstancesQueryVariables,
    APITypes.SyncDataPointInstancesQuery
  >;
export const getTaskAnswer = /* GraphQL */ `query GetTaskAnswer($id: ID!) {
  getTaskAnswer(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetTaskAnswerQueryVariables,
  APITypes.GetTaskAnswerQuery
>;
export const listTaskAnswers = /* GraphQL */ `query ListTaskAnswers(
  $filter: ModelTaskAnswerFilterInput
  $limit: Int
  $nextToken: String
) {
  listTaskAnswers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTaskAnswersQueryVariables,
  APITypes.ListTaskAnswersQuery
>;
export const syncTaskAnswers = /* GraphQL */ `query SyncTaskAnswers(
  $filter: ModelTaskAnswerFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncTaskAnswers(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncTaskAnswersQueryVariables,
  APITypes.SyncTaskAnswersQuery
>;
export const getTaskResult = /* GraphQL */ `query GetTaskResult($id: ID!) {
  getTaskResult(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetTaskResultQueryVariables,
  APITypes.GetTaskResultQuery
>;
export const listTaskResults = /* GraphQL */ `query ListTaskResults(
  $filter: ModelTaskResultFilterInput
  $limit: Int
  $nextToken: String
) {
  listTaskResults(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTaskResultsQueryVariables,
  APITypes.ListTaskResultsQuery
>;
export const syncTaskResults = /* GraphQL */ `query SyncTaskResults(
  $filter: ModelTaskResultFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncTaskResults(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncTaskResultsQueryVariables,
  APITypes.SyncTaskResultsQuery
>;
export const getTaskHistory = /* GraphQL */ `query GetTaskHistory($id: ID!) {
  getTaskHistory(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetTaskHistoryQueryVariables,
  APITypes.GetTaskHistoryQuery
>;
export const listTaskHistories = /* GraphQL */ `query ListTaskHistories(
  $filter: ModelTaskHistoryFilterInput
  $limit: Int
  $nextToken: String
) {
  listTaskHistories(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTaskHistoriesQueryVariables,
  APITypes.ListTaskHistoriesQuery
>;
export const syncTaskHistories = /* GraphQL */ `query SyncTaskHistories(
  $filter: ModelTaskHistoryFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncTaskHistories(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncTaskHistoriesQueryVariables,
  APITypes.SyncTaskHistoriesQuery
>;
