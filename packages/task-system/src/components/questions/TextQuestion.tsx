/**
 * TextQuestion component module.
 *
 * @module TextQuestion
 */

import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { Question } from "@task-types/ActivityConfig";
import { useTaskTranslation } from "@translations/index";
import { getServiceLogger } from "@utils/serviceLogger";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const logger = getServiceLogger("TextQuestion");

/**
 * Props for the TextQuestion component
 */
interface TextQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  displayProperties: { [key: string]: string };
  errors: string[];
}

/**
 * TextQuestion component for rendering single-line or multi-line text input questions.
 *
 * Handles text input with support for RTL languages, automatic multiline detection,
 * placeholder translation, and input validation with error display.
 *
 * @param props - Component props
 * @param props.question - Question configuration object
 * @param props.value - Current text value
 * @param props.onChange - Callback invoked when text changes
 * @param props.displayProperties - Display configuration properties
 * @param props.errors - Array of validation error messages
 * @returns React component that renders a text input field
 *
 * @example
 * ```tsx
 * <TextQuestion
 *   question={{ type: 'text-field', friendlyName: 'Full Name' }}
 *   value={name}
 *   onChange={setName}
 *   displayProperties={{}}
 *   errors={[]}
 * />
 * ```
 */
export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const { isRTL } = useTaskTranslation();
  const isMultiline = question.type === "textarea-field";
  const placeholderText = question.friendlyName || "Enter your answer";
  const { translatedText: placeholder } = useTranslatedText(placeholderText);

  const handleChange = (text: string) => {
    logger.debug(
      "Value changed",
      {
        questionId: question.id,
        questionType: question.type,
        value: text.substring(0, 50),
        length: text.length,
        previousValue: value.substring(0, 50),
      },
      undefined,
      "✏️"
    );
    onChange(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          isMultiline && styles.textArea,
          errors.length > 0 && styles.inputError,
          isRTL && { textAlign: "right" },
        ]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 4 : 1}
        textAlignVertical={isMultiline ? "top" : "center"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  input: {
    backgroundColor: AppColors.powderGray,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 8,
    padding: 12,
    ...AppFonts.body,
    color: AppColors.almostBlack,
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: AppColors.errorRed,
  },
});
