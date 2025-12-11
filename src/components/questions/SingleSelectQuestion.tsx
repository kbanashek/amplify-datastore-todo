import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Question } from "../../types/ActivityConfig";
import { useTranslation } from "../../contexts/TranslationContext";

interface SingleSelectQuestionProps {
  question: Question;
  value: string | null;
  onChange: (value: string) => void;
  displayProperties: Record<string, string>;
  errors: string[];
}

export const SingleSelectQuestion: React.FC<SingleSelectQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const { translate, currentLanguage } = useTranslation();
  const choices = question.choices || [];
  const optionPlacement = displayProperties.optionPlacement || "below";
  const [translatedChoices, setTranslatedChoices] = useState<
    Array<{ id: string; text: string; value: string; translatedText?: string }>
  >(choices);

  // Translate choices when language changes
  useEffect(() => {
    const translateChoices = async () => {
      if (currentLanguage === "en") {
        setTranslatedChoices(choices);
        return;
      }

      const translated = await Promise.all(
        choices.map(async (choice) => {
          const translatedText = await translate(choice.text);
          return { ...choice, translatedText };
        })
      );
      setTranslatedChoices(translated);
    };

    translateChoices();
  }, [choices, currentLanguage, translate]);

  const handleSelect = (choiceValue: string) => {
    console.log("🔘 [SingleSelectQuestion] Option selected", {
      questionId: question.id,
      choiceValue,
      totalChoices: choices.length,
      selectedText: choices.find((c) => c.value === choiceValue || c.id === choiceValue)?.text,
    });
    onChange(choiceValue);
  };

  return (
    <View style={styles.container}>
      {translatedChoices.map((choice) => {
        const isSelected = value === choice.value || value === choice.id;
        const displayText = choice.translatedText || choice.text;
        return (
          <TouchableOpacity
            key={choice.id}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              errors.length > 0 && styles.optionError,
            ]}
            onPress={() => handleSelect(choice.value || choice.id)}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.radioButton,
                  isSelected && styles.radioButtonSelected,
                ]}
              >
                {isSelected && <View style={styles.radioButtonInner} />}
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
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#95a5a6",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#3498db",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3498db",
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

