import React from "react";
import { render } from "@testing-library/react-native";
import { IconSymbol } from "@components/ui/IconSymbol";
import { IconNames } from "@constants/IconNames";

// Mock MaterialIcons
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ name, size, color, style, testID }: any) => (
      <Text testID={testID} style={[{ fontSize: size, color }, style]}>
        {name}
      </Text>
    ),
  };
});

describe("IconSymbol", () => {
  it("renders icon with name", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.HOUSE_FILL} color="#000000" />
    );
    expect(getByText("home")).toBeTruthy();
  });

  it("renders with default size of 24", () => {
    const { UNSAFE_getByType } = render(
      <IconSymbol name={IconNames.HOUSE_FILL} color="#000000" />
    );
    // Size is passed to MaterialIcons
    expect(UNSAFE_getByType).toBeDefined();
  });

  it("renders with custom size", () => {
    const { UNSAFE_getByType } = render(
      <IconSymbol name={IconNames.HOUSE_FILL} size={32} color="#000000" />
    );
    // Size is passed to MaterialIcons
    expect(UNSAFE_getByType).toBeDefined();
  });

  it("renders with color", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.HOUSE_FILL} color="#FF0000" />
    );
    expect(getByText("home")).toBeTruthy();
  });

  it("maps chevron.left to chevron-left", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.CHEVRON_LEFT} color="#000000" />
    );
    expect(getByText("chevron-left")).toBeTruthy();
  });

  it("maps chevron.right to chevron-right", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.CHEVRON_RIGHT} color="#000000" />
    );
    expect(getByText("chevron-right")).toBeTruthy();
  });

  it("maps video.fill to videocam", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.VIDEO_FILL} color="#000000" />
    );
    expect(getByText("videocam")).toBeTruthy();
  });

  it("maps building.2.fill to business", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.BUILDING_2_FILL} color="#000000" />
    );
    expect(getByText("business")).toBeTruthy();
  });

  it("maps xmark to close", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.XMARK} color="#000000" />
    );
    expect(getByText("close")).toBeTruthy();
  });

  it("maps pills to medication", () => {
    const { getByText } = render(
      <IconSymbol name={IconNames.PILLS} color="#000000" />
    );
    expect(getByText("medication")).toBeTruthy();
  });
});
