/**
 * LanguageSelector component module.
 *
 * @module LanguageSelector
 */

import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import type { LanguageCode } from "@translations/index";
import { useTaskTranslation } from "@translations/index";
import { getServiceLogger } from "@utils/logging/serviceLogger";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = getServiceLogger("LanguageSelector");

/**
 * Props for the LanguageSelector component
 */
interface LanguageSelectorProps {
  style?: object;
}

/**
 * LanguageSelector component.
 *
 * @param props - Component props
 * @returns Rendered LanguageSelector component
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
}) => {
  const { currentLanguage, setLanguage, supportedLanguages, ready } =
    useTaskTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);

  const currentLanguageName =
    supportedLanguages.find(lang => lang.code === currentLanguage)?.name ||
    "English";

  const handleLanguageSelect = async (languageCode: LanguageCode) => {
    logger.debug(
      "Language selected",
      {
        selectedLanguage: languageCode,
        currentLanguage,
        isSame: languageCode === currentLanguage,
      },
      undefined,
      "🌐"
    );

    if (languageCode === currentLanguage) {
      logger.debug(
        "Same language selected, closing modal",
        undefined,
        undefined,
        "🌐"
      );
      setModalVisible(false);
      return;
    }

    logger.debug(
      "Changing language...",
      {
        from: currentLanguage,
        to: languageCode,
      },
      undefined,
      "🌐"
    );
    setChangingLanguage(true);
    try {
      await setLanguage(languageCode);
      logger.info(
        "Language change completed",
        {
          newLanguage: languageCode,
        },
        undefined,
        "🌐"
      );
      setModalVisible(false);
    } catch (error) {
      logger.error("Error changing language", error, undefined, "🌐");
    } finally {
      setChangingLanguage(false);
    }
  };

  return (
    <View style={[styles.container, style]} testID="language-selector">
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        disabled={changingLanguage || !ready}
        testID="language-selector-button"
        accessibilityRole="button"
        accessibilityLabel={`Change language, current: ${currentLanguageName}`}
      >
        {changingLanguage || !ready ? (
          <ActivityIndicator
            size="small"
            color={AppColors.CIBlue}
            testID="language-selector-loading"
          />
        ) : (
          <Text style={styles.selectorText}>🌐 {currentLanguageName}</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        testID="language-selector-modal"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          testID="language-selector-modal-overlay"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                testID="language-selector-modal-close"
                accessibilityRole="button"
                accessibilityLabel="Close language selector"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={supportedLanguages}
              keyExtractor={item => item.code}
              renderItem={({ item }) => {
                const isSelected = item.code === currentLanguage;
                return (
                  <TouchableOpacity
                    style={[
                      styles.languageItem,
                      isSelected && styles.languageItemSelected,
                    ]}
                    onPress={() => handleLanguageSelect(item.code)}
                    disabled={changingLanguage}
                    testID={`language-selector-item-${item.code}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.name}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        isSelected && styles.languageTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              style={styles.languageList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  selectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: AppColors.ltGray,
    borderWidth: 1,
    borderColor: AppColors.lightGray,
  },
  selectorText: {
    ...AppFonts.label,
    color: AppColors.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.ltGray,
  },
  modalTitle: {
    ...AppFonts.subheading,
    color: AppColors.gray,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    ...AppFonts.subheading,
    color: AppColors.mediumDarkGray,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.ltGray,
  },
  languageItemSelected: {
    backgroundColor: AppColors.powderGray,
  },
  languageText: {
    ...AppFonts.body,
    color: AppColors.gray,
  },
  languageTextSelected: {
    ...AppFonts.bodyMedium,
    color: AppColors.headerBlue,
  },
  checkmark: {
    ...AppFonts.body,
    color: AppColors.headerBlue,
  },
});
