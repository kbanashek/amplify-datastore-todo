import React from "react";
import { StyleProp, ViewStyle } from "react-native";

import { DateTimeField } from "@/components/ui/DateTimeField";

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  format?: (date: Date) => string;
  disabled?: boolean;
  error?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const DatePicker: React.FC<DatePickerProps> = props => {
  return <DateTimeField {...props} mode="date" />;
};
