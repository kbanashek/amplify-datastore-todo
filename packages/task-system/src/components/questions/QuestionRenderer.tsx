import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { ParsedElement } from "@task-types/ActivityConfig";
import { QuestionType } from "@task-types/activity-config-enums";
import { BloodPressureQuestion } from "@components/questions/BloodPressureQuestion";
import { ClinicalDynamicInputQuestion } from "@components/questions/ClinicalDynamicInputQuestion";
import { DateQuestion } from "@components/questions/DateQuestion";
import { HorizontalVASQuestion } from "@components/questions/HorizontalVASQuestion";
import { ImageCaptureQuestion } from "@components/questions/ImageCaptureQuestion";
import { MultiSelectQuestion } from "@components/questions/MultiSelectQuestion";
import { NumberQuestion } from "@components/questions/NumberQuestion";
import { SingleSelectQuestion } from "@components/questions/SingleSelectQuestion";
import { TemperatureQuestion } from "@components/questions/TemperatureQuestion";
import { TextQuestion } from "@components/questions/TextQuestion";
import { WeightHeightQuestion } from "@components/questions/WeightHeightQuestion";

// Component to render a single error message (extracted to avoid hooks in map)
// This must be a separate component because hooks cannot be called inside loops
// All validation messages are automatically translated
const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  const { translatedText: translatedError } = useTranslatedText(error);
  return (
    <View style={styles.errorMessageContainer}>
      <Text style={styles.errorText}>{translatedError}</Text>
    </View>
  );
};

// Component map with value transformers - single source of truth for question rendering
type QuestionConfig = {
  component: React.ComponentType<any>;
  getValue: (answerValue: any) => any;
};

