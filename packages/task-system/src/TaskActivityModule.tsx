import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { TaskContainer } from "./src/components/TaskContainer";
import { TranslationProvider } from "./src/contexts/TranslationContext";
import QuestionsScreen from "./src/screens/QuestionsScreen";

// Conditionally import NavigationIndependentTree (only available in RN 6.2+)
// For backward compatibility with RN 6.1.18, we'll use independent={true} instead
let NavigationIndependentTree:
  | React.FC<{ children: React.ReactNode }>
  | undefined;
try {
  const navModule = require("@react-navigation/native");
  NavigationIndependentTree = navModule.NavigationIndependentTree;
} catch {
  // NavigationIndependentTree not available (RN < 6.2)
  NavigationIndependentTree = undefined;
}

// Patch BaseNavigationContainer for RN 6.1.18 compatibility
// In 6.1.18, the independent prop doesn't exist, so we need to bypass the nested container check
if (!NavigationIndependentTree) {
  try {
    const ReactNavigationCore = require("@react-navigation/core");
    const coreAny = ReactNavigationCore as any;
    if (!coreAny._BaseNavigationContainerPatched && coreAny.default) {
      const BaseNavigationContainerOriginal = coreAny.default;
      const BaseNavigationContainerPatched = React.forwardRef(
        (props: any, ref: any) => {
          // Wrap in NavigationStateContext with isDefault: true to bypass nested container check
          // This makes BaseNavigationContainer think there's no parent container
          const NavigationStateContext =
            require("@react-navigation/core/src/NavigationStateContext").default;
          const defaultContextValue = {
            isDefault: true,
            getKey: () => undefined,
            setKey: () => {},
            getState: () => undefined,
            setState: () => {},
            getIsInitial: () => false,
          };
          return React.createElement(
            NavigationStateContext.Provider,
            { value: defaultContextValue },
            React.createElement(BaseNavigationContainerOriginal, {
              ...props,
              ref,
            })
          );
        }
      );
      BaseNavigationContainerPatched.displayName = "BaseNavigationContainer";
      coreAny.default = BaseNavigationContainerPatched;
      coreAny._BaseNavigationContainerPatched = true;
    }
  } catch {
    // Patch failed, continue without it
  }
}

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
    <View style={{ flex: 1, minHeight: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        {...({ independent: true } as any)}
      >
        <Stack.Navigator
          {...({ screenOptions: { headerShown: false } } as any)}
        >
          <Stack.Screen name="TaskDashboard" component={TaskContainer as any} />
          <Stack.Screen
            name="TaskQuestions"
            component={() => (
              <QuestionsScreen
                disableSafeAreaTopInset={disableSafeAreaTopInset}
              />
            )}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );

  return (
    <TranslationProvider>
      {NavigationIndependentTree ? (
        <NavigationIndependentTree>
          {navigationContent}
        </NavigationIndependentTree>
      ) : (
        navigationContent
      )}
    </TranslationProvider>
  );
};
