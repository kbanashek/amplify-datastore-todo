import React from "react";
import { StyleProp, ViewStyle } from "react-native";

import { DateTimeField } from "@/components/ui/DateTimeField";

export interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  format?: (date: Date) => string;
  disabled?: boolean;
  error?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = props => {
  return <DateTimeField {...props} mode="datetime" />;
};
