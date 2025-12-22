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

// Module-level deduplication for RootLayout logs
const rootLayoutLogs = new Map<string, number>();
const ROOT_LAYOUT_LOG_DEDUP_MS = 10000; // 10 second window (React Strict Mode)

/**
 * Deduplicated RootLayout logging
 * Uses module-level cache to prevent duplicates even with React Strict Mode double renders
 */
function logRootLayout(logger: any, message: string, icon: string): void {
  const signature = `rootlayout-${message}`;
  const now = Date.now();
  const lastLogTime = rootLayoutLogs.get(signature) || 0;

  // Skip if logged within the deduplication window
  if (now - lastLogTime < ROOT_LAYOUT_LOG_DEDUP_MS) {
    return; // Skip duplicate
  }

  logger.info(message, undefined, "RootLayout", "", icon);
  rootLayoutLogs.set(signature, now);

  // Clean up old entries periodically
  if (rootLayoutLogs.size > 50) {
    const entries = Array.from(rootLayoutLogs.entries());
    entries
      .sort((a, b) => a[1] - b[1])
      .slice(0, 25)
      .forEach(([key]) => rootLayoutLogs.delete(key));
  }
}

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
        logRootLayout(logger, "Starting task system bootstrap", "🚀");
        await bootstrapTaskSystem({ startDataStore: true });
        if (!cancelled) {
          logRootLayout(
            logger,
            "Task system bootstrap complete - app ready to render",
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
