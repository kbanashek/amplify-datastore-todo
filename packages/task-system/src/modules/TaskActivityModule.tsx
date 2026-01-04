import {
  NavigationContainer,
  NavigationIndependentTree,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { i18n } from "i18next";
import React, { useContext, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { TaskContainer } from "@components/TaskContainer";
import QuestionsScreen from "@screens/QuestionsScreen";
import { LanguageCode } from "@services/translationTypes";
import { TranslationProvider } from "@translations/index";
import { TranslationContext } from "@translations/TranslationProvider";

export type TaskSystemStackParamList = {
  TaskDashboard: undefined;
  TaskQuestions: { taskId: string; entityId: string };
};

const Stack = createNativeStackNavigator<TaskSystemStackParamList>();

export interface TaskActivityModuleProps {
  /**
   * When this value changes, the module resets back to the dashboard route.
   * Useful for host apps that want "tab re-press" behavior to pop-to-top.
   */
  resetSignal?: number;

  /**
   * Disable applying a top safe-area inset inside internal module screens.
   * Use this when embedding under a host header that already applies insets.
   */
  disableSafeAreaTopInset?: boolean;

  /**
   * Preferred language from LX app.
   * If provided, this will be used as the initial language.
   */
  preferredLanguage?: LanguageCode;

  /**
   * Optional parent i18next instance for integration with LX app.
   * If provided, the module will use the parent's i18next instance with namespace isolation.
   */
  parentI18n?: i18n;
}

/**
 * Self-contained task/activity module.
 *
 * Drop into LX anywhere:
 *   <TaskActivityModule />
 *
 * Notes:
 * - Uses its own independent NavigationContainer.
 * - Expects Amplify/DataStore to be configured in the host runtime.
 */
export const TaskActivityModule: React.FC<TaskActivityModuleProps> = ({
  resetSignal,
  disableSafeAreaTopInset = false,
  preferredLanguage,
  parentI18n,
}) => {
  const navigationRef = useMemo(
    () => createNavigationContainerRef<TaskSystemStackParamList>(),
    []
  );

  useEffect(() => {
    if (resetSignal === undefined) return;
    if (!navigationRef.isReady()) return;

    navigationRef.resetRoot({
      index: 0,
      routes: [{ name: "TaskDashboard" }],
    });
  }, [navigationRef, resetSignal]);

  const navigationContent = (
    <View style={styles.navigationWrapper}>
      {/* @ts-expect-error - independent prop exists but not in types */}
      <NavigationContainer ref={navigationRef} independent={true}>
        <Stack.Navigator
          id="task-system-stack"
          screenOptions={{
            headerShown: false,
            contentStyle: { margin: 0, padding: 0 },
          }}
        >
          <Stack.Screen name="TaskDashboard" component={TaskContainer} />
          <Stack.Screen name="TaskQuestions">
            {() => (
              <QuestionsScreen
                disableSafeAreaTopInset={disableSafeAreaTopInset}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );

  const existingTranslationContext = useContext(TranslationContext);

  const content = NavigationIndependentTree ? (
    <NavigationIndependentTree>{navigationContent}</NavigationIndependentTree>
  ) : (
    navigationContent
  );

  if (existingTranslationContext) {
    return content;
  }

  return (
    <TranslationProvider
      preferredLanguage={preferredLanguage}
      parentI18n={parentI18n}
    >
      {content}
    </TranslationProvider>
  );
};

const styles = StyleSheet.create({
  navigationWrapper: {
    flex: 1,
    minHeight: 1,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: "transparent",
  },
});
