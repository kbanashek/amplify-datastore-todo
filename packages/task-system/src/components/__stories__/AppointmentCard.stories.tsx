import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { AppointmentCard } from "@components/AppointmentCard";
import {
  Appointment,
  AppointmentType,
  AppointmentStatus,
} from "@task-types/Appointment";

// Mock appointment data
const baseAppointment: Partial<Appointment> = {
  appointmentId: "appt-1",
  eventId: "event-1",
  patientId: "patient-1",
  siteId: "site-1",
  title: "Doctor Appointment",
  appointmentType: AppointmentType.ONSITE,
  status: AppointmentStatus.SCHEDULED,
  startAt: new Date().toISOString(),
  endAt: new Date(Date.now() + 3600000).toISOString(),
};

const meta = {
  title: "Domain/AppointmentCard",
  component: AppointmentCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ minWidth: 350 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof AppointmentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Upcoming doctor appointment
 */
export const UpcomingAppointment: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Dr. Smith - Annual Checkup",
      description: "Routine health examination and consultation",
      location: "Medical Center, Building A, Room 205",
      startAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endAt: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
    },
  },
};

/**
 * Today's appointment
 */
export const TodayAppointment: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Physical Therapy Session",
      description: "Knee rehabilitation exercises",
      location: "Rehab Center, 2nd Floor",
      startAt: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      endAt: new Date(Date.now() + 9000000).toISOString(), // 2.5 hours from now
    },
  },
};

/**
 * Past appointment
 */
export const PastAppointment: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Cardiology Consultation",
      description: "Follow-up on heart health",
      location: "Heart Clinic",
      startAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      endAt: new Date(Date.now() - 86400000 + 1800000).toISOString(), // Yesterday + 30 min
    },
  },
};

/**
 * Virtual appointment
 */
export const VirtualAppointment: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Telehealth Video Call",
      description: "Online consultation with specialist",
      location: "Video Call (link will be sent 15 minutes before)",
      startAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      endAt: new Date(Date.now() + 5400000).toISOString(), // 1.5 hours from now
    },
  },
};

/**
 * Lab work appointment
 */
export const LabAppointment: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Blood Work - Fasting Required",
      description: "Routine lab tests - please fast for 12 hours before",
      location: "Lab Services, Ground Floor",
      startAt: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      endAt: new Date(Date.now() + 172800000 + 1800000).toISOString(), // 2 days + 30 min
    },
  },
};

/**
 * Specialist appointment with detailed info
 */
export const SpecialistAppointment: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Endocrinologist - Dr. Johnson",
      description: "Diabetes management and insulin adjustment consultation",
      location: "Diabetes Care Center, Suite 301",
      startAt: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      endAt: new Date(Date.now() + 259200000 + 2700000).toISOString(), // 3 days + 45 min
    },
  },
};

/**
 * Appointment without description
 */
export const MinimalInfo: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Dental Cleaning",
      location: "Dental Office",
      startAt: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
      endAt: new Date(Date.now() + 432000000 + 3600000).toISOString(),
    },
  },
};

/**
 * Long appointment title and location
 */
export const LongContent: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title:
        "Comprehensive Preventive Care and Wellness Examination with Multiple Specialists",
      description:
        "Full body checkup including cardiovascular assessment, diabetes screening, and general health evaluation",
      location:
        "Main Hospital Complex, Building C, Department of Internal Medicine, 3rd Floor, Suite 315",
      startAt: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
      endAt: new Date(Date.now() + 604800000 + 7200000).toISOString(), // 7 days + 2 hours
    },
  },
};

/**
 * Multiple appointments in a list
 */
export const AppointmentList: Story = {
  render: () => (
    <View style={{ gap: 12, minWidth: 350 }}>
      <AppointmentCard
        appointment={
          {
            ...baseAppointment,
            appointmentId: "appt-1",
            title: "Dr. Smith - Checkup",
            startAt: new Date(Date.now() + 3600000).toISOString(),
            endAt: new Date(Date.now() + 5400000).toISOString(),
          } as Appointment
        }
      />
      <AppointmentCard
        appointment={
          {
            ...baseAppointment,
            appointmentId: "appt-2",
            title: "Physical Therapy",
            description: "Knee exercises",
            startAt: new Date(Date.now() + 86400000).toISOString(),
            endAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          } as Appointment
        }
      />
      <AppointmentCard
        appointment={
          {
            ...baseAppointment,
            appointmentId: "appt-3",
            title: "Lab Work",
            description: "Fasting required",
            startAt: new Date(Date.now() + 172800000).toISOString(),
            endAt: new Date(Date.now() + 172800000 + 1800000).toISOString(),
          } as Appointment
        }
      />
    </View>
  ),
};

/**
 * Appointment with press handler
 */
export const Interactive: Story = {
  args: {
    appointment: {
      ...baseAppointment,
      title: "Click to View Details",
      description: "Tap this card to see more information",
      location: "Health Center",
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    },
    onPress: (apt: Appointment) =>
      console.log("Appointment pressed:", apt.title),
  },
};
