import React from "react";
import { AppFonts } from "@constants/AppFonts";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Choice, Question } from "@task-types/ActivityConfig";
import { useTaskTranslation } from "@translations/index";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("MultiSelectQuestion");

interface TranslatedChoice extends Choice {
  translatedText?: string;
}

interface MultiSelectQuestionProps {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
  displayProperties: Record<string, string>;
  errors: string[];
}

export const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const { t, currentLanguage } = useTaskTranslation();
  const choices = question.choices || [];

  // Translate choices synchronously using i18next
  const translatedChoices = React.useMemo<TranslatedChoice[]>(() => {
    if (currentLanguage === "en") {
      return choices;
    }
    return choices.map(choice => ({
      ...choice,
      translatedText: t(choice.text, { fallback: choice.text }),
    }));
  }, [choices, currentLanguage, t]);

  const handleToggle = (choiceValue: string) => {
    const currentValue = Array.isArray(value) ? value : [];
    const isSelected = currentValue.includes(choiceValue);
    const choiceText = choices.find(
      c => c.value === choiceValue || c.id === choiceValue
    )?.text;

    logger.debug(
      "Toggling option",
      {
        questionId: question.id,
        choiceValue,
        choiceText,
        isSelected,
        currentSelections: currentValue,
        currentCount: currentValue.length,
      },
      undefined,
      "☑️"
    );

    if (isSelected) {
      const newValue = currentValue.filter(v => v !== choiceValue);
      logger.debug(
        "Option deselected",
        {
          questionId: question.id,
          deselected: choiceText,
          newSelections: newValue,
          newCount: newValue.length,
        },
        undefined,
        "➖"
      );
      onChange(newValue);
    } else {
      const newValue = [...currentValue, choiceValue];
      logger.debug(
        "Option selected",
        {
          questionId: question.id,
          selected: choiceText,
          newSelections: newValue,
          newCount: newValue.length,
        },
        undefined,
        "➕"
      );
      onChange(newValue);
    }
  };

  return (
    <View style={styles.container}>
      {translatedChoices.map(choice => {
        const choiceValue = choice.value || choice.id;
        const isSelected = Array.isArray(value) && value.includes(choiceValue);
        const displayText = choice.translatedText || choice.text;
        return (
          <TouchableOpacity
            key={choice.id}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              errors.length > 0 && styles.optionError,
            ]}
            onPress={() => handleToggle(choiceValue)}
          >
            <View style={styles.optionContent}>
              <View
                style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              >
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {displayText}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {choices.length === 0 && (
        <Text style={styles.noOptionsText}>No options available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe4ea",
  },
  optionSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#3498db",
  },
  optionError: {
    borderColor: "#e74c3c",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#95a5a6",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#3498db",
    backgroundColor: "#3498db",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 16,
    color: "#2f3542",
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: "#3498db",
  },
  noOptionsText: {
    fontSize: 14,
    color: "#95a5a6",
    fontStyle: "italic",
  },
});
