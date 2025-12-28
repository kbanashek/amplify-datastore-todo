import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { TaskCard } from "../TaskCard";
import { Task, TaskStatus, TaskType } from "@task-types/Task";

// Mock data for different task scenarios
const baseTask = {
  id: "task-1",
  pk: "TASK#task-1",
  sk: "TASK#task-1",
  title: "Morning Medication",
  description: "Take your prescribed medication with water",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _version: 1,
  _deleted: false,
  _lastChangedAt: Date.now(),
};

const meta = {
  title: "Domain/TaskCard",
  component: TaskCard,
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
} satisfies Meta<typeof TaskCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Open task ready to begin
 */
export const OpenTask: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Morning Exercise Routine",
      description: "Complete 30 minutes of light exercise",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      endTimeInMillSec: Date.now() + 3600000, // 1 hour from now
    },
    onPress: (task: Task) => console.log("Task pressed:", task.title),
  },
};

/**
 * Started task (shows RESUME button)
 */
export const StartedTask: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Health Assessment",
      description: "Complete your daily health questionnaire",
      status: TaskStatus.STARTED,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now() - 600000, // Started 10 min ago
      endTimeInMillSec: Date.now() + 3000000,
    },
    onPress: (task: Task) => console.log("Resuming task:", task.title),
  },
};

/**
 * Completed task
 */
export const CompletedTask: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Breakfast Medication",
      description: "Medication taken successfully",
      status: TaskStatus.COMPLETED,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now() - 7200000, // 2 hours ago
      endTimeInMillSec: Date.now() - 3600000, // 1 hour ago
    },
  },
};

/**
 * Timed task with urgency
 */
export const TimedTask: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Blood Pressure Check",
      description: "Measure and record your blood pressure",
      status: TaskStatus.OPEN,
      taskType: TaskType.TIMED,
      startTimeInMillSec: Date.now(),
      endTimeInMillSec: Date.now() + 1800000, // 30 minutes
    },
  },
};

/**
 * Medication task with icon
 */
export const MedicationTask: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Medication Reminder",
      description: "Take 2 tablets of prescribed medication",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      endTimeInMillSec: Date.now() + 3600000,
    },
  },
};

/**
 * Assessment task
 */
export const AssessmentTask: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Pain Assessment",
      description: "Rate your current pain level",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      endTimeInMillSec: Date.now() + 7200000, // 2 hours
    },
  },
};

/**
 * Simple card without BEGIN button
 */
export const SimpleCard: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Daily Exercise",
      description: "30 minutes of walking",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      endTimeInMillSec: Date.now() + 3600000,
    },
    simple: true,
  },
};

/**
 * Task with delete handler
 */
export const WithDeleteAction: Story = {
  args: {
    task: {
      ...baseTask,
      title: "Optional Task",
      description: "This task can be deleted",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      endTimeInMillSec: Date.now() + 3600000,
    },
    onDelete: (id: string) => console.log("Delete task:", id),
  },
};

/**
 * Multiple task cards showing different states
 */
export const TaskList: Story = {
  render: () => (
    <View style={{ gap: 12, minWidth: 350 }}>
      <TaskCard
        task={{
          ...baseTask,
          id: "task-1",
          title: "Morning Medication",
          status: TaskStatus.OPEN,
          taskType: TaskType.SCHEDULED,
          startTimeInMillSec: Date.now(),
          endTimeInMillSec: Date.now() + 3600000,
        }}
      />
      <TaskCard
        task={{
          ...baseTask,
          id: "task-2",
          title: "Health Survey",
          status: TaskStatus.STARTED,
          taskType: TaskType.SCHEDULED,
          startTimeInMillSec: Date.now() - 600000,
          endTimeInMillSec: Date.now() + 3000000,
        }}
      />
      <TaskCard
        task={{
          ...baseTask,
          id: "task-3",
          title: "Evening Exercise",
          status: TaskStatus.COMPLETED,
          taskType: TaskType.SCHEDULED,
          startTimeInMillSec: Date.now() - 7200000,
          endTimeInMillSec: Date.now() - 3600000,
        }}
      />
    </View>
  ),
};

/**
 * Long title and description
 */
export const LongContent: Story = {
  args: {
    task: {
      ...baseTask,
      title:
        "Complete Comprehensive Health Assessment and Wellness Questionnaire",
      description:
        "This is a detailed health assessment that includes multiple sections covering physical health, mental wellness, medication adherence, and lifestyle factors. Please take your time to answer all questions accurately.",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      endTimeInMillSec: Date.now() + 7200000,
    },
  },
};
