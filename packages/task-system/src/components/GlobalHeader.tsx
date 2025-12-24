import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { AppColors } from "@constants/AppColors";
import { Colors } from "@constants/Colors";
import { TestIds } from "@constants/testIds";
import { useColorScheme } from "@hooks/useColorScheme";
import { useRTL } from "@hooks/useRTL";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { NetworkStatusIndicator } from "@components/NetworkStatusIndicator";
import { LanguageSelector } from "@components/LanguageSelector";
import { IconSymbol } from "@components/ui/IconSymbol";

interface GlobalHeaderProps {
  title: string;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showCloseButton?: boolean;
  onClosePress?: () => void;
  rightAction?: React.ReactNode;
  hideBottomSection?: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  showMenuButton = false,
  onMenuPress,
  showBackButton = false,
  onBackPress,
  showCloseButton = false,
  onClosePress,
  rightAction,
  hideBottomSection = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { translatedText: translatedTitle } = useTranslatedText(title);
  const { isRTL, rtlStyle } = useRTL();

  return (
    <View style={styles.header}>
      <View style={[styles.headerTop, rtlStyle(styles.headerTop) as ViewStyle]}>
        {/* Left side: Back button */}
        <View style={styles.headerLeft}>
          {showBackButton && onBackPress && (
            <BackButton onPress={onBackPress} />
          )}
        </View>

        {/* Center: Title */}
        <Text style={[styles.headerTitle, isRTL && { textAlign: "right" }]}>
          {translatedTitle}
        </Text>

        {/* Right side: Close button, menu, or custom action */}
        <View
          style={[
            styles.headerActions,
            rtlStyle(styles.headerActions) as ViewStyle,
          ]}
        >
          {showCloseButton && onClosePress && (
            <TouchableOpacity onPress={onClosePress} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={AppColors.iconGray} />
            </TouchableOpacity>
          )}
          {rightAction}
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
      {!hideBottomSection && (
        <View
          style={[
            styles.headerBottom,
            rtlStyle(styles.headerBottom) as ViewStyle,
          ]}
        >
          <NetworkStatusIndicator />
          <LanguageSelector />
        </View>
      )}
    </View>
  );
};

// Helper component for back button with arrow icon
const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <IconSymbol name="chevron.left" size={24} color={AppColors.iconGray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderGray,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  headerLeft: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: AppColors.headerBlue,
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    width: 44,
    justifyContent: "flex-end",
  },
  closeButton: {
    padding: 4,
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
    padding: 4,
  },
});
