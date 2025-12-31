/**
 * TextQuestion component module.
 *
 * @module TextQuestion
 */

import React from "react";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import { StyleSheet, TextInput, View } from "react-native";
import { Question } from "@task-types/ActivityConfig";
import { useTaskTranslation } from "@translations/index";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("TextQuestion");

/**
 * Props for the TextQuestion component
 */
interface TextQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  displayProperties: Record<string, string>;
  errors: string[];
}

/**
 * TextQuestion component.
 *
 * @param props - Component props
 * @returns Rendered TextQuestion component
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
