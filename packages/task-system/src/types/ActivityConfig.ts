// TypeScript interfaces for parsed Activity JSON structure

export interface Choice {
  id: string;
  order?: number;
  text: string;
  i18nKey?: string;
  value: string;
  imageS3Key?: string | null;
}

export interface Validation {
  name?: string;
  type: string;
  value?: string;
  text?: string;
  i18nKey?: string;
  path?: string;
  comparePath?: string;
  compareFact?: string;
  warningOnly?: boolean;
}

export interface Question {
  id: string;
  type: string;
  text: string;
  i18nKey?: string;
  friendlyName: string;
  dataPointKey?: string | null;
  required?: boolean | null;
  validations?: Validation[];
  choices?: Choice[];
  codingLogic?: { [key: string]: unknown }[];
  dataMappers?: { [key: string]: unknown }[];
  questionProperties?: { [key: string]: unknown }[];
  translationKeys?: { [key: string]: unknown }[];
}

export interface DisplayProperty {
  key: string;
  value: string; // Often JSON-stringified (e.g., "\"text\"")
}

export interface Element {
  id: string;
  order?: number;
  displayProperties?: DisplayProperty[];
  question?: Question;
}

export interface Screen {
  id?: string;
  name?: string;
  order?: number;
  text?: string;
  i18nKey?: string;
  elements?: Element[];
  displayProperties?: DisplayProperty[];
}

export interface Layout {
  type: string; // "MOBILE"
  screens?: Screen[];
}

export interface ActivityGroup {
  id?: string;
  questions?: Question[];
}

export interface IntroductionScreen {
  showScreen?: boolean;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
  buttonText?: string;
  buttonTextI18nKey?: string;
}

export interface SummaryScreen {
  showScreen?: boolean;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
}

export interface CompletionScreen {
  showScreen?: boolean;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
}

export interface ActivityConfig {
  layouts?: Layout[];
  activityGroups?: ActivityGroup[];
  screens?: Screen[]; // Alternative structure
  introductionScreen?: IntroductionScreen;
  summaryScreen?: SummaryScreen;
  completionScreen?: CompletionScreen;
}

export interface ParsedElement {
  id: string;
  order: number;
  question: Question;
  displayProperties: { [key: string]: string };
  patientAnswer?: import("./AnswerValue").AnswerValue;
}

export interface ParsedScreen {
  id: string;
  name?: string;
  order: number;
  elements: ParsedElement[];
  displayProperties?: { [key: string]: string };
}
