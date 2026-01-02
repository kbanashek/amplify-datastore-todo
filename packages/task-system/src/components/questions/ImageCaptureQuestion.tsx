/**
 * ImageCaptureQuestion component module.
 *
 * @module ImageCaptureQuestion
 */

import React, { useState } from "react";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Question } from "@task-types/ActivityConfig";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("ImageCaptureQuestion");

// Conditionally import expo-image-picker to handle cases where native module isn't available
let ImagePicker: any;
try {
  ImagePicker = require("expo-image-picker");
} catch (error) {
  // Native module not available - will show fallback UI
  ImagePicker = null;
}

/**
 * Props for the ImageCaptureQuestion component
 */
interface ImageCaptureQuestionProps {
  question: Question;
  value: string | null;
  onChange: (value: string) => void;
  displayProperties: Record<string, any>;
  errors: string[];
}

/**
 * ImageCaptureQuestion component.
 *
 * @param props - Component props
 * @returns Rendered ImageCaptureQuestion component
 */
export const ImageCaptureQuestion: React.FC<ImageCaptureQuestionProps> = ({
  question,
  value,
  onChange,
  displayProperties,
  errors,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(value);
  const [loading, setLoading] = useState(false);

  const addPhotoText = displayProperties?.addPhotoText || "Add Photo";
  const editPhotoText = displayProperties?.editPhotoText || "Edit Photo";

  const { translatedText: translatedAddPhoto } =
    useTranslatedText(addPhotoText);
  const { translatedText: translatedEditPhoto } =
    useTranslatedText(editPhotoText);

  // Show fallback UI if native module isn't available
  if (!ImagePicker) {
    return (
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableTitle}>Image Capture Unavailable</Text>
          <Text style={styles.unavailableText}>
            The image picker native module is not available. Please rebuild the
            development client to enable this feature.
          </Text>
          {value && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: value }} style={styles.image} />
            </View>
          )}
        </View>
        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  }

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access camera is required!");
      return false;
    }
    return true;
  };

  const handleCaptureImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onChange(uri);
      }
    } catch (error) {
      logger.error("Error capturing image", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onChange(uri);
      }
    } catch (error) {
      logger.error("Error selecting image", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = () => {
    setImageUri(null);
    onChange("");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.CIBlue} />
      </View>
    );
  }

  if (imageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteImage}
            testID={`image-delete-${question.id}`}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleCaptureImage}
            testID={`image-edit-${question.id}`}
          >
            <Text style={styles.editButtonText}>
              {translatedEditPhoto || editPhotoText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.captureButton}
        onPress={handleCaptureImage}
        testID={`image-capture-${question.id}`}
      >
        <Text style={styles.captureButtonText}>
          {translatedAddPhoto || addPhotoText}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleSelectImage}
        testID={`image-select-${question.id}`}
      >
        <Text style={styles.selectButtonText}>Select from Gallery</Text>
      </TouchableOpacity>
      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: AppColors.CIBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  captureButtonText: {
    ...AppFonts.button,
    color: AppColors.white,
  },
  selectButton: {
    backgroundColor: AppColors.powderGray,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
  },
  selectButtonText: {
    ...AppFonts.button,
    color: AppColors.gray,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 300,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: AppColors.errorRed,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    ...AppFonts.heading,
    color: AppColors.white,
  },
  editButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(52, 152, 219, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  editButtonText: {
    ...AppFonts.label,
    color: AppColors.white,
  },
  errorContainer: {
    marginTop: 8,
  },
  errorText: {
    ...AppFonts.label,
    color: AppColors.errorRed,
  },
  unavailableContainer: {
    padding: 16,
    backgroundColor: AppColors.lightYellow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.legacy.warning,
    alignItems: "center",
  },
  unavailableTitle: {
    ...AppFonts.button,
    color: AppColors.legacy.dark,
    marginBottom: 8,
  },
  unavailableText: {
    ...AppFonts.small,
    color: AppColors.legacy.dark,
    textAlign: "center",
    lineHeight: 20,
  },
});
