import { DataStore } from '@aws-amplify/datastore';
import { TaskAnswerService } from '../TaskAnswerService';
import { TaskAnswer } from '../../../models';
import { createMockTaskAnswer } from '../../__tests__/__mocks__/DataStore.mock';

jest.mock('@aws-amplify/datastore');

describe('TaskAnswerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTaskAnswer', () => {
    it('should create a task answer successfully', async () => {
      const mockAnswer = createMockTaskAnswer();
      const input = {
        pk: 'test-pk',
        sk: 'test-sk',
        taskId: 'test-task-id',
        questionId: 'test-question-id',
        answer: 'Test Answer',
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockAnswer);

      const result = await TaskAnswerService.createTaskAnswer(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(TaskAnswer));
      expect(result).toEqual(mockAnswer);
    });
  });

  describe('getTaskAnswers', () => {
    it('should return all task answers', async () => {
      const mockAnswers = [
        createMockTaskAnswer({ id: '1' }),
        createMockTaskAnswer({ id: '2' }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockAnswers);

      const result = await TaskAnswerService.getTaskAnswers();

      expect(DataStore.query).toHaveBeenCalledWith(TaskAnswer);
      expect(result).toEqual(mockAnswers);
    });

    it('should return all task answers', async () => {
      const mockAnswers = [
        createMockTaskAnswer({ id: '1', taskId: 'task-1' }),
        createMockTaskAnswer({ id: '2', taskId: 'task-2' }),
        createMockTaskAnswer({ id: '3', taskId: 'task-1' }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockAnswers);

      const result = await TaskAnswerService.getTaskAnswers();

      expect(DataStore.query).toHaveBeenCalledWith(TaskAnswer);
      expect(result).toEqual(mockAnswers);
    });
  });

  describe('getTaskAnswer', () => {
    it('should return a task answer by id', async () => {
      const mockAnswer = createMockTaskAnswer({ id: 'test-id' });
      (DataStore.query as jest.Mock).mockResolvedValue(mockAnswer);

      const result = await TaskAnswerService.getTaskAnswer('test-id');

      expect(DataStore.query).toHaveBeenCalledWith(TaskAnswer, 'test-id');
      expect(result).toEqual(mockAnswer);
    });
  });

  describe('updateTaskAnswer', () => {
    it('should update a task answer successfully', async () => {
      const originalAnswer = createMockTaskAnswer({ id: 'test-id', answer: 'Original' });
      const updatedAnswer = createMockTaskAnswer({ id: 'test-id', answer: 'Updated' });

      (DataStore.query as jest.Mock).mockResolvedValue(originalAnswer);
      (DataStore.save as jest.Mock).mockResolvedValue(updatedAnswer);

      const result = await TaskAnswerService.updateTaskAnswer('test-id', { answer: 'Updated' });

      expect(result.answer).toBe('Updated');
    });
  });

  describe('deleteTaskAnswer', () => {
    it('should delete a task answer successfully', async () => {
      const mockAnswer = createMockTaskAnswer({ id: 'test-id' });
      (DataStore.query as jest.Mock).mockResolvedValue(mockAnswer);
      (DataStore.delete as jest.Mock).mockResolvedValue(mockAnswer);

      await TaskAnswerService.deleteTaskAnswer('test-id');

      expect(DataStore.delete).toHaveBeenCalledWith(mockAnswer);
    });
  });
});

