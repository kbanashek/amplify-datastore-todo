import React from "react";
import { Text, TextProps } from "react-native";
import { useTranslatedText } from "../hooks/useTranslatedText";
import { useTranslation } from "../contexts/TranslationContext";
import { getServiceLogger } from "../utils/serviceLogger";

const logger = getServiceLogger("TranslatedText");

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
  const { translatedText, isTranslating } = useTranslatedText(
    text,
    sourceLanguage
  );
  const { isRTL, currentLanguage } = useTranslation();

  const prevTranslatedTextRef = React.useRef<string>(translatedText);
  const prevLanguageRef = React.useRef<string>(currentLanguage);

  // Log when translation changes
  React.useEffect(() => {
    const translationChanged = prevTranslatedTextRef.current !== translatedText;
    const languageChanged = prevLanguageRef.current !== currentLanguage;
    const textChanged = translatedText !== text;

    logger.debug(
      "TranslatedText rendered/updated",
      {
        original: text?.substring(0, 30) || "(empty)",
        translated: translatedText?.substring(0, 30) || "(empty)",
        previousTranslated:
          prevTranslatedTextRef.current?.substring(0, 30) || "(empty)",
        currentLanguage,
        previousLanguage: prevLanguageRef.current,
        isTranslating,
        translationChanged,
        languageChanged,
        textChanged,
        willUpdateUI: translationChanged || languageChanged,
        textKey: `translated-${currentLanguage}-${text?.substring(0, 20)}`,
      },
      undefined,
      "🔤"
    );

    prevTranslatedTextRef.current = translatedText;
    prevLanguageRef.current = currentLanguage;
  }, [text, translatedText, currentLanguage, isTranslating]);

  // Force remount when language changes to ensure fresh translation state
  // This is necessary because React Native Text components sometimes don't update
  // when the text content changes, especially after language switches
  return (
    <Text
      key={`translated-${currentLanguage}-${text?.substring(0, 20)}`}
      style={[style, isRTL && { textAlign: "right" }]}
      {...props}
    >
      {translatedText}
    </Text>
  );
};
