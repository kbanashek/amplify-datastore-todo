import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme, useRTL, useTranslatedText } from "@orion/task-system";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { TestIds } from "../constants/testIds";
import { LanguageSelector } from "./LanguageSelector";
import { NetworkStatusIndicator } from "./NetworkStatusIndicator";

interface GlobalHeaderProps {
  title: string;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  showMenuButton = false,
  onMenuPress,
  showBackButton = false,
  onBackPress,
  rightAction,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { translatedText: translatedTitle } = useTranslatedText(title);
  const { isRTL, rtlStyle } = useRTL();

  return (
    <View style={styles.header}>
      <View style={[styles.headerTop, rtlStyle(styles.headerTop) as ViewStyle]}>
        <Text style={[styles.headerTitle, isRTL && { textAlign: "right" }]}>
          {translatedTitle}
        </Text>
        <View
          style={[
            styles.headerActions,
            rtlStyle(styles.headerActions) as ViewStyle,
          ]}
        >
          {rightAction}
          {showBackButton && onBackPress && (
            <BackButton onPress={onBackPress} />
          )}
          {showMenuButton && onMenuPress && (
            <TouchableOpacity
              onPress={onMenuPress}
              style={styles.menuButton}
              testID={TestIds.globalHeaderMenuButton}
            >
              <IconSymbol
                name="line.3.horizontal"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View
        style={[
          styles.headerBottom,
          rtlStyle(styles.headerBottom) as ViewStyle,
        ]}
      >
        <NetworkStatusIndicator />
        <LanguageSelector />
      </View>
    </View>
  );
};

// Helper component for back button with translation
const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const { translatedText } = useTranslatedText("Back");
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Text style={styles.backButtonText}>{translatedText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f3542",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuButton: {
    padding: 4,
  },
  backButton: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#57606f",
    fontSize: 14,
    fontWeight: "600",
  },
});
