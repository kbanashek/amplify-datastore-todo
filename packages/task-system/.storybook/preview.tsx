import type { Preview } from "@storybook/react";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { initializeI18n } from "../src/translations/config/i18nConfig";

// Initialize i18n instance for Storybook
const i18n = initializeI18n({ debug: false });

// Global decorator for translations
const withI18next = (Story: any) => (
  <I18nextProvider i18n={i18n}>
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Story />
    </div>
  </I18nextProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a1a" },
        { name: "gray", value: "#f5f5f5" },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
        mobileLarge: {
          name: "Mobile Large",
          styles: {
            width: "414px",
            height: "896px",
          },
        },
        tablet: {
          name: "Tablet",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1280px",
            height: "800px",
          },
        },
      },
      defaultViewport: "mobile",
    },
    layout: "padded",
    docs: {
      toc: true,
    },
  },
  decorators: [withI18next],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
