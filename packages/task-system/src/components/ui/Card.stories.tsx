import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text, View } from "react-native";
import { Card } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      description: "Content to display inside the card",
      control: false, // Children are JSX, not controllable via Storybook
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card with simple text content
 */
export const Default: Story = {
  args: {
    children: <Text>Card content goes here</Text>,
  },
};

/**
 * Card with a title and body text
 */
export const WithTitleAndBody: Story = {
  args: {
    children: (
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          Card Title
        </Text>
        <Text>This is the card body with some descriptive text.</Text>
      </View>
    ),
  },
};

/**
 * Card with multiple content sections
 */
export const WithMultipleSections: Story = {
  args: {
    children: (
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          Task Information
        </Text>
        <Text style={{ marginBottom: 4 }}>Status: Active</Text>
        <Text style={{ marginBottom: 4 }}>Due: Tomorrow</Text>
        <Text style={{ marginBottom: 4 }}>Priority: High</Text>
      </View>
    ),
  },
};

/**
 * Card with rich content including styled text
 */
export const RichContent: Story = {
  args: {
    children: (
      <View>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
          Welcome to Orion Task System
        </Text>
        <Text style={{ marginBottom: 8, lineHeight: 20 }}>
          This card contains rich formatted text with multiple paragraphs and
          styling.
        </Text>
        <Text style={{ color: "#666", fontSize: 12 }}>
          Last updated: December 25, 2024
        </Text>
      </View>
    ),
  },
};

/**
 * Compact card with minimal content
 */
export const Compact: Story = {
  args: {
    children: <Text style={{ fontSize: 14 }}>Compact card</Text>,
  },
};

/**
 * Card with nested components
 */
export const WithNestedViews: Story = {
  args: {
    children: (
      <View>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Section 1</Text>
          <Text>Content for section 1</Text>
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Section 2</Text>
          <Text>Content for section 2</Text>
        </View>
        <View>
          <Text style={{ fontWeight: "bold" }}>Section 3</Text>
          <Text>Content for section 3</Text>
        </View>
      </View>
    ),
  },
};

/**
 * Wide card demonstrating horizontal layout
 */
export const WideContent: Story = {
  args: {
    children: (
      <View style={{ minWidth: 400 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Wide Card Layout
        </Text>
        <Text>
          This card demonstrates how content displays when it needs more
          horizontal space. The card will adapt to its content.
        </Text>
      </View>
    ),
  },
};
