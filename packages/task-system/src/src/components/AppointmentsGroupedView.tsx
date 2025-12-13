import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AppColors } from "../constants/AppColors";
import { useRTL } from "../hooks/useRTL";
import { useTranslatedText } from "../hooks/useTranslatedText";
import { Appointment, GroupedAppointment } from "../types/Appointment";
import { AppointmentCard } from "./AppointmentCard";

interface AppointmentsGroupedViewProps {
  groupedAppointments: GroupedAppointment[];
  loading?: boolean;
  error?: string | null;
  onAppointmentPress?: (appointment: Appointment) => void;
  timezoneId?: string;
  hideDateHeader?: boolean; // If true, don't show the date header
}

export const AppointmentsGroupedView: React.FC<
  AppointmentsGroupedViewProps
> = ({
  groupedAppointments,
  loading = false,
  error = null,
  onAppointmentPress,
  timezoneId,
  hideDateHeader = false,
}) => {
  const { rtlStyle, isRTL } = useRTL();
  const { translatedText: noAppointmentsText } = useTranslatedText(
    "No appointments scheduled"
  );
  const { translatedText: loadingText } = useTranslatedText(
    "Loading appointments..."
  );
  const { translatedText: errorText } = useTranslatedText(
    "Error loading appointments"
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.CIBlue} />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorText}</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (groupedAppointments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{noAppointmentsText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groupedAppointments.map(group => (
        <View key={group.date} style={styles.dayGroup}>
          {/* Date Header - only show if not hidden */}
          {!hideDateHeader && (
            <View style={[styles.dayHeader, rtlStyle(styles.dayHeader) as any]}>
              <Text style={[styles.dayLabel, isRTL && styles.dayLabelRTL]}>
                {group.dateLabel}
              </Text>
              <Text style={[styles.dayDate, isRTL && styles.dayDateRTL]}>
                {new Date(group.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}

          {/* Appointments */}
          {group.appointments.map(appointment => (
            <AppointmentCard
              key={appointment.appointmentId}
              appointment={appointment}
              onPress={onAppointmentPress}
              timezoneId={timezoneId}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.mediumDarkGray,
  },
  errorText: {
    fontSize: 16,
    color: AppColors.errorRed,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  errorDetail: {
    fontSize: 14,
    color: AppColors.mediumDarkGray,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.mediumDarkGray,
    textAlign: "center",
  },
  dayGroup: {
    marginBottom: 32,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
    gap: 12,
  },
  dayLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.CINavy,
  },
  dayLabelRTL: {
    textAlign: "right",
  },
  dayDate: {
    fontSize: 16,
    color: AppColors.mediumDarkGray,
    fontWeight: "400",
  },
  dayDateRTL: {
    textAlign: "right",
  },
});
