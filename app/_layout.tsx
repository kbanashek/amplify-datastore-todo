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
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  AmplifyProvider,
  TranslationProvider,
  useColorScheme,
} from "@orion/task-system";
import { bootstrapTaskSystem } from "../src/bootstrap/taskSystemBootstrap";
import { LoggingProvider } from "../src/contexts/LoggingContext";
import { useLogger } from "../src/hooks/useLogger";

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const logger = useLogger();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isTaskSystemReady, setIsTaskSystemReady] = useState(false);

  // LX-style host ownership:
  // - Host owns Amplify.configure() (via amplify-init-sync import above)
  // - Host explicitly starts DataStore and gates app render until ready
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        logger.info(
          "Starting task system bootstrap",
          undefined,
          "RootLayout",
          "",
          "🚀"
        );
        await bootstrapTaskSystem({ startDataStore: true });
        if (!cancelled) {
          logger.info(
            "Task system bootstrap complete - app ready to render",
            undefined,
            "RootLayout",
            "",
            "✅"
          );
        }
      } catch (error) {
        logger.error(
          "Failed to initialize task system/DataStore",
          error,
          "RootLayout"
        );
      } finally {
        if (!cancelled) setIsTaskSystemReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [logger]);

  if (!loaded || !isTaskSystemReady) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <TranslationProvider>
          <AmplifyProvider autoStartDataStore={false}>
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

export default function RootLayout() {
  return (
    <LoggingProvider>
      <RootLayoutContent />
    </LoggingProvider>
  );
}
