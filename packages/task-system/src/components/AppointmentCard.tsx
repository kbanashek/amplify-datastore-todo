import { IconSymbol } from "./ui/IconSymbol";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppColors } from "../constants/AppColors";
import { Shadows, TextStyles } from "../constants/AppStyles";
import { useRTL } from "../hooks/useRTL";
import { useTranslatedText } from "../hooks/useTranslatedText";
import { Appointment, AppointmentType } from "../types/Appointment";
import {
  formatTime,
  getTimezoneAbbreviation,
} from "../utils/appointmentParser";

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: (appointment: Appointment) => void;
  timezoneId?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  timezoneId,
}) => {
  const { rtlStyle, isRTL } = useRTL();
  const { translatedText: title } = useTranslatedText(appointment.title);

  const isTelehealth =
    appointment.appointmentType === AppointmentType.TELEVISIT;
  const startTime = new Date(appointment.startAt);
  const formattedTime = formatTime(startTime, timezoneId);
  const timezoneAbbr = getTimezoneAbbreviation(timezoneId);

  const getAppointmentIcon = () => {
    if (isTelehealth) {
      return "video.fill";
    }
    return "building.2.fill";
  };

  const getAppointmentTypeLabel = () => {
    if (isTelehealth) {
      return "Telehealth";
    }
    return "Onsite Visit";
  };

  // Format: "Visit X starts at [time] [timezone]"
  const { translatedText: startsAtText } = useTranslatedText("starts at");
  const mainText = `${title} ${startsAtText} ${formattedTime}${
    timezoneAbbr ? ` ${timezoneAbbr}` : ""
  }`;

  const { translatedText: typeLabel } = useTranslatedText(
    getAppointmentTypeLabel()
  );

  const cardContent = (
    <View style={[styles.card, rtlStyle(styles.card) as any]}>
      {/* Icon on left */}
      <View
        style={[styles.iconContainer, rtlStyle(styles.iconContainer) as any]}
      >
        <IconSymbol
          name={getAppointmentIcon() as any}
          size={24}
          color={AppColors.white}
        />
      </View>

      {/* Content in middle */}
      <View style={styles.contentContainer}>
        <Text
          style={[styles.mainText, isRTL && styles.mainTextRTL]}
          numberOfLines={2}
        >
          {mainText}
        </Text>
        <Text style={[styles.typeLabel, isRTL && styles.typeLabelRTL]}>
          {typeLabel}
        </Text>
      </View>

      {/* Chevron on right */}
      <View
        style={[
          styles.chevronContainer,
          rtlStyle(styles.chevronContainer) as any,
        ]}
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
