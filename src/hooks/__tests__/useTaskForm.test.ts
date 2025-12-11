import { renderHook, act } from '@testing-library/react-native';
import { useTaskForm } from '../useTaskForm';
import { TaskService } from '../../services/TaskService';
import { TaskType, TaskStatus } from '../../types/Task';
import { createMockTask } from '../../__tests__/__mocks__/DataStore.mock';

jest.mock('../../services/TaskService');

describe('useTaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTaskForm());

    expect(result.current.title).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.taskType).toBe(TaskType.SCHEDULED);
    expect(result.current.status).toBe(TaskStatus.OPEN);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with initial task values', () => {
    const initialTask = createMockTask({
      title: 'Initial Task',
      description: 'Initial Description',
      taskType: TaskType.TIMED,
      status: TaskStatus.STARTED,
    });

    const { result } = renderHook(() => useTaskForm({ initialTask }));

    expect(result.current.title).toBe('Initial Task');
    expect(result.current.description).toBe('Initial Description');
    expect(result.current.taskType).toBe(TaskType.TIMED);
    expect(result.current.status).toBe(TaskStatus.STARTED);
  });

  it('should update title', () => {
    const { result } = renderHook(() => useTaskForm());

    act(() => {
      result.current.setTitle('New Title');
    });

    expect(result.current.title).toBe('New Title');
  });

  it('should update description', () => {
    const { result } = renderHook(() => useTaskForm());

    act(() => {
      result.current.setDescription('New Description');
    });

    expect(result.current.description).toBe('New Description');
  });

  it('should validate required fields on submit', async () => {
    const { result } = renderHook(() => useTaskForm());

    await act(async () => {
      const task = await result.current.handleSubmit();
      expect(task).toBeNull();
    });

    expect(result.current.error).toBe('Title is required');
  });

  it('should create task successfully', async () => {
    const mockTask = createMockTask();
    (TaskService.createTask as jest.Mock).mockResolvedValue(mockTask);
    const onTaskCreated = jest.fn();

    const { result } = renderHook(() => useTaskForm({ onTaskCreated }));

    act(() => {
      result.current.setTitle('Test Task');
      result.current.setPk('TEST-PK');
      result.current.setSk('TEST-SK');
    });

    await act(async () => {
      const task = await result.current.handleSubmit();
      expect(task).toEqual(mockTask);
    });

    expect(TaskService.createTask).toHaveBeenCalled();
    expect(onTaskCreated).toHaveBeenCalledWith(mockTask);
    expect(result.current.title).toBe(''); // Form should be reset
  });

  it('should handle submit error', async () => {
    const error = new Error('Create failed');
    (TaskService.createTask as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTaskForm());

    act(() => {
      result.current.setTitle('Test Task');
      result.current.setPk('TEST-PK');
      result.current.setSk('TEST-SK');
    });

    await act(async () => {
      const task = await result.current.handleSubmit();
      expect(task).toBeNull();
    });

    expect(result.current.error).toBe('Create failed');
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useTaskForm());

    act(() => {
      result.current.setTitle('Test Title');
      result.current.setDescription('Test Description');
      result.current.setTaskType(TaskType.TIMED);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.title).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.taskType).toBe(TaskType.SCHEDULED);
  });
});



