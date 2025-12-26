import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ThemedText } from "./ThemedText";

const meta = {
  title: "Components/ThemedText",
  component: ThemedText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["default", "title", "defaultSemiBold", "subtitle", "link"],
      description: "Text style variant",
    },
    children: {
      control: "text",
      description: "Text content to display",
    },
  },
} satisfies Meta<typeof ThemedText>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text style
 */
export const Default: Story = {
  args: {
    children: "This is default text",
  },
};

/**
 * Title text style
 */
export const Title: Story = {
  args: {
    type: "title",
    children: "This is a title",
  },
};

/**
 * Semi-bold text style
 */
export const SemiBold: Story = {
  args: {
    type: "defaultSemiBold",
    children: "This is semi-bold text",
  },
};

/**
 * Subtitle text style
 */
export const Subtitle: Story = {
  args: {
    type: "subtitle",
    children: "This is a subtitle",
  },
};

/**
 * Link text style
 */
export const Link: Story = {
  args: {
    type: "link",
    children: "This is a link",
  },
};

/**
 * Multiple text variants together
 */
export const AllVariants: Story = {
  render: () => (
    <>
      <ThemedText type="title">Title Text</ThemedText>
      <ThemedText type="defaultSemiBold">Semi-Bold Text</ThemedText>
      <ThemedText type="subtitle">Subtitle Text</ThemedText>
      <ThemedText>Default Text</ThemedText>
      <ThemedText type="link">Link Text</ThemedText>
    </>
  ),
};
