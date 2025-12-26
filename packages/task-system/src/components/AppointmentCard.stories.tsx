import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { AppointmentCard } from "./AppointmentCard";

// Mock appointment data
const baseAppointment = {
  id: "appt-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _version: 1,
  _deleted: false,
  _lastChangedAt: Date.now(),
};

const meta = {
  title: "Domain/AppointmentCard",
  component: AppointmentCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    appointment: {
      description: "Appointment object to display",
      control: false, // Complex object, not controllable via Storybook
    },
    onPress: {
      description: "Callback when card is pressed",
      control: false,
    },
  },
  decorators: [
    Story => (
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
      startDateTime: Date.now() + 86400000, // Tomorrow
      endDateTime: Date.now() + 86400000 + 3600000, // Tomorrow + 1 hour
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
      startDateTime: Date.now() + 7200000, // 2 hours from now
      endDateTime: Date.now() + 9000000, // 2.5 hours from now
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
      startDateTime: Date.now() - 86400000, // Yesterday
      endDateTime: Date.now() - 86400000 + 1800000, // Yesterday + 30 min
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
      startDateTime: Date.now() + 3600000, // 1 hour from now
      endDateTime: Date.now() + 5400000, // 1.5 hours from now
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
      startDateTime: Date.now() + 172800000, // 2 days from now
      endDateTime: Date.now() + 172800000 + 1800000, // 2 days + 30 min
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
      startDateTime: Date.now() + 259200000, // 3 days from now
      endDateTime: Date.now() + 259200000 + 2700000, // 3 days + 45 min
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
      startDateTime: Date.now() + 432000000, // 5 days from now
      endDateTime: Date.now() + 432000000 + 3600000,
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
      startDateTime: Date.now() + 604800000, // 7 days from now
      endDateTime: Date.now() + 604800000 + 7200000, // 7 days + 2 hours
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
        appointment={{
          ...baseAppointment,
          id: "appt-1",
          title: "Dr. Smith - Checkup",
          location: "Medical Center",
          startDateTime: Date.now() + 3600000,
          endDateTime: Date.now() + 5400000,
        }}
      />
      <AppointmentCard
        appointment={{
          ...baseAppointment,
          id: "appt-2",
          title: "Physical Therapy",
          description: "Knee exercises",
          location: "Rehab Center",
          startDateTime: Date.now() + 86400000,
          endDateTime: Date.now() + 86400000 + 3600000,
        }}
      />
      <AppointmentCard
        appointment={{
          ...baseAppointment,
          id: "appt-3",
          title: "Lab Work",
          description: "Fasting required",
          location: "Lab Services",
          startDateTime: Date.now() + 172800000,
          endDateTime: Date.now() + 172800000 + 1800000,
        }}
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
      startDateTime: Date.now() + 86400000,
      endDateTime: Date.now() + 86400000 + 3600000,
    },
    onPress: apt => console.log("Appointment pressed:", apt.title),
  },
};
