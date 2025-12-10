import { useState } from "react";
import { TaskService } from "../services/TaskService";
import { Task, CreateTaskInput, TaskType, TaskStatus } from "../types/Task";

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
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: () => Promise<Task | null>;
  reset: () => void;
}

interface UseTaskFormProps {
  onTaskCreated?: (task: Task) => void;
  initialTask?: Task;
}

export const useTaskForm = ({ onTaskCreated, initialTask }: UseTaskFormProps = {}): UseTaskFormReturn => {
  const [title, setTitle] = useState<string>(initialTask?.title || "");
  const [description, setDescription] = useState<string>(initialTask?.description || "");
  const [taskType, setTaskType] = useState<TaskType>(initialTask?.taskType || TaskType.SCHEDULED);
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || TaskStatus.OPEN);
  const [pk, setPk] = useState<string>(initialTask?.pk || `TASK-${Date.now()}`);
  const [sk, setSk] = useState<string>(initialTask?.sk || `SK-${Date.now()}`);
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
      const input: CreateTaskInput = {
        pk: pk.trim(),
        sk: sk.trim(),
        title: title.trim(),
        description: description.trim() || null,
        taskType,
        status,
        // Set default values for required fields
        startTimeInMillSec: initialTask?.startTimeInMillSec || Date.now(),
        expireTimeInMillSec: initialTask?.expireTimeInMillSec || Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      };

      const task = await TaskService.createTask(input);

      if (onTaskCreated) {
        onTaskCreated(task);
      }

      // Reset form
      reset();

      return task;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create task. Please try again.";
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
    isSubmitting,
    error,
    handleSubmit,
    reset,
  };
};

