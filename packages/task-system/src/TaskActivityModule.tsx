import {
  NavigationContainer,
  NavigationIndependentTree,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { TaskContainer } from "./src/components/TaskContainer";
import { TranslationProvider } from "./src/contexts/TranslationContext";
import QuestionsScreen from "./src/screens/QuestionsScreen";

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

  return (
    <TranslationProvider>
      <NavigationIndependentTree>
        <View style={{ flex: 1, minHeight: 1 }}>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
              {...({ screenOptions: { headerShown: false } } as any)}
            >
              <Stack.Screen
                name="TaskDashboard"
                component={TaskContainer as any}
              />
              <Stack.Screen
                name="TaskQuestions"
                component={QuestionsScreen as any}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </NavigationIndependentTree>
    </TranslationProvider>
  );
};
