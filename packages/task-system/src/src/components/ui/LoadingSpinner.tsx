import React from "react";
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";

import { useThemeColor } from "../../hooks/useThemeColor";

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

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
