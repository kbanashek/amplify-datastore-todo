import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { LoadingSpinner } from "../LoadingSpinner";

const meta = {
  title: "UI/LoadingSpinner",
  component: LoadingSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["small", "large"],
      description: "Size of the loading spinner",
    },
    color: {
      control: "color",
      description: "Color of the loading spinner",
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default loading spinner
 */
export const Default: Story = {
  args: {},
};

/**
 * Small loading spinner
 */
export const Small: Story = {
  args: {
    size: "small",
  },
};

/**
 * Large loading spinner
 */
export const Large: Story = {
  args: {
    size: "large",
  },
};

/**
 * Custom color loading spinner
 */
export const CustomColor: Story = {
  args: {
    color: "#FF6B6B",
    size: "large",
  },
};

/**
 * Loading spinner in a container
 */
export const InContainer: Story = {
  render: (args: any) => (
    <View
      style={{
        width: 300,
        height: 200,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
      }}
    >
      <LoadingSpinner {...args} />
    </View>
  ),
  args: {
    size: "large",
  },
};
