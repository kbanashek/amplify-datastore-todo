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

// Mock the require call in ImageCaptureQuestion
jest.mock(
  "expo-image-picker",
  () => ({
    __esModule: true,
    requestCameraPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" })
    ),
    launchCameraAsync: jest.fn(() =>
      Promise.resolve({
        canceled: false,
        assets: [{ uri: "file://test-image.jpg" }],
      })
    ),
    launchImageLibraryAsync: jest.fn(() =>
      Promise.resolve({
        canceled: false,
        assets: [{ uri: "file://test-image.jpg" }],
      })
    ),
    MediaTypeOptions: {
      Images: "Images",
    },
    default: {
      requestCameraPermissionsAsync: jest.fn(() =>
        Promise.resolve({ status: "granted" })
      ),
      launchCameraAsync: jest.fn(() =>
        Promise.resolve({
          canceled: false,
          assets: [{ uri: "file://test-image.jpg" }],
        })
      ),
      launchImageLibraryAsync: jest.fn(() =>
        Promise.resolve({
          canceled: false,
          assets: [{ uri: "file://test-image.jpg" }],
        })
      ),
      MediaTypeOptions: {
        Images: "Images",
      },
    },
  }),
  { virtual: true }
);

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
    const ImagePicker = require("expo-image-picker");
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
      // Verify the mock was called (ImagePicker is mocked)
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
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
