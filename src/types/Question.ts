export interface Question {
  id: string;
  pk: string;
  sk: string;
  question: string;
  questionId: string;
  questionText?: string | null;
  questionEnText?: string | null;
  friendlyName: string;
  
  // Answer (stored as JSON string)
  answer?: string | null;
  
  // Type & Control
  controlType: string;
  type?: string | null;
  
  // Validation (stored as JSON string)
  validations?: string | null;
  
  // Choice Questions
  codedSelection?: number | string | null;
  answerId?: string | null;
  answersValue?: string | null;
  answerEnText?: string | null;
  answerCodedValue?: string | null;
  answersImages?: string | null;
  
  // Display
  value?: string | null;
  codedValue?: number | null;
  imageS3Key?: string | null;
  multiSelectOverride?: string | null;
  
  // Metadata
  version: number;
  index: number;
  
  // DataStore fields
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
  _lastChangedAt?: number | null;
}

export interface CreateQuestionInput {
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
  codedSelection?: number | string | null;
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
}

export interface UpdateQuestionInput {
  id: string;
  question?: string | null;
  questionText?: string | null;
  questionEnText?: string | null;
  friendlyName?: string | null;
  answer?: string | null;
  controlType?: string | null;
  type?: string | null;
  validations?: string | null;
  codedSelection?: number | string | null;
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
}



