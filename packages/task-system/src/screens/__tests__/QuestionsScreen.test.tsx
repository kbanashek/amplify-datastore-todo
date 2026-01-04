import React from "react";
// @ts-ignore - react-test-renderer types not available
import renderer from "react-test-renderer";
import QuestionsScreen from "@screens/QuestionsScreen";

// Mock AWS Amplify Storage to prevent module import errors
jest.mock("aws-amplify/storage", () => ({
  uploadData: jest.fn(),
  getUrl: jest.fn(),
  remove: jest.fn(),
  list: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@hooks/useQuestionsScreen", () => ({
  useQuestionsScreen: () => ({
    loading: false,
    error: null,
    activityData: { screens: [] },
    activityConfig: null,
    answers: {},
    errors: {},
    isSubmitting: false,
    currentScreenIndex: 0,
    showIntroduction: false,
    showReview: false,
    showCompletion: false,
    currentScreenValid: true,
    cameFromReview: false,
    taskId: "task-1",
    task: { title: "Episodic Task 01 (All required)" },
    handleAnswerChange: jest.fn(),
    handleSubmit: jest.fn(),
    handleNext: jest.fn(),
    handlePrevious: jest.fn(),
    handleBegin: jest.fn(),
    handleEditQuestion: jest.fn(),
    handleReviewSubmit: jest.fn(),
    handleCompletionDone: jest.fn(),
    handleBack: jest.fn(),
  }),
}));

jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: (text: string) => ({ translatedText: text }),
}));

describe("QuestionsScreen snapshot", () => {
  it("renders with empty activity state", () => {
    const tree = renderer
      .create(<QuestionsScreen disableSafeAreaTopInset />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
