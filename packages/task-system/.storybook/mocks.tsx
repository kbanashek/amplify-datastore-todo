/**
 * Mock utilities for Storybook stories
 *
 * These mocks are used when components require dependencies that don't work
 * in the Storybook web environment (DataStore, native modules, etc.)
 */

import React from "react";
import { Text } from "react-native";

/**
 * Mock @expo/vector-icons components
 * These are used as aliases in webpack config to replace actual icon libraries
 */
export const MaterialIcons = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

export const Ionicons = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

export const FontAwesome = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

export const FontAwesome5 = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

export const MaterialCommunityIcons = ({
  name,
  size,
  color,
  ...props
}: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

export const Feather = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

export const AntDesign = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

export const Entypo = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size, color }}>
    [{name}]
  </Text>
);

// Default export for when @expo/vector-icons is imported as whole
export default {
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
  AntDesign,
  Entypo,
};

/**
 * Mock DataStore for components that query or observe data
 */
export const mockDataStore = {
  query: () => Promise.resolve([]),
  save: (model: any) => Promise.resolve(model),
  delete: () => Promise.resolve({}),
  observe: () => ({
    subscribe: () => ({
      unsubscribe: () => {},
    }),
  }),
  observeQuery: () => ({
    subscribe: () => ({
      unsubscribe: () => {},
    }),
  }),
  clear: () => Promise.resolve(),
};

/**
 * Mock theme colors for useThemeColor hook
 */
export const mockUseThemeColor = (props: any, colorName: string) => {
  const colors: Record<string, string> = {
    tint: "#0a7ea4",
    background: "#ffffff",
    text: "#11181C",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
  };
  return colors[colorName] || "#000000";
};

/**
 * Mock logger for components that use logging
 */
export const mockLogger = {
  info: (message: string, metadata?: any) => {
    console.log(`[INFO] ${message}`, metadata);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, metadata?: any) => {
    console.warn(`[WARN] ${message}`, metadata);
  },
  debug: (message: string, metadata?: any) => {
    console.debug(`[DEBUG] ${message}`, metadata);
  },
  createLogger: (serviceName: string) => mockLogger,
};

/**
 * Mock translation function for i18next
 */
export const mockTranslation = (key: string, options?: any) => {
  // Return the key itself as a fallback
  return options?.defaultValue || key;
};

/**
 * Mock task data for stories that need task objects
 */
export const mockTask = {
  id: "task-1",
  title: "Sample Task",
  description: "This is a sample task for Storybook",
  status: "OPEN",
  priority: "MEDIUM",
  startTimeInMillSec: Date.now(),
  endTimeInMillSec: Date.now() + 3600000, // 1 hour from now
  taskType: "SCHEDULED",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock appointment data for stories that need appointment objects
 */
export const mockAppointment = {
  id: "appointment-1",
  title: "Doctor Appointment",
  description: "Annual checkup",
  startDateTime: Date.now(),
  endDateTime: Date.now() + 3600000,
  location: "Medical Center",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock question data for stories that need question objects
 */
export const mockQuestion = {
  id: "question-1",
  text: "How are you feeling today?",
  questionType: "SINGLE_SELECT",
  choices: [
    { id: "choice-1", text: "Great", value: "great" },
    { id: "choice-2", text: "Good", value: "good" },
    { id: "choice-3", text: "Okay", value: "okay" },
    { id: "choice-4", text: "Not well", value: "not-well" },
  ],
  required: true,
  screenIndex: 0,
};

/**
 * Mock network status for components that show connectivity
 */
export const mockNetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  type: "wifi",
};

/**
 * Helper to create a mock React Navigation navigation object
 */
export const createMockNavigation = () => ({
  navigate: () => {},
  goBack: () => {},
  reset: () => {},
  setParams: () => {},
  dispatch: () => {},
  isFocused: () => true,
  canGoBack: () => true,
  getParent: () => null,
  getState: () => ({ routes: [], index: 0 }),
  addListener: () => () => {},
  removeListener: () => {},
});

/**
 * Helper to create a mock React Navigation route object
 */
export const createMockRoute = (params: any = {}) => ({
  key: "route-key",
  name: "ScreenName",
  params,
});