const QUESTION_CONFIG: Record<string, QuestionConfig> = {
  // Text types - default to empty string
  [QuestionType.TEXT]: {
    component: TextQuestion,
    getValue: (answerValue: any) => answerValue || "",
  },
  [QuestionType.TEXT_FIELD]: {
    component: TextQuestion,
    getValue: (answerValue: any) => answerValue || "",
  },
  [QuestionType.TEXTAREA_FIELD]: {
    component: TextQuestion,
    getValue: (answerValue: any) => answerValue || "",
  },

  // Single select types - default to null
  [QuestionType.SINGLE_SELECT]: {
    component: SingleSelectQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.CHOICE_FIELD]: {
    component: SingleSelectQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.RADIO_FIELD]: {
    component: SingleSelectQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.DROPDOWN_FIELD]: {
    component: SingleSelectQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },

  // Multi select types - default to empty array
  [QuestionType.MULTI_SELECT]: {
    component: MultiSelectQuestion,
    getValue: (answerValue: any) =>
      Array.isArray(answerValue) ? answerValue : [],
  },
  [QuestionType.MULTI_SELECT_FIELD]: {
    component: MultiSelectQuestion,
    getValue: (answerValue: any) =>
      Array.isArray(answerValue) ? answerValue : [],
  },
  [QuestionType.CHECKBOX_FIELD]: {
    component: MultiSelectQuestion,
    getValue: (answerValue: any) =>
      Array.isArray(answerValue) ? answerValue : [],
  },

  // Number types - default to empty string
  [QuestionType.NUMBER]: {
    component: NumberQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : "",
  },
  [QuestionType.NUMBER_FIELD]: {
    component: NumberQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : "",
  },
  [QuestionType.NUMERIC_SCALE]: {
    component: NumberQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : "",
  },

  // Date/Time types - default to null
  [QuestionType.DATE]: {
    component: DateQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.DATE_FIELD]: {
    component: DateQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.DATE_TIME_FIELD]: {
    component: DateQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.TIME]: {
    component: DateQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.TIME_PICKER_FIELD]: {
    component: DateQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },

  // Clinical measurement types - default to null
  [QuestionType.TEMPERATURE]: {
    component: TemperatureQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.PULSE]: {
    component: ClinicalDynamicInputQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.CLINICAL_DYNAMIC_INPUT]: {
    component: ClinicalDynamicInputQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.BLOOD_PRESSURE]: {
    component: BloodPressureQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.WEIGHT]: {
    component: WeightHeightQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.HEIGHT]: {
    component: WeightHeightQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
  [QuestionType.WEIGHT_HEIGHT]: {
    component: WeightHeightQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },

  // Visual scales - default to null
  [QuestionType.HORIZONTAL_VAS]: {
    component: HorizontalVASQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },

  // Media - default to null
  [QuestionType.IMAGE_CAPTURE]: {
    component: ImageCaptureQuestion,
    getValue: (answerValue: any) =>
      answerValue !== undefined ? answerValue : null,
  },
};

// Helper to normalize question type to match enum format (handles case variations)
// This ensures all question types match the QuestionType enum values exactly
const normalizeToEnumFormat = (type: string): string => {
  if (!type) return type;
  const lower = type.toLowerCase().trim();

  // Direct mapping of all enum values (case-insensitive)
  // This maps all possible input formats to the exact enum values
  const enumMap: Record<string, string> = {
    // Clinical measurement types - these are the ones causing issues
    temperature: QuestionType.TEMPERATURE,
    pulse: QuestionType.PULSE,
    bloodpressure: QuestionType.BLOOD_PRESSURE,
    "blood-pressure": QuestionType.BLOOD_PRESSURE,
    blood_pressure: QuestionType.BLOOD_PRESSURE,
    weight: QuestionType.WEIGHT,
    height: QuestionType.HEIGHT,
    weightheight: QuestionType.WEIGHT_HEIGHT,
    "weight-height": QuestionType.WEIGHT_HEIGHT,
    weight_height: QuestionType.WEIGHT_HEIGHT,
    clinicaldynamicinput: QuestionType.CLINICAL_DYNAMIC_INPUT,
    "clinical-dynamic-input": QuestionType.CLINICAL_DYNAMIC_INPUT,
    clinical_dynamic_input: QuestionType.CLINICAL_DYNAMIC_INPUT,
    // Visual scales
    horizontalvas: QuestionType.HORIZONTAL_VAS,
    "horizontal-vas": QuestionType.HORIZONTAL_VAS,
    horizontal_vas: QuestionType.HORIZONTAL_VAS,
    // Media
    imagecapture: QuestionType.IMAGE_CAPTURE,
    "image-capture": QuestionType.IMAGE_CAPTURE,
    image_capture: QuestionType.IMAGE_CAPTURE,
    // Text types
    text: QuestionType.TEXT,
    textfield: QuestionType.TEXT_FIELD,
    "text-field": QuestionType.TEXT_FIELD,
    textareafield: QuestionType.TEXTAREA_FIELD,
    "textarea-field": QuestionType.TEXTAREA_FIELD,
    // Select types
    singleselect: QuestionType.SINGLE_SELECT,
    "choice-field": QuestionType.CHOICE_FIELD,
    "radio-field": QuestionType.RADIO_FIELD,
    "dropdown-field": QuestionType.DROPDOWN_FIELD,
    multiselect: QuestionType.MULTI_SELECT,
    "multi-select-field": QuestionType.MULTI_SELECT_FIELD,
    "checkbox-field": QuestionType.CHECKBOX_FIELD,
    // Number types
    number: QuestionType.NUMBER,
    numberfield: QuestionType.NUMBER_FIELD,
    "number-field": QuestionType.NUMBER_FIELD,
    numericscale: QuestionType.NUMERIC_SCALE,
    // Date/Time types
    date: QuestionType.DATE,
    datefield: QuestionType.DATE_FIELD,
    "date-field": QuestionType.DATE_FIELD,
    datetimefield: QuestionType.DATE_TIME_FIELD,
    "date-time-field": QuestionType.DATE_TIME_FIELD,
    time: QuestionType.TIME,
    timepickerfield: QuestionType.TIME_PICKER_FIELD,
    "time-picker-field": QuestionType.TIME_PICKER_FIELD,
    // Other
    label: QuestionType.LABEL,
  };

  // Return normalized enum value if found, otherwise return original (for backwards compatibility)
  return enumMap[lower] || type;
};

interface QuestionRendererProps {
  element: ParsedElement;
  currentAnswer?: any; // Current answer from state (not just initial patientAnswer)
  onAnswerChange: (questionId: string, answer: any) => void;
  errors?: Record<string, string[]>;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  element,
  currentAnswer,
  onAnswerChange,
  errors = {},
}) => {
  const { question, displayProperties, patientAnswer } = element;
  // Normalize question type to match enum format for consistent comparison
  const rawType = (question.type || "").trim();
  const questionType = normalizeToEnumFormat(rawType);

  // Use currentAnswer if available (from state), otherwise fall back to patientAnswer (initial)
  const answerValue =
    currentAnswer !== undefined ? currentAnswer : patientAnswer;

  // Get display properties
  const width = displayProperties.width || "100%";
  const fontSize = displayProperties.fontSize
    ? parseInt(displayProperties.fontSize, 10)
    : 16;
  const fontColor = displayProperties.fontColor || "#000000";
  const marginLeft = displayProperties.marginLeft
    ? parseInt(displayProperties.marginLeft, 10)
    : 0;
  const marginRight = displayProperties.marginRight
    ? parseInt(displayProperties.marginRight, 10)
    : 0;
  const paddingLeft = displayProperties.paddingLeft
    ? parseInt(displayProperties.paddingLeft, 10)
    : 0;
  const paddingRight = displayProperties.paddingRight
    ? parseInt(displayProperties.paddingRight, 10)
    : 0;

  // Build container style with proper typing - memoized to prevent recreation
  const containerStyle = useMemo(() => {
    const style: {
      width?: number | "100%";
      marginLeft: number;
      marginRight: number;
      paddingLeft: number;
      paddingRight: number;
    } = {
      ...(width === "100%"
        ? { width: "100%" as const }
        : width
          ? { width: parseFloat(width) || undefined }
          : {}),
      marginLeft,
      marginRight,
      paddingLeft,
      paddingRight,
    };
    return style;
  }, [width, marginLeft, marginRight, paddingLeft, paddingRight]);

  // Get original question text (strip HTML tags)
  const originalQuestionText = question.text
    ? question.text.replace(/<[^>]*>/g, "").trim()
    : question.friendlyName || "";

  // Translate question text
  const { translatedText: questionText } =
    useTranslatedText(originalQuestionText);

  const questionErrors = errors[question.id] || [];

  // Memoize onChange handler to prevent infinite re-renders
  const handleAnswerChange = useCallback(
    (value: any) => {
      onAnswerChange(question.id, value);
    },
    [question.id, onAnswerChange]
  );

  // Parse questionProperties to determine behavior
  const questionProperties = useMemo(() => {
    const props: Record<string, string> = {};
    if (question.questionProperties) {
      question.questionProperties.forEach(
        (prop: { key: string; value: string }) => {
          props[prop.key] = prop.value;
        }
      );
    }
    return props;
  }, [question.questionProperties]);

  // For multiselect questions, check multipleselect property to determine single vs multiple
  const effectiveQuestionType = useMemo(() => {
    // If question type is multiselect, check questionProperties
    if (
      questionType === QuestionType.MULTI_SELECT ||
      rawType.toLowerCase() === "multiselect"
    ) {
      const multipleselect = questionProperties.multipleselect;
      // If multipleselect is "false", treat as single select
      if (multipleselect === "false") {
        return QuestionType.SINGLE_SELECT;
      }
      // If multipleselect is "true" or not set, treat as multi select
      return QuestionType.MULTI_SELECT;
    }
    return questionType;
  }, [questionType, rawType, questionProperties]);

  // Memoize transformed value to prevent unnecessary recalculations
  const config = QUESTION_CONFIG[effectiveQuestionType];
  const transformedValue = useMemo(() => {
    if (!config) return undefined;
    return config.getValue(answerValue);
  }, [config, answerValue]);

  // Render based on question type using component map
  const renderQuestion = () => {
    // Handle special case: LABEL (doesn't use a component)
    if (effectiveQuestionType === QuestionType.LABEL) {
      return (
        <View style={styles.labelContainer}>
          <Text style={[styles.labelText, { fontSize, color: fontColor }]}>
            {questionText}
          </Text>
        </View>
      );
    }

    if (!config) {
      return (
        <View style={styles.unsupportedContainer}>
          <Text style={styles.unsupportedText}>
            Unsupported question type: {effectiveQuestionType}
          </Text>
          <Text style={styles.questionText}>{questionText}</Text>
        </View>
      );
    }

    // Render component with transformed value
    const QuestionComponent = config.component;

    return (
      <QuestionComponent
        question={question}
        value={transformedValue}
        onChange={handleAnswerChange}
        displayProperties={displayProperties}
        errors={questionErrors}
      />
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {effectiveQuestionType !== QuestionType.LABEL && (
        <Text style={[styles.questionText, { fontSize, color: fontColor }]}>
          {questionText}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {renderQuestion()}
      {questionErrors.length > 0 && (
        <View style={styles.errorsContainer}>
          {questionErrors.map((error, index) => (
            <ErrorMessage key={index} error={error} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2f3542",
    marginBottom: 12,
  },
  required: {
    color: "#e74c3c",
  },
  labelContainer: {
    marginBottom: 16,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  unsupportedContainer: {
    padding: 16,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  unsupportedText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "600",
    marginBottom: 8,
  },
  errorsContainer: {
    marginTop: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  errorMessageContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "500",
    lineHeight: 20,
  },
});
