import { LanguageSelector } from "@components/LanguageSelector";
import { NetworkStatusIndicator } from "@components/NetworkStatusIndicator";
import { IconSymbol } from "@components/ui/IconSymbol";
import { AppColors } from "@constants/AppColors";
import { Colors } from "@constants/Colors";
import { TestIds } from "@constants/testIds";
import { useColorScheme } from "@hooks/useColorScheme";
import { useRTL } from "@hooks/useRTL";
import { useTranslatedText } from "@hooks/useTranslatedText";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

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

/**
 * A header component for the global navigation.
 *
 * @param title - The title to display in the header
 * @param showMenuButton - Whether to show the menu button
 * @param onMenuPress - Callback function when the menu button is pressed
 * @param showBackButton - Whether to show the back button
 * @param onBackPress - Callback function when the back button is pressed
 * @param showCloseButton - Whether to show the close button
 * @param onClosePress - Callback function when the close button is pressed
 * @param rightAction - Optional custom action to display on the right side
 * @param hideBottomSection - Whether to hide the bottom section
 * @returns A header component with the provided configuration
 */
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
    <View style={styles.header} testID="global-header">
      <View
        style={[styles.headerTop, rtlStyle(styles.headerTop) as ViewStyle]}
        testID="global-header-top"
      >
        {/* Left side: Back button */}
        <View style={styles.headerLeft} testID="global-header-left">
          {showBackButton && onBackPress && (
            <BackButton onPress={onBackPress} />
          )}
        </View>

        {/* Center: Title */}
        <Text
          style={[styles.headerTitle, isRTL && { textAlign: "right" }]}
          testID="global-header-title"
        >
          {translatedTitle}
        </Text>

        {/* Right side: Close button, menu, or custom action */}
        <View
          style={[
            styles.headerActions,
            rtlStyle(styles.headerActions) as ViewStyle,
          ]}
          testID="global-header-actions"
        >
          {showCloseButton && onClosePress && (
            <TouchableOpacity
              onPress={onClosePress}
              style={styles.closeButton}
              testID="global-header-close-button"
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <IconSymbol name="xmark" size={24} color={AppColors.iconGray} />
            </TouchableOpacity>
          )}
          {rightAction}
          {showMenuButton && onMenuPress && (
            <TouchableOpacity
              onPress={onMenuPress}
              style={styles.menuButton}
              testID="global-header-menu-button"
              accessibilityRole="button"
              accessibilityLabel="Menu"
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
          testID="global-header-bottom"
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
    <TouchableOpacity
      style={styles.backButton}
      onPress={onPress}
      testID="global-header-back-button"
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
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
