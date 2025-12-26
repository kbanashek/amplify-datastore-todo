import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost"],
      description: "Visual style variant of the button",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    loading: {
      control: "boolean",
      description: "Whether the button shows a loading spinner",
    },
    label: {
      control: "text",
      description: "Button label text",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button style - used for main call-to-action buttons
 */
export const Primary: Story = {
  args: {
    label: "Primary Button",
    variant: "primary",
    size: "md",
  },
};

/**
 * Secondary button style - used for less prominent actions
 */
export const Secondary: Story = {
  args: {
    label: "Secondary Button",
    variant: "secondary",
    size: "md",
  },
};

/**
 * Outline button style - used for tertiary actions
 */
export const Outline: Story = {
  args: {
    label: "Outline Button",
    variant: "outline",
    size: "md",
  },
};

/**
 * Ghost button style - minimal styling, often used for navigation
 */
export const Ghost: Story = {
  args: {
    label: "Ghost Button",
    variant: "ghost",
    size: "md",
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    label: "Small Button",
    variant: "primary",
    size: "sm",
  },
};

/**
 * Medium size button (default)
 */
export const Medium: Story = {
  args: {
    label: "Medium Button",
    variant: "primary",
    size: "md",
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    label: "Large Button",
    variant: "primary",
    size: "lg",
  },
};

/**
 * Loading state - button shows spinner and is disabled
 */
export const Loading: Story = {
  args: {
    label: "Loading...",
    loading: true,
    variant: "primary",
  },
};

/**
 * Disabled state - button cannot be interacted with
 */
export const Disabled: Story = {
  args: {
    label: "Disabled Button",
    disabled: true,
    variant: "primary",
  },
};

/**
 * Button with icon at the start
 */
export const WithStartIcon: Story = {
  args: {
    label: "With Icon",
    variant: "primary",
    startAdornment: <span style={{ fontSize: "20px" }}>📋</span>,
  },
};

/**
 * Button with icon at the end
 */
export const WithEndIcon: Story = {
  args: {
    label: "Next",
    variant: "primary",
    endAdornment: <span style={{ fontSize: "16px" }}>→</span>,
  },
};

/**
 * Button with icons on both sides
 */
export const WithBothIcons: Story = {
  args: {
    label: "Save",
    variant: "primary",
    startAdornment: <span style={{ fontSize: "16px" }}>💾</span>,
    endAdornment: <span style={{ fontSize: "16px" }}>✓</span>,
  },
};
