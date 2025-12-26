import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { storiesOf } from "@storybook/react-native/V6";
import { TaskCard } from "../src/components/TaskCard";
import { AppointmentCard } from "../src/components/AppointmentCard";
import { Task, TaskType } from "../src/models";

// Create mock task data
const mockTask: Task = {
  id: "task-1",
  title: "Morning Medication",
  taskType: TaskType.SCHEDULED,
  startTimeInMillSec: Date.now() + 3600000, // 1 hour from now
  expiryTimeInMillSec: Date.now() + 7200000, // 2 hours from now
  isActive: true,
  isCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _version: 1,
  _lastChangedAt: Date.now(),
  _deleted: false,
} as Task;

const mockCompletedTask: Task = {
  ...mockTask,
  id: "task-2",
  title: "Completed Task",
  isCompleted: true,
} as Task;

const mockEpisodicTask: Task = {
  ...mockTask,
  id: "task-3",
  title: "Episodic Task (No Schedule)",
  taskType: TaskType.EPISODIC,
  startTimeInMillSec: undefined,
  expiryTimeInMillSec: undefined,
} as Task;

// TaskCard Stories
storiesOf("Domain Components/TaskCard", module)
  .add("Scheduled Task", () => (
    <View style={styles.container}>
      <TaskCard
        task={mockTask}
        onPress={task => Alert.alert("Task Pressed", task.title)}
      />
    </View>
  ))
  .add("Completed Task", () => (
    <View style={styles.container}>
      <TaskCard
        task={mockCompletedTask}
        onPress={task => Alert.alert("Task Pressed", task.title)}
      />
    </View>
  ))
  .add("Episodic Task", () => (
    <View style={styles.container}>
      <TaskCard
        task={mockEpisodicTask}
        onPress={task => Alert.alert("Task Pressed", task.title)}
      />
    </View>
  ))
  .add("Multiple Tasks", () => (
    <View style={styles.listContainer}>
      <TaskCard
        task={mockTask}
        onPress={task => Alert.alert("Task Pressed", task.title)}
      />
      <View style={styles.spacer} />
      <TaskCard
        task={mockCompletedTask}
        onPress={task => Alert.alert("Task Pressed", task.title)}
      />
      <View style={styles.spacer} />
      <TaskCard
        task={mockEpisodicTask}
        onPress={task => Alert.alert("Task Pressed", task.title)}
      />
    </View>
  ));

// AppointmentCard Stories
storiesOf("Domain Components/AppointmentCard", module)
  .add("Upcoming Appointment", () => (
    <View style={styles.container}>
      <AppointmentCard
        title="Dr. Smith Checkup"
        location="Main Clinic, Room 203"
        startTime={new Date(Date.now() + 86400000)} // Tomorrow
        onPress={() => Alert.alert("Appointment Pressed")}
      />
    </View>
  ))
  .add("No Location", () => (
    <View style={styles.container}>
      <AppointmentCard
        title="Telehealth Consultation"
        startTime={new Date(Date.now() + 86400000)}
        onPress={() => Alert.alert("Appointment Pressed")}
      />
    </View>
  ))
  .add("Multiple Appointments", () => (
    <View style={styles.listContainer}>
      <AppointmentCard
        title="Morning Checkup"
        location="Main Clinic"
        startTime={new Date(Date.now() + 3600000)}
        onPress={() => Alert.alert("Appointment 1")}
      />
      <View style={styles.spacer} />
      <AppointmentCard
        title="Physical Therapy"
        location="Therapy Center, Floor 2"
        startTime={new Date(Date.now() + 86400000)}
        onPress={() => Alert.alert("Appointment 2")}
      />
      <View style={styles.spacer} />
      <AppointmentCard
        title="Lab Tests"
        location="Laboratory Wing"
        startTime={new Date(Date.now() + 172800000)}
        onPress={() => Alert.alert("Appointment 3")}
      />
    </View>
  ));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  spacer: {
    height: 12,
  },
});
