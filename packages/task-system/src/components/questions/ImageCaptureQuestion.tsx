/**
 * ImageCaptureQuestion component module.
 *
 * Provides image capture functionality with S3 storage integration.
 * Images are uploaded to S3 via Amplify Storage and cached locally.
 * Offline support is handled automatically via AppSync/DataStore sync.
 *
 * @module ImageCaptureQuestion
 */

import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { getImageStorageService } from "@services/ImageStorageService";
import { Question } from "@task-types/ActivityConfig";
import { getServiceLogger } from "@utils/serviceLogger";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = getServiceLogger("ImageCaptureQuestion");

// Conditionally import expo-image-picker to handle cases where native module isn't available
let ImagePicker: typeof import("expo-image-picker") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ImagePicker = require("expo-image-picker");
} catch (_error) {
  // Native module not available - will show fallback UI
  ImagePicker = null;
}

/**
 * Display properties for ImageCaptureQuestion
 */
interface ImageCaptureDisplayProperties {
  addPhotoText?: string;
  editPhotoText?: string;
  taskId?: string;
  taskType?: string;
  uuid?: string;
  organizationId?: string;
  studyId?: string;
  studyInstanceId?: string;
  [key: string]: unknown;
}

/**
 * Props for the ImageCaptureQuestion component
 */
interface ImageCaptureQuestionProps {
  question: Question;
  value: string | null;
  onChange: (value: string) => void;
  displayProperties: ImageCaptureDisplayProperties;
  errors: string[];
}

/**
 * ImageCaptureQuestion component.
 *
 * Handles image capture with S3 integration:
 * 1. Capture/select image via expo-image-picker
 * 2. Upload to S3 via ImageStorageService
 * 3. Store S3 key in answer value
 * 4. Display from cache or S3
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Cache-busting timestamp for Android image display
  const cachedImageDate = useRef(Date.now());

  const addPhotoText = displayProperties?.addPhotoText || "Add Photo";
  const editPhotoText = displayProperties?.editPhotoText || "Edit Photo";

  const { translatedText: translatedAddPhoto } =
    useTranslatedText(addPhotoText);
  const { translatedText: translatedEditPhoto } =
    useTranslatedText(editPhotoText);

  const imageStorageService = getImageStorageService();

  /**
   * Adds cache-busting timestamp to image URI for Android.
   * Android caches images aggressively, causing stale images to display.
   * Adding a timestamp query parameter forces cache invalidation.
   *
   * @param uri - Image URI (local file:// or S3 URL)
   * @returns URI with timestamp for Android, unchanged for iOS
   */
  const getCacheBustedUri = (uri: string | null): string | null => {
    if (!uri) return null;

    if (Platform.OS === "android") {
      const separator = uri.includes("?") ? "&" : "?";
      return `${uri}${separator}time=${cachedImageDate.current}`;
    }

    return uri;
  };

  // Load display URI when value changes
  useEffect(() => {
    const loadDisplayUri = async () => {
      if (value) {
        try {
          const displayUri = await imageStorageService.getDisplayUri(value);
          setImageUri(displayUri);
        } catch (error) {
          logger.error("Failed to load display URI", error);
          // Fallback to value as-is
          setImageUri(value);
        }
      } else {
        setImageUri(null);
      }
    };

    loadDisplayUri();
  }, [value, imageStorageService]);

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
              <Image
                source={{ uri: getCacheBustedUri(value) || undefined }}
                style={styles.image}
              />
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
    if (!ImagePicker) return false;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      logger.warn("Camera permission denied by user");
      // Note: In production, use a proper alert/toast component instead of alert()
      // For now, just return false and let the UI handle it
      return false;
    }
    return true;
  };

  const handleCaptureImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission || !ImagePicker) return;

    setLoading(true);
    setUploadStatus("Capturing...");

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const tempUri = result.assets[0].uri;

        // Upload to S3 via ImageStorageService
        setUploadStatus("Uploading...");

        const uploadResult = await imageStorageService.uploadImage({
          sourceUri: tempUri,
          questionId: question.id,
          taskId: displayProperties?.taskId,
          taskType: displayProperties?.taskType,
          uuid: displayProperties?.uuid,
          organizationId: displayProperties?.organizationId,
          studyId: displayProperties?.studyId,
          studyInstanceId: displayProperties?.studyInstanceId,
        });

        logger.info("Image uploaded successfully", {
          s3Key: uploadResult.s3Key,
          uploadedToS3: uploadResult.uploadedToS3,
        });

        // Store S3 key in answer value
        onChange(uploadResult.s3Key);

        // Update cache-busting timestamp for Android
        cachedImageDate.current = Date.now();

        // Display from local cache
        setImageUri(uploadResult.localPath);

        if (!uploadResult.uploadedToS3) {
          setUploadStatus("Saved locally (will sync when online)");
          setTimeout(() => setUploadStatus(""), 3000);
        } else {
          setUploadStatus("");
        }
      }
    } catch (error) {
      logger.error("Error capturing/uploading image", error);
      setUploadStatus("Upload failed - image saved locally");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission || !ImagePicker) return;

    setLoading(true);
    setUploadStatus("Selecting...");

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const tempUri = result.assets[0].uri;

        // Upload to S3 via ImageStorageService
        setUploadStatus("Uploading...");

        const uploadResult = await imageStorageService.uploadImage({
          sourceUri: tempUri,
          questionId: question.id,
          taskId: displayProperties?.taskId,
          taskType: displayProperties?.taskType,
          uuid: displayProperties?.uuid,
          organizationId: displayProperties?.organizationId,
          studyId: displayProperties?.studyId,
          studyInstanceId: displayProperties?.studyInstanceId,
        });

        logger.info("Image uploaded successfully", {
          s3Key: uploadResult.s3Key,
          uploadedToS3: uploadResult.uploadedToS3,
        });

        // Store S3 key in answer value
        onChange(uploadResult.s3Key);

        // Update cache-busting timestamp for Android
        cachedImageDate.current = Date.now();

        // Display from local cache
        setImageUri(uploadResult.localPath);

        if (!uploadResult.uploadedToS3) {
          setUploadStatus("Saved locally (will sync when online)");
          setTimeout(() => setUploadStatus(""), 3000);
        } else {
          setUploadStatus("");
        }
      }
    } catch (error) {
      logger.error("Error selecting/uploading image", error);
      setUploadStatus("Upload failed - image saved locally");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!value) return;

    setLoading(true);

    try {
      // Delete from S3 and local cache
      await imageStorageService.deleteImage(value);

      logger.info("Image deleted successfully", { s3Key: value });

      setImageUri(null);
      onChange("");
    } catch (error) {
      logger.error("Error deleting image", error);
      // Still clear UI even if deletion fails
      setImageUri(null);
      onChange("");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.CIBlue} />
        {uploadStatus && <Text style={styles.statusText}>{uploadStatus}</Text>}
      </View>
    );
  }

  if (imageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getCacheBustedUri(imageUri) || undefined }}
            style={styles.image}
          />
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
        {uploadStatus && <Text style={styles.statusText}>{uploadStatus}</Text>}
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
  statusText: {
    ...AppFonts.small,
    color: AppColors.gray,
    marginTop: 8,
    textAlign: "center",
  },
});
