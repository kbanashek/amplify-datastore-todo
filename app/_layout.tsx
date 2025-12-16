// Import synchronous Amplify initialization first, before any other imports
import "../src/amplify-init-sync";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  useColorScheme,
  AmplifyProvider,
  TranslationProvider,
} from "@orion/task-system";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Verify Amplify is initialized at the root level
  useEffect(() => {
    // Amplify is already initialized by importing amplify-init-sync
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <TranslationProvider>
          <AmplifyProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AmplifyProvider>
        </TranslationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
