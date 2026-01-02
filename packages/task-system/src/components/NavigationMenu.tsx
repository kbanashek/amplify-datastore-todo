/**
 * NavigationMenu component module.
 *
 * @module NavigationMenu
 */

import { IconSymbol } from "@components/ui/IconSymbol";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import { Colors } from "@constants/Colors";
import { useColorScheme } from "@hooks/useColorScheme";
import { useNavigation } from "@react-navigation/native";
import { getServiceLogger } from "@utils/serviceLogger";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = getServiceLogger("NavigationMenu");

interface MenuItem {
  key: string;
  name: string;
  icon: string;
  description?: string;
  /**
   * Optional React Navigation route name to navigate to.
   * (Module-only / host-agnostic: no expo-router paths)
   */
  navigateTo?: string;
  /**
   * Optional custom handler for the host to wire actions without the package
   * importing host navigation libraries.
   */
  onPress?: () => void;
}

/**
 * Props for the NavigationMenu component
 */
interface NavigationMenuProps {
  visible: boolean;
  onClose: () => void;
  items?: readonly MenuItem[];
}

/**
 * NavigationMenu component.
 *
 * @param props - Component props
 * @returns Rendered NavigationMenu component
 */
export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  visible,
  onClose,
  items = [],
}) => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handlePressItem = (item: MenuItem): void => {
    try {
      if (item.onPress) {
        item.onPress();
      } else if (item.navigateTo) {
        // Best-effort navigation within the current React Navigation tree.
        navigation.navigate?.(item.navigateTo as any);
      }
      onClose();
    } catch (error) {
      logger.error("Item press error", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      testID="navigation-menu-modal"
    >
      <View style={styles.overlayContainer}>
        <Pressable
          style={styles.overlay}
          onPress={onClose}
          android_disableSound={true}
          testID="navigation-menu-overlay"
        />
        <Pressable
          style={styles.menuContainer}
          testID="navigation-menu-container"
          onPress={e => {
            e.stopPropagation();
          }}
        >
          <View style={styles.header} testID="navigation-menu-header">
            <Text style={styles.headerTitle}>Navigation</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              testID="navigation-menu-close-button"
              accessibilityRole="button"
              accessibilityLabel="Close navigation menu"
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.menuList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuListContent}
            testID="navigation-menu-list"
          >
            {items.length === 0 ? (
              <View
                style={styles.emptyState}
                testID="navigation-menu-empty-state"
              >
                <Text style={styles.emptyStateText}>
                  No navigation options available
                </Text>
              </View>
            ) : (
              items.map(item => {
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.menuItem}
                    onPress={() => handlePressItem(item)}
                    activeOpacity={0.7}
                    testID={`navigation-menu-item-${item.key}`}
                    accessibilityRole="button"
                    accessibilityLabel={item.description || item.name}
                  >
                    <View style={styles.menuItemIcon}>
                      <IconSymbol
                        name={item.icon as any}
                        size={24}
                        color={colors.tint}
                      />
                    </View>
                    <View style={styles.menuItemContent}>
                      <Text
                        style={[styles.menuItemTitle, { color: colors.text }]}
                      >
                        {item.name}
                      </Text>
                      {item.description && (
                        <Text
                          style={[
                            styles.menuItemDescription,
                            { color: colors.tabIconDefault },
                          ]}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color={colors.tabIconDefault}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: 300,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    // Ensure menu container blocks touches
    pointerEvents: "auto",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGray,
    flexShrink: 0,
  },
  headerTitle: {
    ...AppFonts.heading,
    color: AppColors.gray,
  },
  closeButton: {
    padding: 4,
  },
  menuList: {
    flexShrink: 1,
    flexGrow: 0,
  },
  menuListContent: {
    paddingBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    ...AppFonts.body,
    color: AppColors.legacy.gray,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.ltGray,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.powderGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...AppFonts.bodyMedium,
    marginBottom: 2,
  },
  menuItemDescription: {
    ...AppFonts.small,
  },
});
