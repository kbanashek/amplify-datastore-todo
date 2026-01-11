import { IconSymbol } from "@components/ui/IconSymbol";
import { AppColors } from "@constants/AppColors";
import { Shadows, TextStyles } from "@constants/AppStyles";
import { useRTL } from "@hooks/useRTL";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { Appointment } from "@task-types/Appointment";
import { useTaskTranslation } from "@translations/index";
import { getAppointmentIconConfig } from "@utils/icons/appointmentIcon";
import { formatTime, getTimezoneAbbreviation } from "@utils/parsers/appointmentParser";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: (appointment: Appointment) => void;
  timezoneId?: string;
}

/**
 * A card component for displaying appointment information.
 *
 * @param appointment - The appointment to display
 * @param onPress - Optional callback function when the card is pressed
 * @param timezoneId - The timezone ID to use for formatting the time
 * @returns A themed appointment card component with the provided appointment information
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  timezoneId,
}) => {
  const { rtlStyle, isRTL } = useRTL();
  const { t } = useTaskTranslation();
  const { translatedText: title } = useTranslatedText(appointment.title);

  const startTime = new Date(appointment.startAt);
  const formattedTime = formatTime(startTime, timezoneId);
  const timezoneAbbr = getTimezoneAbbreviation(timezoneId);

  const iconConfig = getAppointmentIconConfig(appointment.appointmentType);

  // Format: "Visit X starts at [time] [timezone]"
  const { translatedText: startsAtText } = useTranslatedText("starts at");
  const mainText = `${title} ${startsAtText} ${formattedTime}${
    timezoneAbbr ? ` ${timezoneAbbr}` : ""
  }`;

  const typeLabel = t(iconConfig.translationKey);

  const cardContent = (
    <View
      style={[styles.card, rtlStyle(styles.card) as any]}
      testID="appointment-card"
    >
      {/* Icon on left */}
      <View
        style={[styles.iconContainer, rtlStyle(styles.iconContainer) as any]}
        testID="appointment-card-icon-container"
      >
        <IconSymbol
          name={iconConfig.iconName as any}
          size={24}
          color={AppColors.white}
        />
      </View>

      {/* Content in middle */}
      <View style={styles.contentContainer}>
        <Text
          style={[styles.mainText, isRTL && styles.mainTextRTL]}
          numberOfLines={2}
          testID="appointment-card-title"
        >
          {mainText}
        </Text>
        <Text
          style={[styles.typeLabel, isRTL && styles.typeLabelRTL]}
          testID="appointment-card-type-label"
        >
          {typeLabel}
        </Text>
      </View>

      {/* Chevron on right */}
      <View
        style={[
          styles.chevronContainer,
          rtlStyle(styles.chevronContainer) as any,
        ]}
        testID="appointment-card-chevron"
      >
        <IconSymbol
          name={isRTL ? "chevron.left" : "chevron.right"}
          size={20}
          color={AppColors.white}
        />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => onPress(appointment)}
        activeOpacity={0.7}
        testID="appointment-card-button"
        accessibilityRole="button"
        accessibilityLabel={`${title} ${startsAtText} ${formattedTime}`}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  // Solid blue card matching design
  card: {
    backgroundColor: AppColors.CIBlue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.card,
  },
  iconContainer: {
    marginRight: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    marginRight: 12,
  },
  mainText: {
    ...TextStyles.title,
    marginBottom: 4,
    lineHeight: 22,
  },
  mainTextRTL: {
    textAlign: "right",
  },
  typeLabel: {
    ...TextStyles.body,
    opacity: 0.9,
  },
  typeLabelRTL: {
    textAlign: "right",
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
});
