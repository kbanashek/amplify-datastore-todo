import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useRTL } from "@hooks/useRTL";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { IconSymbol } from "@components/ui/IconSymbol";

interface QuestionHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showCloseButton?: boolean;
  onClosePress?: () => void;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showCloseButton = false,
  onClosePress,
}) => {
  const { translatedText: translatedTitle } = useTranslatedText(title);
  const { isRTL, rtlStyle } = useRTL();

  return (
    <View style={styles.header}>
      <View style={[styles.headerTop, rtlStyle(styles.headerTop) as ViewStyle]}>
        {/* Left side: Back button */}
        <View style={styles.headerLeft}>
          {showBackButton && onBackPress ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="#6b7280" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center: Title - can wrap to multiple lines */}
        <Text style={[styles.headerTitle, isRTL && { textAlign: "right" }]}>
          {translatedTitle}
        </Text>

        {/* Right side: Close button and Language selector */}
        <View style={styles.headerRight}>
          {showCloseButton && onClosePress && (
            <TouchableOpacity onPress={onClosePress} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color="#6b7280" />
            </TouchableOpacity>
          )}
          {/* <LanguageSelector style={styles.languageSelector} /> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    width: "100%",
    alignSelf: "stretch",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingVertical: 12,
    minHeight: 44,
  },
  headerLeft: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e40af",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 8,
    // Allow text to wrap to multiple lines
    flexWrap: "wrap",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    minWidth: 44,
    paddingRight: 16,
  },
  backButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  languageSelector: {
    marginLeft: 8,
  },
  placeholder: {
    width: 44,
  },
});
