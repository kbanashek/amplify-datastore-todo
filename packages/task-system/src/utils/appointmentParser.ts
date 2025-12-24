import {
  Appointment,
  AppointmentData,
  GroupedAppointment,
} from "@task-types/Appointment";

/**
 * Parse appointment data from JSON structure
 */
export function parseAppointmentData(data: AppointmentData): Appointment[] {
  if (
    !data?.clinicPatientAppointments?.clinicAppointments?.items ||
    !Array.isArray(data.clinicPatientAppointments.clinicAppointments.items)
  ) {
    return [];
  }

  return data.clinicPatientAppointments.clinicAppointments.items.filter(
    appointment => appointment.isDeleted === 0
  );
}

/**
 * Format date to display label
 */
export function formatDateLabel(date: Date, today: Date = new Date()): string {
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dayAfterStart = new Date(tomorrowStart);
  dayAfterStart.setDate(dayAfterStart.getDate() + 1);

  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (dateStart.getTime() === todayStart.getTime()) {
    return "Today";
  } else if (dateStart.getTime() === tomorrowStart.getTime()) {
    return "Tomorrow";
  } else if (dateStart.getTime() === dayAfterStart.getTime()) {
    return "Day After Tomorrow";
  } else {
    // Format as "Dec 12, 2025"
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

/**
 * Format time for display (e.g., "2:00 p. m." or "12:50 p. m.")
 */
export function formatTime(date: Date, timezoneId?: string): string {
  // For now, use local time. In the future, can use timezoneId with a library like date-fns-tz
  // Format: "12:50 p. m." (lowercase with periods)
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Convert "PM" to "p. m." and "AM" to "a. m."
  return timeString.replace(/\s(AM|PM)/i, (match, period) => {
    const lower = period.toLowerCase();
    return ` ${lower.charAt(0)}. ${lower.charAt(1)}.`;
  });
}

/**
 * Format time range (e.g., "2:00 PM - 3:00 PM")
 */
export function formatTimeRange(
  startAt: string,
  endAt: string,
  timezoneId?: string
): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${formatTime(start, timezoneId)} - ${formatTime(end, timezoneId)}`;
}

/**
 * Extract a simple display label from an IANA timezone ID.
 *
 * Current implementation takes the last segment and returns its first 3 characters:
 * - "America/New_York" -> "NEW"
 * - "Europe/London" -> "LON"
 * - "UTC" -> "UTC"
 *
 * @param timezoneId - IANA timezone identifier (e.g., "America/New_York")
 * @returns Uppercased short label (first 3 chars of last segment) or empty string
 */
export function getTimezoneAbbreviation(timezoneId?: string | null): string {
  if (!timezoneId) {
    return "";
  }
  return timezoneId.split("/").pop()?.substring(0, 3)?.toUpperCase() ?? "";
}

/**
 * Group appointments by date
 * @param appointments - Array of appointments to group
 * @param timezoneId - Optional timezone ID for date calculations
 * @param todayOnly - If true, only include appointments for today (default: false)
 */
export function groupAppointmentsByDate(
  appointments: Appointment[],
  timezoneId?: string,
  todayOnly: boolean = false
): GroupedAppointment[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const grouped = new Map<string, Appointment[]>();

  // Filter for today if requested
  const filteredAppointments = todayOnly
    ? appointments.filter(appointment => {
        const startDate = new Date(appointment.startAt);
        return startDate >= todayStart && startDate < todayEnd;
      })
    : appointments;

  // Group by date (YYYY-MM-DD)
  filteredAppointments.forEach(appointment => {
    const startDate = new Date(appointment.startAt);
    const dateKey = startDate.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(appointment);
  });

  // Convert to array and sort by date
  const groupedArray: GroupedAppointment[] = Array.from(grouped.entries())
    .map(([dateKey, appointments]) => {
      const date = new Date(dateKey + "T00:00:00");
      return {
        date: dateKey,
        dateLabel: formatDateLabel(date, now),
        appointments: appointments.sort((a, b) => {
          // Sort by start time
          return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
        }),
      };
    })
    .sort((a, b) => {
      // Sort groups by date
      return a.date.localeCompare(b.date);
    });

  return groupedArray;
}
