/* tslint:disable */

// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createTodo = /* GraphQL */ `mutation CreateTodo(
  $input: CreateTodoInput!
  $condition: ModelTodoConditionInput
) {
  createTodo(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTodoMutationVariables,
  APITypes.CreateTodoMutation
>;
export const updateTodo = /* GraphQL */ `mutation UpdateTodo(
  $input: UpdateTodoInput!
  $condition: ModelTodoConditionInput
) {
  updateTodo(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTodoMutationVariables,
  APITypes.UpdateTodoMutation
>;
export const deleteTodo = /* GraphQL */ `mutation DeleteTodo(
  $input: DeleteTodoInput!
  $condition: ModelTodoConditionInput
) {
  deleteTodo(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTodoMutationVariables,
  APITypes.DeleteTodoMutation
>;
export const createTask = /* GraphQL */ `mutation CreateTask(
  $input: CreateTaskInput!
  $condition: ModelTaskConditionInput
) {
  createTask(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTaskMutationVariables,
  APITypes.CreateTaskMutation
>;
export const updateTask = /* GraphQL */ `mutation UpdateTask(
  $input: UpdateTaskInput!
  $condition: ModelTaskConditionInput
) {
  updateTask(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTaskMutationVariables,
  APITypes.UpdateTaskMutation
>;
export const deleteTask = /* GraphQL */ `mutation DeleteTask(
  $input: DeleteTaskInput!
  $condition: ModelTaskConditionInput
) {
  deleteTask(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTaskMutationVariables,
  APITypes.DeleteTaskMutation
>;
export const createQuestion = /* GraphQL */ `mutation CreateQuestion(
  $input: CreateQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  createQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateQuestionMutationVariables,
  APITypes.CreateQuestionMutation
>;
export const updateQuestion = /* GraphQL */ `mutation UpdateQuestion(
  $input: UpdateQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  updateQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateQuestionMutationVariables,
  APITypes.UpdateQuestionMutation
>;
export const deleteQuestion = /* GraphQL */ `mutation DeleteQuestion(
  $input: DeleteQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  deleteQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteQuestionMutationVariables,
  APITypes.DeleteQuestionMutation
>;
export const createActivity = /* GraphQL */ `mutation CreateActivity(
  $input: CreateActivityInput!
  $condition: ModelActivityConditionInput
) {
  createActivity(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateActivityMutationVariables,
  APITypes.CreateActivityMutation
>;
export const updateActivity = /* GraphQL */ `mutation UpdateActivity(
  $input: UpdateActivityInput!
  $condition: ModelActivityConditionInput
) {
  updateActivity(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateActivityMutationVariables,
  APITypes.UpdateActivityMutation
>;
export const deleteActivity = /* GraphQL */ `mutation DeleteActivity(
  $input: DeleteActivityInput!
  $condition: ModelActivityConditionInput
) {
  deleteActivity(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteActivityMutationVariables,
  APITypes.DeleteActivityMutation
>;
export const createDataPoint = /* GraphQL */ `mutation CreateDataPoint(
  $input: CreateDataPointInput!
  $condition: ModelDataPointConditionInput
) {
  createDataPoint(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateDataPointMutationVariables,
  APITypes.CreateDataPointMutation
>;
export const updateDataPoint = /* GraphQL */ `mutation UpdateDataPoint(
  $input: UpdateDataPointInput!
  $condition: ModelDataPointConditionInput
) {
  updateDataPoint(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateDataPointMutationVariables,
  APITypes.UpdateDataPointMutation
>;
export const deleteDataPoint = /* GraphQL */ `mutation DeleteDataPoint(
  $input: DeleteDataPointInput!
  $condition: ModelDataPointConditionInput
) {
  deleteDataPoint(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteDataPointMutationVariables,
  APITypes.DeleteDataPointMutation
>;
export const createDataPointInstance =
  /* GraphQL */ `mutation CreateDataPointInstance(
  $input: CreateDataPointInstanceInput!
  $condition: ModelDataPointInstanceConditionInput
) {
  createDataPointInstance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
    APITypes.CreateDataPointInstanceMutationVariables,
    APITypes.CreateDataPointInstanceMutation
  >;
export const updateDataPointInstance =
  /* GraphQL */ `mutation UpdateDataPointInstance(
  $input: UpdateDataPointInstanceInput!
  $condition: ModelDataPointInstanceConditionInput
) {
  updateDataPointInstance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
    APITypes.UpdateDataPointInstanceMutationVariables,
    APITypes.UpdateDataPointInstanceMutation
  >;
export const deleteDataPointInstance =
  /* GraphQL */ `mutation DeleteDataPointInstance(
  $input: DeleteDataPointInstanceInput!
  $condition: ModelDataPointInstanceConditionInput
) {
  deleteDataPointInstance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
    APITypes.DeleteDataPointInstanceMutationVariables,
    APITypes.DeleteDataPointInstanceMutation
  >;
export const createTaskAnswer = /* GraphQL */ `mutation CreateTaskAnswer(
  $input: CreateTaskAnswerInput!
  $condition: ModelTaskAnswerConditionInput
) {
  createTaskAnswer(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTaskAnswerMutationVariables,
  APITypes.CreateTaskAnswerMutation
>;
export const updateTaskAnswer = /* GraphQL */ `mutation UpdateTaskAnswer(
  $input: UpdateTaskAnswerInput!
  $condition: ModelTaskAnswerConditionInput
) {
  updateTaskAnswer(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTaskAnswerMutationVariables,
  APITypes.UpdateTaskAnswerMutation
>;
export const deleteTaskAnswer = /* GraphQL */ `mutation DeleteTaskAnswer(
  $input: DeleteTaskAnswerInput!
  $condition: ModelTaskAnswerConditionInput
) {
  deleteTaskAnswer(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTaskAnswerMutationVariables,
  APITypes.DeleteTaskAnswerMutation
>;
export const createTaskResult = /* GraphQL */ `mutation CreateTaskResult(
  $input: CreateTaskResultInput!
  $condition: ModelTaskResultConditionInput
) {
  createTaskResult(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTaskResultMutationVariables,
  APITypes.CreateTaskResultMutation
>;
export const updateTaskResult = /* GraphQL */ `mutation UpdateTaskResult(
  $input: UpdateTaskResultInput!
  $condition: ModelTaskResultConditionInput
) {
  updateTaskResult(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTaskResultMutationVariables,
  APITypes.UpdateTaskResultMutation
>;
export const deleteTaskResult = /* GraphQL */ `mutation DeleteTaskResult(
  $input: DeleteTaskResultInput!
  $condition: ModelTaskResultConditionInput
) {
  deleteTaskResult(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTaskResultMutationVariables,
  APITypes.DeleteTaskResultMutation
>;
export const createTaskHistory = /* GraphQL */ `mutation CreateTaskHistory(
  $input: CreateTaskHistoryInput!
  $condition: ModelTaskHistoryConditionInput
) {
  createTaskHistory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTaskHistoryMutationVariables,
  APITypes.CreateTaskHistoryMutation
>;
export const updateTaskHistory = /* GraphQL */ `mutation UpdateTaskHistory(
  $input: UpdateTaskHistoryInput!
  $condition: ModelTaskHistoryConditionInput
) {
  updateTaskHistory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTaskHistoryMutationVariables,
  APITypes.UpdateTaskHistoryMutation
>;
export const deleteTaskHistory = /* GraphQL */ `mutation DeleteTaskHistory(
  $input: DeleteTaskHistoryInput!
  $condition: ModelTaskHistoryConditionInput
) {
  deleteTaskHistory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTaskHistoryMutationVariables,
  APITypes.DeleteTaskHistoryMutation
>;
