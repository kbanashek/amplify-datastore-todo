import React from "react";
import { Text, TextProps } from "react-native";
import { useTranslatedText } from "@orion/task-system";
import { useTranslation } from "@orion/task-system";

interface TranslatedTextProps extends Omit<TextProps, "children"> {
  text: string;
  sourceLanguage?: string;
}

/**
 * Component that automatically translates text based on current language
 * Also applies RTL text alignment for RTL languages
 * Usage: <TranslatedText text="Hello" />
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  sourceLanguage,
  style,
  ...props
}) => {
  const { translatedText } = useTranslatedText(text, sourceLanguage);
  const { isRTL } = useTranslation();

  return (
    <Text style={[style, isRTL && { textAlign: "right" }]} {...props}>
      {translatedText}
    </Text>
  );
};
