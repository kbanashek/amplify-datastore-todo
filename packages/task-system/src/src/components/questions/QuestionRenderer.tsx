import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import { ParsedElement } from "../../types/ActivityConfig";
import { QuestionType } from "../../types/activity-config-enums";
import { DateQuestion } from "./DateQuestion";
import { MultiSelectQuestion } from "./MultiSelectQuestion";
import { NumberQuestion } from "./NumberQuestion";
import { SingleSelectQuestion } from "./SingleSelectQuestion";
import { TextQuestion } from "./TextQuestion";

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
  // Keep original case for type checking, but also have lowercase for switch
  const questionType = question.type || "";
  const questionTypeLower = questionType.toLowerCase();

  // Use currentAnswer if available (from state), otherwise fall back to patientAnswer (initial)
  const answerValue =
    currentAnswer !== undefined ? currentAnswer : patientAnswer;

  console.log("❓ [QuestionRenderer] Rendering question", {
    questionId: question.id,
    questionType,
    friendlyName: question.friendlyName,
    hasPatientAnswer: patientAnswer !== null && patientAnswer !== undefined,
    hasCurrentAnswer: currentAnswer !== undefined,
    answerValue:
      typeof answerValue === "string"
        ? answerValue.substring(0, 30)
        : answerValue,
    hasErrors: errors[question.id]?.length > 0,
  });

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

  // Build container style with proper typing
  const containerStyle: {
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

  // Get original question text (strip HTML tags)
  const originalQuestionText = question.text
    ? question.text.replace(/<[^>]*>/g, "").trim()
    : question.friendlyName || "";

  console.log("❓ [QuestionRenderer] Preparing question text for translation", {
    questionId: question.id,
    originalText: originalQuestionText.substring(0, 50),
    originalLength: originalQuestionText.length,
    hasText: !!question.text,
    hasFriendlyName: !!question.friendlyName,
  });

  // Translate question text
  const { translatedText: questionText, isTranslating: isTranslatingQuestion } =
    useTranslatedText(originalQuestionText);

  console.log("❓ [QuestionRenderer] Translation result", {
    questionId: question.id,
    original: originalQuestionText.substring(0, 50),
    translated: questionText?.substring(0, 50) || "(empty)",
    isTranslating: isTranslatingQuestion,
    changed: questionText !== originalQuestionText,
  });

  const questionErrors = errors[question.id] || [];

  // Render based on question type
  const renderQuestion = () => {
    // Check for numericScale first (case-sensitive check)
    if (
      questionType === "numericScale" ||
      questionTypeLower === "numericscale"
    ) {
      return (
        <NumberQuestion
          question={question}
          value={answerValue !== undefined ? answerValue : ""}
          onChange={value => onAnswerChange(question.id, value)}
          displayProperties={displayProperties}
          errors={questionErrors}
        />
      );
    }

    // Check for other types that need special handling
    if (
      questionType === "horizontalvas" ||
      questionTypeLower === "horizontalvas"
    ) {
      // Horizontal VAS scale - treat as numeric scale
      return (
        <NumberQuestion
          question={question}
          value={answerValue !== undefined ? answerValue : ""}
          onChange={value => onAnswerChange(question.id, value)}
          displayProperties={displayProperties}
          errors={questionErrors}
        />
      );
    }

    if (
      questionType === "bloodPressure" ||
      questionTypeLower === "bloodpressure"
    ) {
      // Blood pressure - treat as number input
      return (
        <NumberQuestion
          question={question}
          value={answerValue !== undefined ? answerValue : ""}
          onChange={value => onAnswerChange(question.id, value)}
          displayProperties={displayProperties}
          errors={questionErrors}
        />
      );
    }

    if (questionType === "weight" || questionTypeLower === "weight") {
      // Weight - treat as number input
      return (
        <NumberQuestion
          question={question}
          value={answerValue !== undefined ? answerValue : ""}
          onChange={value => onAnswerChange(question.id, value)}
          displayProperties={displayProperties}
          errors={questionErrors}
        />
      );
    }

    // Use lowercase for other standard types
    switch (questionTypeLower) {
      case QuestionType.TEXT:
      case QuestionType.TEXT_FIELD:
      case QuestionType.TEXTAREA_FIELD:
        return (
          <TextQuestion
            question={question}
            value={answerValue || ""}
            onChange={value => onAnswerChange(question.id, value)}
            displayProperties={displayProperties}
            errors={questionErrors}
          />
        );

      case QuestionType.SINGLE_SELECT:
      case QuestionType.CHOICE_FIELD:
      case QuestionType.RADIO_FIELD:
      case QuestionType.DROPDOWN_FIELD:
        return (
          <SingleSelectQuestion
            question={question}
            value={answerValue !== undefined ? answerValue : null}
            onChange={value => onAnswerChange(question.id, value)}
            displayProperties={displayProperties}
            errors={questionErrors}
          />
        );

      case QuestionType.MULTI_SELECT:
      case QuestionType.MULTI_SELECT_FIELD:
      case QuestionType.CHECKBOX_FIELD:
        return (
          <MultiSelectQuestion
            question={question}
            value={Array.isArray(answerValue) ? answerValue : []}
            onChange={value => onAnswerChange(question.id, value)}
            displayProperties={displayProperties}
            errors={questionErrors}
          />
        );

      case QuestionType.NUMBER:
      case QuestionType.NUMBER_FIELD:
        return (
          <NumberQuestion
            question={question}
            value={answerValue !== undefined ? answerValue : ""}
            onChange={value => onAnswerChange(question.id, value)}
            displayProperties={displayProperties}
            errors={questionErrors}
          />
        );

      case QuestionType.DATE:
      case QuestionType.DATE_FIELD:
      case QuestionType.DATE_TIME_FIELD:
      case QuestionType.TIME:
      case QuestionType.TIME_PICKER_FIELD:
        return (
          <DateQuestion
            question={question}
            value={answerValue !== undefined ? answerValue : null}
            onChange={value => onAnswerChange(question.id, value)}
            displayProperties={displayProperties}
            errors={questionErrors}
          />
        );

      case QuestionType.LABEL:
        return (
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { fontSize, color: fontColor }]}>
              {questionText}
            </Text>
          </View>
        );

      default:
        return (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedText}>
              Unsupported question type: {questionType}
            </Text>
            <Text style={styles.questionText}>{questionText}</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {questionType !== "label" && (
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
