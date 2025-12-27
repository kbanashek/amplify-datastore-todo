import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Text, View } from "react-native";
import { Card } from "../Card";
import { AppFonts } from "@constants/AppFonts";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
        <Text style={[AppFonts.subheading, { marginBottom: 8 }]}>
          Card Title
        </Text>
        <Text style={AppFonts.body}>
          This is the card body with some descriptive text.
        </Text>
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
        <Text style={[AppFonts.subheading, { marginBottom: 8 }]}>
          Task Information
        </Text>
        <Text style={[AppFonts.body, { marginBottom: 4 }]}>Status: Active</Text>
        <Text style={[AppFonts.body, { marginBottom: 4 }]}>Due: Tomorrow</Text>
        <Text style={[AppFonts.body, { marginBottom: 4 }]}>Priority: High</Text>
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
        <Text style={[AppFonts.subheading, { marginBottom: 12 }]}>
          Welcome to Orion Task System
        </Text>
        <Text style={[AppFonts.body, { marginBottom: 8, lineHeight: 20 }]}>
          This card contains rich formatted text with multiple paragraphs and
          styling.
        </Text>
        <Text style={[AppFonts.caption, { color: "#666" }]}>
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
    children: <Text style={AppFonts.small}>Compact card</Text>,
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
          <Text style={AppFonts.bodyBold}>Section 1</Text>
          <Text style={AppFonts.body}>Content for section 1</Text>
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={AppFonts.bodyBold}>Section 2</Text>
          <Text style={AppFonts.body}>Content for section 2</Text>
        </View>
        <View>
          <Text style={AppFonts.bodyBold}>Section 3</Text>
          <Text style={AppFonts.body}>Content for section 3</Text>
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
        <Text style={[AppFonts.bodyBold, { marginBottom: 8 }]}>
          Wide Card Layout
        </Text>
        <Text style={AppFonts.body}>
          This card demonstrates how content displays when it needs more
          horizontal space. The card will adapt to its content.
        </Text>
      </View>
    ),
  },
};
