import { useState } from "react";
import { TaskService } from "@orion/task-system";
import { CreateTaskInput, Task, TaskStatus, TaskType } from "../types/Task";

interface UseTaskFormReturn {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  taskType: TaskType;
  setTaskType: (type: TaskType) => void;
  status: TaskStatus;
  setStatus: (status: TaskStatus) => void;
  pk: string;
  setPk: (pk: string) => void;
  sk: string;
  setSk: (sk: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  dueTime: string;
  setDueTime: (time: string) => void;
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: () => Promise<Task | null>;
  reset: () => void;
}

interface UseTaskFormProps {
  onTaskCreated?: (task: Task) => void;
  initialTask?: Task;
}

// Helper to format date as YYYY-MM-DD
const formatDateForInput = (timestamp?: number | null): string => {
  if (!timestamp) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }
  return new Date(timestamp).toISOString().split("T")[0];
};

// Helper to format time as HH:MM
const formatTimeForInput = (timestamp?: number | null): string => {
  if (!timestamp) {
    return "11:45"; // Default time
  }
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper to combine date and time into timestamp
const combineDateAndTime = (dateStr: string, timeStr: string): number => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  return date.getTime();
};

export const useTaskForm = ({
  onTaskCreated,
  initialTask,
}: UseTaskFormProps = {}): UseTaskFormReturn => {
  const [title, setTitle] = useState<string>(initialTask?.title || "");
  const [description, setDescription] = useState<string>(
    initialTask?.description || ""
  );
  const [taskType, setTaskType] = useState<TaskType>(
    (initialTask?.taskType as TaskType) || TaskType.SCHEDULED
  );
  const [status, setStatus] = useState<TaskStatus>(
    (initialTask?.status as TaskStatus) || TaskStatus.OPEN
  );
  const [pk, setPk] = useState<string>(initialTask?.pk || `TASK-${Date.now()}`);
  const [sk, setSk] = useState<string>(initialTask?.sk || `SK-${Date.now()}`);
  const [dueDate, setDueDate] = useState<string>(
    formatDateForInput(initialTask?.expireTimeInMillSec)
  );
  const [dueTime, setDueTime] = useState<string>(
    formatTimeForInput(initialTask?.expireTimeInMillSec)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<Task | null> => {
    if (!title.trim()) {
      setError("Title is required");
      return null;
    }

    if (!pk.trim()) {
      setError("PK is required");
      return null;
    }

    if (!sk.trim()) {
      setError("SK is required");
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate expireTimeInMillSec from date and time inputs
      const expireTimeInMillSec = combineDateAndTime(dueDate, dueTime);

      const input: CreateTaskInput = {
        pk: pk.trim(),
        sk: sk.trim(),
        title: title.trim(),
        description: description.trim() || null,
        taskType,
        status,
        // Set default values for required fields
        startTimeInMillSec: initialTask?.startTimeInMillSec || Date.now(),
        expireTimeInMillSec: expireTimeInMillSec,
      };

      const task = await TaskService.createTask(input);

      if (onTaskCreated) {
        onTaskCreated(task);
      }

      // Reset form
      reset();

      return task;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create task. Please try again.";
      setError(errorMessage);
      console.error("Error creating task:", err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setTaskType(TaskType.SCHEDULED);
    setStatus(TaskStatus.OPEN);
    setPk(`TASK-${Date.now()}`);
    setSk(`SK-${Date.now()}`);
    setDueDate(formatDateForInput(null));
    setDueTime(formatTimeForInput(null));
    setError(null);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    taskType,
    setTaskType,
    status,
    setStatus,
    pk,
    setPk,
    sk,
    setSk,
    dueDate,
    setDueDate,
    dueTime,
    setDueTime,
    isSubmitting,
    error,
    handleSubmit,
    reset,
  };
};
