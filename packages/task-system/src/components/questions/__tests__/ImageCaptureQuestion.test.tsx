import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ImageCaptureQuestion } from "../ImageCaptureQuestion";
import { Question } from "../../../types/ActivityConfig";

// Mock useTranslatedText
jest.mock("../../../hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

// Mock expo-image-picker - Jest will automatically use __mocks__/expo-image-picker.ts
jest.mock("expo-image-picker");

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

  it("renders image when value is provided", () => {
    const { getByTestId } = render(
      <ImageCaptureQuestion
        question={mockQuestion}
        value="file://existing-image.jpg"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("image-edit-image-1")).toBeTruthy();
    expect(getByTestId("image-delete-image-1")).toBeTruthy();
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
      expect(mockOnChange).toHaveBeenCalledWith("file://test-image.jpg");
    });
  });

  it("deletes image when delete button is pressed", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <ImageCaptureQuestion
        question={mockQuestion}
        value="file://test-image.jpg"
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const deleteButton = getByTestId("image-delete-image-1");
    fireEvent.press(deleteButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
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
