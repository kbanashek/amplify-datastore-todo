import React from "react";
import { View } from "react-native";

/**
 * Optional UI element in the original app.
 * In the packaged module we keep it as a no-op placeholder to avoid hard coupling
 * to the app’s network/sync state implementation.
 */
export const NetworkStatusIndicator: React.FC = () => {
  return <View />;
};
