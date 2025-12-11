import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Question } from "../../types/ActivityConfig";
import { useTranslation } from "../../contexts/TranslationContext";

interface TextQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  displayProperties: Record<string, string>;
  errors: string[];
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const { isRTL } = useTranslation();
  const isMultiline = question.type === "textarea-field";
  const placeholder = question.friendlyName || "Enter your answer";

  const handleChange = (text: string) => {
    console.log("✏️ [TextQuestion] Value changed", {
      questionId: question.id,
      questionType: question.type,
      value: text.substring(0, 50),
      length: text.length,
      previousValue: value.substring(0, 50),
    });
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
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2f3542",
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: "#e74c3c",
  },
});

