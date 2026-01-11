import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import {
  IconSymbol,
  TabBarBackground,
  useColorScheme,
} from "@orion/task-system";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Task Dashboard - Main screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Task Dashboard",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checkmark.circle.fill" color={color} />
          ),
        }}
      />
      {/* Dev Options - Development tools and data seeding */}
      <Tabs.Screen
        name="seed-screen"
        options={{
          title: "Dev Options",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="atom" color={color} />
          ),
        }}
      />
      {/* Hide all other screens from tab bar - accessible via navigation menu */}
      <Tabs.Screen
        name="task-dashboard-screen"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="datapoints"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="task-answers"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="task-results"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="task-history"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="appointment-details"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="storybook"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
