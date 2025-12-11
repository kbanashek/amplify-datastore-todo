import { renderHook } from '@testing-library/react-native';
import { useGroupedTasks } from '../useGroupedTasks';
import { Task, TaskStatus, TaskType } from '../../types/Task';
import { createMockTask } from '../../__tests__/__mocks__/DataStore.mock';

describe('useGroupedTasks', () => {
  it('should group tasks by day and time', () => {
    const now = Date.now();
    const today = new Date(now);
    const tomorrow = new Date(now + 86400000);

    const tasks: Task[] = [
      createMockTask({
        id: '1',
        title: 'Today Task 1',
        expireTimeInMillSec: today.getTime(),
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
      createMockTask({
        id: '2',
        title: 'Today Task 2',
        expireTimeInMillSec: today.getTime() + 3600000, // 1 hour later
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
      createMockTask({
        id: '3',
        title: 'Tomorrow Task',
        expireTimeInMillSec: tomorrow.getTime(),
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
    ];

    const { result } = renderHook(() => useGroupedTasks(tasks));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].dayLabel).toBe('Today');
    expect(result.current[1].dayLabel).toBe('Tomorrow');
  });

  it('should always show COMPLETED and INPROGRESS tasks', () => {
    const pastDate = Date.now() - 86400000 * 2; // 2 days ago

    const tasks: Task[] = [
      createMockTask({
        id: '1',
        title: 'Completed Task',
        expireTimeInMillSec: pastDate,
        status: TaskStatus.COMPLETED,
        taskType: TaskType.SCHEDULED,
      }),
      createMockTask({
        id: '2',
        title: 'In Progress Task',
        expireTimeInMillSec: pastDate,
        status: TaskStatus.INPROGRESS,
        taskType: TaskType.SCHEDULED,
      }),
    ];

    const { result } = renderHook(() => useGroupedTasks(tasks));

    expect(result.current.length).toBeGreaterThan(0);
    const allTasks = result.current.flatMap((group) => [
      ...group.tasksWithoutTime,
      ...group.timeGroups.flatMap((tg) => tg.tasks),
    ]);
    expect(allTasks).toHaveLength(2);
  });

  it('should group tasks without time separately', () => {
    const tasks: Task[] = [
      createMockTask({
        id: '1',
        title: 'Task Without Time',
        expireTimeInMillSec: undefined,
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
      createMockTask({
        id: '2',
        title: 'Task With Time',
        expireTimeInMillSec: Date.now(),
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
    ];

    const { result } = renderHook(() => useGroupedTasks(tasks));

    expect(result.current.length).toBeGreaterThan(0);
    const todayGroup = result.current.find((g) => g.dayLabel === 'Today');
    expect(todayGroup).toBeDefined();
    expect(todayGroup?.tasksWithoutTime).toHaveLength(1);
    expect(todayGroup?.tasksWithoutTime[0].id).toBe('1');
  });

  it('should sort days with Today first', () => {
    const now = Date.now();
    const today = new Date(now);
    const tomorrow = new Date(now + 86400000);
    const dayAfter = new Date(now + 86400000 * 2);

    const tasks: Task[] = [
      createMockTask({
        id: '1',
        title: 'Day After Task',
        expireTimeInMillSec: dayAfter.getTime(),
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
      createMockTask({
        id: '2',
        title: 'Today Task',
        expireTimeInMillSec: today.getTime(),
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
      createMockTask({
        id: '3',
        title: 'Tomorrow Task',
        expireTimeInMillSec: tomorrow.getTime(),
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
    ];

    const { result } = renderHook(() => useGroupedTasks(tasks));

    expect(result.current[0].dayLabel).toBe('Today');
    expect(result.current[1].dayLabel).toBe('Tomorrow');
  });

  it('should group tasks by time within a day', () => {
    const now = Date.now();
    const today = new Date(now);
    today.setHours(10, 0, 0, 0);

    const tasks: Task[] = [
      createMockTask({
        id: '1',
        title: '10 AM Task',
        expireTimeInMillSec: today.getTime(),
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
      createMockTask({
        id: '2',
        title: '2 PM Task',
        expireTimeInMillSec: today.getTime() + 4 * 3600000, // 4 hours later
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
      }),
    ];

    const { result } = renderHook(() => useGroupedTasks(tasks));

    const todayGroup = result.current.find((g) => g.dayLabel === 'Today');
    expect(todayGroup).toBeDefined();
    expect(todayGroup?.timeGroups).toHaveLength(2);
  });
});



