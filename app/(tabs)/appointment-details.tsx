import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  formatTime,
  getTimezoneAbbreviation,
  useRTL,
  useTranslatedText,
} from "@orion/task-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../../src/components/GlobalHeader";
import { AppColors } from "../../src/constants/AppColors";

export default function AppointmentDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rtlStyle, isRTL } = useRTL();

  // Parse appointment from params (passed as JSON string)
  const appointment: Appointment | null = useMemo(() => {
    console.log("[AppointmentDetails] Received params:", {
      hasAppointment: !!params.appointment,
      appointmentType: typeof params.appointment,
      appointmentLength:
        typeof params.appointment === "string" ? params.appointment.length : 0,
      timezoneId: params.timezoneId,
    });

    if (params.appointment && typeof params.appointment === "string") {
      try {
        const parsed = JSON.parse(params.appointment) as Appointment;
        console.log("[AppointmentDetails] Successfully parsed appointment:", {
          appointmentId: parsed.appointmentId,
          title: parsed.title,
          startAt: parsed.startAt,
          endAt: parsed.endAt,
        });
        return parsed;
      } catch (e) {
        console.error(
          "[AppointmentDetails] Failed to parse appointment from params:",
          e,
          {
            rawParams: params.appointment,
          }
        );
        return null;
      }
    }
    console.warn("[AppointmentDetails] No appointment in params or wrong type");
    return null;
  }, [params.appointment, params.timezoneId]);

  const { translatedText: headerTitle } = useTranslatedText(
    "Appointment Details"
  );
  const { translatedText: backText } = useTranslatedText("Back");
  const { translatedText: typeLabel } = useTranslatedText("Type");
  const { translatedText: startTimeLabel } = useTranslatedText("Start Time");
  const { translatedText: endTimeLabel } = useTranslatedText("End Time");
  const { translatedText: descriptionLabel } = useTranslatedText("Description");
  const { translatedText: instructionsLabel } =
    useTranslatedText("Instructions");
  const { translatedText: telehealthLabel } = useTranslatedText("Telehealth");
  const { translatedText: onsiteVisitLabel } =
    useTranslatedText("Onsite Visit");
  const { translatedText: scheduledLabel } = useTranslatedText("Scheduled");
  const { translatedText: cancelledLabel } = useTranslatedText("Cancelled");
  const { translatedText: completedLabel } = useTranslatedText("Completed");
  const { translatedText: inProgressLabel } = useTranslatedText("In Progress");
  const { translatedText: noAppointmentText } = useTranslatedText(
    "No appointment data available"
  );

  // Call hook before early return - use fallback if appointment is null
  const { translatedText: appointmentTitle } = useTranslatedText(
    appointment?.title || ""
  );

  if (!appointment) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlobalHeader
          title={headerTitle}
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{noAppointmentText}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{backText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isTelehealth =
    appointment.appointmentType === AppointmentType.TELEVISIT;
  const startTime = new Date(appointment.startAt);
  const endTime = new Date(appointment.endAt);
  const timezoneId = params.timezoneId as string | undefined;
  const formattedStartTime = formatTime(startTime, timezoneId);
  const formattedEndTime = formatTime(endTime, timezoneId);
  const timezoneAbbr = getTimezoneAbbreviation(timezoneId);

  const getAppointmentTypeText = () => {
    return isTelehealth ? telehealthLabel : onsiteVisitLabel;
  };

  const getStatusText = () => {
    switch (appointment.status) {
      case AppointmentStatus.SCHEDULED:
        return scheduledLabel;
      case AppointmentStatus.CANCELLED:
        return cancelledLabel;
      case AppointmentStatus.COMPLETED:
        return completedLabel;
      case AppointmentStatus.IN_PROGRESS:
        return inProgressLabel;
      default:
        return appointment.status;
    }
  };

  const getStatusColor = () => {
    switch (appointment.status) {
      case AppointmentStatus.SCHEDULED:
        return AppColors.CIBlue;
      case AppointmentStatus.CANCELLED:
        return AppColors.errorRed;
      case AppointmentStatus.COMPLETED:
        return AppColors.CIBlue;
      case AppointmentStatus.IN_PROGRESS:
        return AppColors.CIBlue;
      default:
        return AppColors.mediumDarkGray;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader
        title={headerTitle}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Icon and Title Section */}
        <View
          style={[styles.headerSection, rtlStyle(styles.headerSection) as any]}
        >
          <View style={styles.iconContainer}>
            <IconSymbol
              name={isTelehealth ? "video.fill" : "building.2.fill"}
              size={32}
              color={AppColors.white}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isRTL && styles.titleRTL]}>
              {appointmentTitle}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <DetailRow
            label={typeLabel}
            value={getAppointmentTypeText()}
            isRTL={isRTL}
          />
          <DetailRow
            label={startTimeLabel}
            value={`${formattedStartTime}${timezoneAbbr ? ` ${timezoneAbbr}` : ""}`}
            isRTL={isRTL}
          />
          <DetailRow
            label={endTimeLabel}
            value={`${formattedEndTime}${timezoneAbbr ? ` ${timezoneAbbr}` : ""}`}
            isRTL={isRTL}
          />
          {appointment.description && (
            <DetailRow
              label={descriptionLabel}
              value={appointment.description}
              isRTL={isRTL}
              multiline
            />
          )}
          {appointment.instructions && (
            <DetailRow
              label={instructionsLabel}
              value={appointment.instructions}
              isRTL={isRTL}
              multiline
            />
          )}
          {isTelehealth && appointment.telehealthMeetingId && (
            <DetailRow
              label="Meeting ID"
              value={appointment.telehealthMeetingId}
              isRTL={isRTL}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  isRTL: boolean;
  multiline?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  isRTL,
  multiline = false,
}) => {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, isRTL && styles.detailLabelRTL]}>
        {label}
      </Text>
      <Text
        style={[
          styles.detailValue,
          isRTL && styles.detailValueRTL,
          multiline && styles.detailValueMultiline,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.powderGray,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: AppColors.errorRed,
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: AppColors.CIBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.CIBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.CINavy,
    marginBottom: 8,
  },
  titleRTL: {
    textAlign: "right",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: AppColors.powderGray,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailsSection: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 20,
  },
  detailRow: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.ltGray,
    paddingBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.mediumDarkGray,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailLabelRTL: {
    textAlign: "right",
  },
  detailValue: {
    fontSize: 16,
    color: AppColors.gray,
    lineHeight: 22,
  },
  detailValueRTL: {
    textAlign: "right",
  },
  detailValueMultiline: {
    lineHeight: 24,
  },
});
