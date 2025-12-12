import React from "react";
import { StyleSheet, View } from "react-native";
import { AppColors } from "../../constants/AppColors";
import { ReviewScreen } from "./ReviewScreen";
import { ParsedActivityData } from "../../utils/activityParser";

interface ReviewScreenContainerProps {
  activityData: ParsedActivityData;
  answers: Record<string, any>;
  isSubmitting: boolean;
  onEditQuestion?: (questionId: string) => void;
  onSubmit: () => void;
  bottomInset?: number;
  tabBarHeight?: number;
}

export const ReviewScreenContainer: React.FC<ReviewScreenContainerProps> = ({
  activityData,
  answers,
  isSubmitting,
  onEditQuestion,
  onSubmit,
  bottomInset = 0,
  tabBarHeight = 0,
}) => {
  return (
    <View style={styles.reviewContainer}>
      <ReviewScreen 
        screens={activityData.screens} 
        answers={answers}
        onEditQuestion={onEditQuestion}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        bottomInset={bottomInset}
        tabBarHeight={tabBarHeight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
});



