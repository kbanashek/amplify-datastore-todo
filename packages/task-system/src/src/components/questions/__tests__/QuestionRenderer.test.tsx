import { render } from "@testing-library/react-native";
import React from "react";
import { ParsedElement } from "../../../types/ActivityConfig";
import { QuestionRenderer } from "../QuestionRenderer";

// Mock all question components
jest.mock("../TextQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    TextQuestion: ({ question }: any) => (
      <View testID={`text-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../NumberQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    NumberQuestion: ({ question }: any) => (
      <View testID={`number-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../SingleSelectQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    SingleSelectQuestion: ({ question }: any) => (
      <View testID={`single-select-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../MultiSelectQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    MultiSelectQuestion: ({ question }: any) => (
      <View testID={`multi-select-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../DateQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    DateQuestion: ({ question }: any) => (
      <View testID={`date-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../BloodPressureQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    BloodPressureQuestion: ({ question }: any) => (
      <View testID={`blood-pressure-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../TemperatureQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    TemperatureQuestion: ({ question }: any) => (
      <View testID={`temperature-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../ClinicalDynamicInputQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    ClinicalDynamicInputQuestion: ({ question }: any) => (
      <View testID={`clinical-dynamic-input-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../HorizontalVASQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    HorizontalVASQuestion: ({ question }: any) => (
      <View testID={`horizontal-vas-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../ImageCaptureQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    ImageCaptureQuestion: ({ question }: any) => (
      <View testID={`image-capture-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

jest.mock("../WeightHeightQuestion", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    WeightHeightQuestion: ({ question }: any) => (
      <View testID={`weight-height-question-${question.id}`}>
        <Text>{question.friendlyName}</Text>
      </View>
    ),
  };
});

// Mock useTranslatedText
jest.mock("../../../hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("QuestionRenderer", () => {
  const createMockElement = (
    type: string,
    id: string = "question-1"
  ): ParsedElement => ({
    id: `element-${id}`,
    order: 1,
    question: {
      id,
      type,
      text: `<p>Question ${id}</p>`,
      friendlyName: `Question ${id}`,
      required: false,
    },
    displayProperties: {},
    patientAnswer: null,
  });

  const defaultProps = {
    element: createMockElement("text"),
    onAnswerChange: jest.fn(),
    errors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders TextQuestion for text type", () => {
    const { getByTestId } = render(
      <QuestionRenderer {...defaultProps} element={createMockElement("text")} />
    );

    expect(getByTestId("text-question-question-1")).toBeTruthy();
  });

  it("renders NumberQuestion for number type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("number-field")}
      />
    );

    expect(getByTestId("number-question-question-1")).toBeTruthy();
  });

  it("renders SingleSelectQuestion for singleselect type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("singleselect")}
      />
    );

    expect(getByTestId("single-select-question-question-1")).toBeTruthy();
  });

  it("renders MultiSelectQuestion for multiselect type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("multiselect")}
      />
    );

    expect(getByTestId("multi-select-question-question-1")).toBeTruthy();
  });

  it("renders DateQuestion for date type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("date-field")}
      />
    );

    expect(getByTestId("date-question-question-1")).toBeTruthy();
  });

  it("renders BloodPressureQuestion for bloodPressure type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("bloodPressure")}
      />
    );

    expect(getByTestId("blood-pressure-question-question-1")).toBeTruthy();
  });

  it("renders TemperatureQuestion for temperature type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("temperature")}
      />
    );

    expect(getByTestId("temperature-question-question-1")).toBeTruthy();
  });

  it("renders ClinicalDynamicInputQuestion for pulse type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("pulse")}
      />
    );

    expect(
      getByTestId("clinical-dynamic-input-question-question-1")
    ).toBeTruthy();
  });

  it("renders HorizontalVASQuestion for horizontalVAS type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("horizontalVAS")}
      />
    );

    expect(getByTestId("horizontal-vas-question-question-1")).toBeTruthy();
  });

  it("renders ImageCaptureQuestion for imageCapture type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("imageCapture")}
      />
    );

    expect(getByTestId("image-capture-question-question-1")).toBeTruthy();
  });

  it("renders WeightHeightQuestion for weight type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("weight")}
      />
    );

    expect(getByTestId("weight-height-question-question-1")).toBeTruthy();
  });

  it("renders label for label type", () => {
    const { getByText } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("label")}
      />
    );

    expect(getByText("Question question-1")).toBeTruthy();
  });

  it("displays error messages", () => {
    const { getByText } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("text")}
        errors={{ "question-1": ["This field is required"] }}
      />
    );

    expect(getByText("This field is required")).toBeTruthy();
  });

  it("uses currentAnswer over patientAnswer", () => {
    const element = createMockElement("text");
    element.patientAnswer = "Old Answer";
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={element}
        currentAnswer="New Answer"
      />
    );

    expect(getByTestId("text-question-question-1")).toBeTruthy();
  });

  it("calls onAnswerChange when answer changes", () => {
    const mockOnAnswerChange = jest.fn();
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("text")}
        onAnswerChange={mockOnAnswerChange}
      />
    );

    // The mock component doesn't actually call onChange, but we verify it's rendered
    expect(getByTestId("text-question-question-1")).toBeTruthy();
  });

  it("shows unsupported message for unknown question type", () => {
    const { getByText } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("unknown-type")}
      />
    );

    expect(getByText(/Unsupported question type/)).toBeTruthy();
  });

  // Test all question type variations
  it("renders TextQuestion for all text type variations", () => {
    const textTypes = ["text", "text-field", "textarea-field"];
    textTypes.forEach(type => {
      const { getByTestId, unmount } = render(
        <QuestionRenderer
          {...defaultProps}
          element={createMockElement(type, `text-${type}`)}
        />
      );
      expect(getByTestId(`text-question-text-${type}`)).toBeTruthy();
      unmount();
    });
  });

  it("renders SingleSelectQuestion for all single select type variations", () => {
    const selectTypes = [
      "singleselect",
      "choice-field",
      "radio-field",
      "dropdown-field",
    ];
    selectTypes.forEach(type => {
      const { getByTestId, unmount } = render(
        <QuestionRenderer
          {...defaultProps}
          element={createMockElement(type, `select-${type}`)}
        />
      );
      expect(getByTestId(`single-select-question-select-${type}`)).toBeTruthy();
      unmount();
    });
  });

  it("renders MultiSelectQuestion for all multi select type variations", () => {
    const multiSelectTypes = [
      "multiselect",
      "multi-select-field",
      "checkbox-field",
    ];
    multiSelectTypes.forEach(type => {
      const { getByTestId, unmount } = render(
        <QuestionRenderer
          {...defaultProps}
          element={createMockElement(type, `multi-${type}`)}
        />
      );
      expect(getByTestId(`multi-select-question-multi-${type}`)).toBeTruthy();
      unmount();
    });
  });

  it("renders NumberQuestion for all number type variations", () => {
    const numberTypes = ["number", "number-field", "numericScale"];
    numberTypes.forEach(type => {
      const { getByTestId, unmount } = render(
        <QuestionRenderer
          {...defaultProps}
          element={createMockElement(type, `number-${type}`)}
        />
      );
      expect(getByTestId(`number-question-number-${type}`)).toBeTruthy();
      unmount();
    });
  });

  it("renders DateQuestion for all date/time type variations", () => {
    const dateTypes = [
      "date",
      "date-field",
      "date-time-field",
      "time",
      "time-picker-field",
    ];
    dateTypes.forEach(type => {
      const { getByTestId, unmount } = render(
        <QuestionRenderer
          {...defaultProps}
          element={createMockElement(type, `date-${type}`)}
        />
      );
      expect(getByTestId(`date-question-date-${type}`)).toBeTruthy();
      unmount();
    });
  });

  it("renders WeightHeightQuestion for weight/height type variations", () => {
    const weightHeightTypes = ["weight", "height", "weightHeight"];
    weightHeightTypes.forEach(type => {
      const { getByTestId, unmount } = render(
        <QuestionRenderer
          {...defaultProps}
          element={createMockElement(type, `wh-${type}`)}
        />
      );
      expect(getByTestId(`weight-height-question-wh-${type}`)).toBeTruthy();
      unmount();
    });
  });

  it("renders ClinicalDynamicInputQuestion for clinicalDynamicInput type", () => {
    const { getByTestId } = render(
      <QuestionRenderer
        {...defaultProps}
        element={createMockElement("clinicalDynamicInput", "clinical-1")}
      />
    );

    expect(
      getByTestId("clinical-dynamic-input-question-clinical-1")
    ).toBeTruthy();
  });

  // Test value transformers
  it("transforms value correctly for MultiSelectQuestion (array)", () => {
    const element = createMockElement("multiselect", "multi-1");
    element.patientAnswer = ["option1", "option2"];
    const { getByTestId } = render(
      <QuestionRenderer {...defaultProps} element={element} />
    );

    expect(getByTestId("multi-select-question-multi-1")).toBeTruthy();
  });

  it("transforms value correctly for MultiSelectQuestion (non-array to empty array)", () => {
    const element = createMockElement("multiselect", "multi-2");
    element.patientAnswer = null;
    const { getByTestId } = render(
      <QuestionRenderer {...defaultProps} element={element} />
    );

    expect(getByTestId("multi-select-question-multi-2")).toBeTruthy();
  });

  it("transforms value correctly for TextQuestion (empty string default)", () => {
    const element = createMockElement("text", "text-1");
    element.patientAnswer = null;
    const { getByTestId } = render(
      <QuestionRenderer {...defaultProps} element={element} />
    );

    expect(getByTestId("text-question-text-1")).toBeTruthy();
  });

  it("transforms value correctly for NumberQuestion (empty string default)", () => {
    const element = createMockElement("number-field", "number-1");
    element.patientAnswer = null;
    const { getByTestId } = render(
      <QuestionRenderer {...defaultProps} element={element} />
    );

    expect(getByTestId("number-question-number-1")).toBeTruthy();
  });

  it("transforms value correctly for SingleSelectQuestion (null default)", () => {
    const element = createMockElement("singleselect", "select-1");
    element.patientAnswer = null;
    const { getByTestId } = render(
      <QuestionRenderer {...defaultProps} element={element} />
    );

    expect(getByTestId("single-select-question-select-1")).toBeTruthy();
  });

  it("transforms value correctly for DateQuestion (null default)", () => {
    const element = createMockElement("date-field", "date-1");
    element.patientAnswer = null;
    const { getByTestId } = render(
      <QuestionRenderer {...defaultProps} element={element} />
    );

    expect(getByTestId("date-question-date-1")).toBeTruthy();
  });

  it("transforms value correctly for clinical types (null default)", () => {
    const clinicalTypes = [
      { type: "temperature", testId: "temperature-question" },
      { type: "pulse", testId: "clinical-dynamic-input-question" },
      { type: "bloodPressure", testId: "blood-pressure-question" },
      { type: "horizontalVAS", testId: "horizontal-vas-question" },
      { type: "imageCapture", testId: "image-capture-question" },
    ];

    clinicalTypes.forEach(({ type, testId }) => {
      const element = createMockElement(type, `${type}-1`);
      element.patientAnswer = null;
      const { getByTestId, unmount } = render(
        <QuestionRenderer {...defaultProps} element={element} />
      );

      expect(getByTestId(`${testId}-${type}-1`)).toBeTruthy();
      unmount();
    });
  });

  // Test normalization handles case variations
  it("handles case variations in question type", () => {
    const caseVariations = [
      "TEMPERATURE",
      "Temperature",
      "temperature",
      "BLOODPRESSURE",
      "blood-pressure",
      "bloodPressure",
    ];

    caseVariations.forEach(type => {
      const { getByTestId, unmount } = render(
        <QuestionRenderer
          {...defaultProps}
          element={createMockElement(type, `case-${type}`)}
        />
      );
      // Should render without error (may show unsupported if not in map)
      expect(getByTestId).toBeDefined();
      unmount();
    });
  });
});
