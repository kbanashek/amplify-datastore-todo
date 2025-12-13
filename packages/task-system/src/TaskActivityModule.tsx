import React from "react";
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import { TaskContainer } from "./src/components/TaskContainer";
import QuestionsScreen from "./src/screens/QuestionsScreen";
import { TranslationProvider } from "./src/contexts/TranslationContext";

export type TaskSystemStackParamList = {
  TaskDashboard: undefined;
  TaskQuestions: { taskId: string; entityId: string };
};

const Stack = createNativeStackNavigator<TaskSystemStackParamList>();

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
export const TaskActivityModule: React.FC = () => {
  return (
    <TranslationProvider>
      <NavigationIndependentTree>
        <View style={{ flex: 1, minHeight: 1 }}>
          <NavigationContainer>
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
