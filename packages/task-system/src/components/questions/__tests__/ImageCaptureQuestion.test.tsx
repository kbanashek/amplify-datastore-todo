import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ImageCaptureQuestion } from "@components/questions/ImageCaptureQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

// Mock expo-image-picker - Jest will automatically use __mocks__/expo-image-picker.ts
jest.mock("expo-image-picker");

// Mock ImageStorageService
jest.mock("@services/ImageStorageService", () => ({
  getImageStorageService: jest.fn(() => ({
    uploadImage: jest.fn().mockResolvedValue({
      s3Key: "data/org/study/task_q_123.jpg",
      filename: "task_q_123.jpg",
      localPath: "file://test-image.jpg",
      uploadedToS3: true,
    }),
    downloadImage: jest.fn().mockResolvedValue({
      url: "file://test-image.jpg",
      fromCache: true,
      expiresAt: Date.now() + 900000,
    }),
    deleteImage: jest.fn().mockResolvedValue(undefined),
    getDisplayUri: jest.fn().mockResolvedValue("file://test-image.jpg"),
  })),
}));

// Import the mocked functions for assertions
import {
  requestCameraPermissionsAsync as mockRequestCameraPermissionsAsync,
  launchCameraAsync as mockLaunchCameraAsync,
  launchImageLibraryAsync as mockLaunchImageLibraryAsync,
} from "../../../__mocks__/expo-image-picker";

describe("ImageCaptureQuestion", () => {
  const mockQuestion: Question = {
    id: "image-1",
    type: "imageCapture",
    text: "Capture an image",
    friendlyName: "Image",
    required: true,
  };

  const mockDisplayProperties = {
    addPhotoText: "Add Photo",
    editPhotoText: "Edit Photo",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to return successful responses
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://test-image.jpg" }],
    });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://test-image.jpg" }],
    });
  });

  it("renders capture button when no image", () => {
    const { getByTestId } = render(
      <ImageCaptureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("image-capture-image-1")).toBeTruthy();
  });

  it("renders image when value is provided", async () => {
    const { getByTestId } = render(
      <ImageCaptureQuestion
        question={mockQuestion}
        value="data/org/study/task_q_123.jpg"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    // Wait for async getDisplayUri to complete
    await waitFor(() => {
      expect(getByTestId("image-edit-image-1")).toBeTruthy();
      expect(getByTestId("image-delete-image-1")).toBeTruthy();
    });
  });

  it("calls onChange when image is captured", async () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <ImageCaptureQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const captureButton = getByTestId("image-capture-image-1");
    fireEvent.press(captureButton);

    await waitFor(() => {
      // Verify the mock was called
      expect(mockLaunchCameraAsync).toHaveBeenCalled();
      // Now stores S3 key instead of local URI
      expect(mockOnChange).toHaveBeenCalledWith(
        "data/org/study/task_q_123.jpg"
      );
    });
  });

  it("deletes image when delete button is pressed", async () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <ImageCaptureQuestion
        question={mockQuestion}
        value="data/org/study/task_q_123.jpg"
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    // Wait for image to load first
    await waitFor(() => {
      expect(getByTestId("image-delete-image-1")).toBeTruthy();
    });

    const deleteButton = getByTestId("image-delete-image-1");
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith("");
    });
  });

  it("displays error messages", () => {
    const { getByText } = render(
      <ImageCaptureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Image is required"]}
      />
    );

    expect(getByText("Image is required")).toBeTruthy();
  });
});
