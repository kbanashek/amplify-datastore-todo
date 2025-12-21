import { LanguageCode, useTranslation } from "@orion/task-system";
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

interface LanguageSelectorProps {
  style?: object;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
}) => {
  const { currentLanguage, setLanguage, supportedLanguages, isTranslating } =
    useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);

  const currentLanguageName =
    supportedLanguages.find(lang => lang.code === currentLanguage)?.name ||
    "English";

  const handleLanguageSelect = async (languageCode: LanguageCode) => {
    console.log("🌐 [LanguageSelector] Language selected", {
      selectedLanguage: languageCode,
      currentLanguage,
      isSame: languageCode === currentLanguage,
    });

    if (languageCode === currentLanguage) {
      console.log(
        "🌐 [LanguageSelector] Same language selected, closing modal"
      );
      setModalVisible(false);
      return;
    }

    console.log("🌐 [LanguageSelector] Changing language...", {
      from: currentLanguage,
      to: languageCode,
    });
    setChangingLanguage(true);
    try {
      await setLanguage(languageCode);
      console.log("🌐 [LanguageSelector] Language change completed", {
        newLanguage: languageCode,
      });
      setModalVisible(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("🌐 [LanguageSelector] Error changing language", {
        error: errorMessage,
        languageCode,
      });
    } finally {
      setChangingLanguage(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        disabled={changingLanguage || isTranslating}
      >
        {changingLanguage || isTranslating ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.selectorText}>🌐 {currentLanguageName}</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
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
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectorText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
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
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
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
    borderBottomColor: "#f0f0f0",
  },
  languageItemSelected: {
    backgroundColor: "#e3f2fd",
  },
  languageText: {
    fontSize: 16,
    color: "#333",
  },
  languageTextSelected: {
    fontWeight: "600",
    color: "#1976d2",
  },
  checkmark: {
    fontSize: 18,
    color: "#1976d2",
    fontWeight: "bold",
  },
});
