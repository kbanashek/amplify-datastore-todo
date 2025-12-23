/**
 * Centralized constants for ActivityConfig parsing/rendering.
 *
 * These avoid scattering hard-coded strings like "min"/"max"/"date-time-field"
 * across the codebase.
 */

export const ValidationType = {
  REQUIRED: "required",
  MIN: "min",
  MAX: "max",
  PATTERN: "pattern",
  EMAIL: "email",
  URL: "url",
  MIN_LENGTH: "minLength",
  MAX_LENGTH: "maxLength",
  COMPARE: "compare",
} as const;

export type ValidationTypeValue =
  (typeof ValidationType)[keyof typeof ValidationType];

export const QuestionType = {
  // Text
  TEXT: "text",
  TEXT_FIELD: "text-field",
  TEXTAREA_FIELD: "textarea-field",

  // Single select
  SINGLE_SELECT: "singleselect",
  CHOICE_FIELD: "choice-field",
  RADIO_FIELD: "radio-field",
  DROPDOWN_FIELD: "dropdown-field",

  // Multi select
  MULTI_SELECT: "multiselect",
  MULTI_SELECT_FIELD: "multi-select-field",
  CHECKBOX_FIELD: "checkbox-field",

  // Number
  NUMBER: "number",
  NUMBER_FIELD: "number-field",
  NUMERIC_SCALE: "numericScale",

  // Date/Time
  DATE: "date",
  DATE_FIELD: "date-field",
  DATE_TIME_FIELD: "date-time-field",
  TIME: "time",
  TIME_PICKER_FIELD: "time-picker-field",

  // Clinical measurements
  BLOOD_PRESSURE: "bloodPressure",
  TEMPERATURE: "temperature",
  PULSE: "pulse",
  WEIGHT: "weight",
  HEIGHT: "height",
  WEIGHT_HEIGHT: "weightHeight",
  CLINICAL_DYNAMIC_INPUT: "clinicalDynamicInput",

  // Visual scales
  HORIZONTAL_VAS: "horizontalVAS",
  VERTICAL_VAS: "verticalVAS",
  NUMERIC_RATING_SCALE: "numericRatingScale",

  // Media
  IMAGE_CAPTURE: "imageCapture",

  // Other
  LABEL: "label",
} as const;

export type QuestionTypeValue =
  (typeof QuestionType)[keyof typeof QuestionType];

export const CompareFact = {
  GREATER_THAN: "greaterThan",
  LESS_THAN: "lessThan",
  EQUAL: "equal",
  NOT_EQUAL: "notEqual",
} as const;

export type CompareFactValue = (typeof CompareFact)[keyof typeof CompareFact];
