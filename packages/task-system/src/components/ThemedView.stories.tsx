import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text } from "react-native";
import { ThemedView } from "@components/ThemedView";
import { AppFonts } from "@constants/AppFonts";

const meta = {
  title: "Components/ThemedView",
  component: ThemedView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ThemedView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default themed view
 */
export const Default: Story = {
  args: {
    children: <Text>Content inside ThemedView</Text>,
    style: { padding: 20, borderRadius: 8 },
  },
};

/**
 * Themed view with multiple children
 */
export const WithMultipleChildren: Story = {
  args: {
    children: (
      <>
        <Text style={{ marginBottom: 8 }}>First child</Text>
        <Text style={{ marginBottom: 8 }}>Second child</Text>
        <Text>Third child</Text>
      </>
    ),
    style: { padding: 20, borderRadius: 8 },
  },
};

/**
 * Nested themed views
 */
export const Nested: Story = {
  render: () => (
    <ThemedView style={{ padding: 20, borderRadius: 8 }}>
      <Text style={[AppFonts.bodyBold, { marginBottom: 12 }]}>Outer View</Text>
      <ThemedView style={{ padding: 16, borderRadius: 4, opacity: 0.8 }}>
        <Text style={AppFonts.body}>Inner View</Text>
      </ThemedView>
    </ThemedView>
  ),
};

/**
 * Themed view as a card container
 */
export const AsCard: Story = {
  args: {
    children: (
      <>
        <Text style={[AppFonts.subheading, { marginBottom: 8 }]}>
          Card Title
        </Text>
        <Text style={[AppFonts.body, { marginBottom: 4 }]}>
          Card content goes here
        </Text>
        <Text style={[AppFonts.caption, { color: "#666" }]}>
          Additional information
        </Text>
      </>
    ),
    style: {
      padding: 20,
      borderRadius: 12,
      minWidth: 300,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};
