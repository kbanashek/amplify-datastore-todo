import React from "react";
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";

import { useThemeColor } from "@hooks/useThemeColor";

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A loading spinner component that displays an activity indicator.
 *
 * @param size - The size of the spinner. Can be 'small' or 'large'. Defaults to 'small'.
 * @param style - Optional styles to apply to the container view.
 * @param testID - Optional test ID for testing purposes.
 * @returns A loading spinner component.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "small",
  style,
  testID,
}) => {
  const color = useThemeColor({}, "tint");

  return (
    <View style={style} testID={testID}>
      <ActivityIndicator
        testID={testID ? `${testID}-indicator` : undefined}
        size={size}
        color={color}
      />
    </View>
  );
};
