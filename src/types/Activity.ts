export interface Activity {
  id: string;
  pk: string;
  sk: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;

  // Activity Structure (stored as JSON strings)
  activityGroups?: string | null;
  layouts?: string | null;
  rules?: string | null;

  // Configuration
  resumable?: boolean | null;
  transcribable?: boolean | null;
  respondentType?: string | null;
  progressBar?: boolean | null;
  displayHistoryDetail?: string | null;

  // Styling
  fontFamily?: string | null;
  fontWeight?: number | null;
  fontColor?: string | null;
  fontSize?: number | null;
  lineHeight?: string | null;

  // External Content (stored as JSON strings)
  s3Files?: string | null;
  externalContent?: string | null;
  calculatedValues?: string | null;

  // DataStore fields
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
  _lastChangedAt?: number | null;
}

export interface CreateActivityInput {
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
}

export interface UpdateActivityInput {
  id: string;
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
}


