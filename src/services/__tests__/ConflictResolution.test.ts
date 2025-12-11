import { DataStore, OpType } from '@aws-amplify/datastore';
import { ConflictResolution } from '../ConflictResolution';

jest.mock('@aws-amplify/datastore');

describe('ConflictResolution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('configure', () => {
    it('should configure DataStore with conflict handler', () => {
      ConflictResolution.configure();

      expect(DataStore.configure).toHaveBeenCalled();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      expect(configCall).toHaveProperty('conflictHandler');
      expect(typeof configCall.conflictHandler).toBe('function');
    });

    it('should handle Task UPDATE conflicts by preferring local status', async () => {
      ConflictResolution.configure();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      const conflictHandler = configCall.conflictHandler;

      const localModel = {
        id: 'test-id',
        status: 'STARTED',
        startTimeInMillSec: 1000,
        expireTimeInMillSec: 2000,
        activityAnswer: 'local-answer',
      };

      const remoteModel = {
        id: 'test-id',
        status: 'OPEN',
        startTimeInMillSec: 2000,
        expireTimeInMillSec: 3000,
        activityResponse: 'remote-response',
      };

      const mockModelConstructor = { name: 'Task' };

      const result = await conflictHandler({
        modelConstructor: mockModelConstructor,
        localModel,
        remoteModel,
        operation: OpType.UPDATE,
        attempts: 1,
      });

      expect(result.status).toBe('STARTED'); // Prefer local status
      expect(result.startTimeInMillSec).toBe(2000); // Prefer remote timing
      expect(result.activityAnswer).toBe('local-answer'); // Prefer local if exists
    });

    it('should handle DELETE conflicts for Task with incomplete local model', async () => {
      ConflictResolution.configure();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      const conflictHandler = configCall.conflictHandler;

      const localModel = {
        id: 'test-id',
        _deleted: true,
      };

      const remoteModel = {
        id: 'test-id',
        title: 'Remote Task',
        description: 'Remote Description',
      };

      const mockModelConstructor = { name: 'Task' };

      const result = await conflictHandler({
        modelConstructor: mockModelConstructor,
        localModel,
        remoteModel,
        operation: OpType.DELETE,
        attempts: 1,
      });

      expect(result._deleted).toBe(true);
    });

    it('should handle DELETE conflicts for models with missing pk/sk', async () => {
      ConflictResolution.configure();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      const conflictHandler = configCall.conflictHandler;

      const localModel = {
        id: 'test-id',
        _deleted: true,
        // Missing pk and sk
      };

      const remoteModel = {
        id: 'test-id',
        pk: 'remote-pk',
        sk: 'remote-sk',
      };

      const mockModelConstructor = { name: 'TaskAnswer' };

      const result = await conflictHandler({
        modelConstructor: mockModelConstructor,
        localModel,
        remoteModel,
        operation: OpType.DELETE,
        attempts: 1,
      });

      expect(result._deleted).toBe(true);
    });

    it('should handle DELETE conflicts when remote is already deleted', async () => {
      ConflictResolution.configure();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      const conflictHandler = configCall.conflictHandler;

      const localModel = {
        id: 'test-id',
        _deleted: false,
      };

      const remoteModel = {
        id: 'test-id',
        _deleted: true,
      };

      const mockModelConstructor = { name: 'TaskAnswer' };

      const result = await conflictHandler({
        modelConstructor: mockModelConstructor,
        localModel,
        remoteModel,
        operation: OpType.DELETE,
        attempts: 1,
      });

      expect(result).toEqual(remoteModel);
    });

    it('should default to remote model for CREATE operations', async () => {
      ConflictResolution.configure();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      const conflictHandler = configCall.conflictHandler;

      const localModel = {
        id: 'test-id',
        title: 'Local Title',
      };

      const remoteModel = {
        id: 'test-id',
        title: 'Remote Title',
      };

      const mockModelConstructor = { name: 'Task' };

      const result = await conflictHandler({
        modelConstructor: mockModelConstructor,
        localModel,
        remoteModel,
        operation: OpType.INSERT,
        attempts: 1,
      });

      expect(result).toEqual(remoteModel);
    });

    it('should handle Question DELETE conflicts with incomplete local model', async () => {
      ConflictResolution.configure();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      const conflictHandler = configCall.conflictHandler;

      const localModel = {
        id: 'test-id',
        _deleted: true,
        // Missing question and questionId
      };

      const remoteModel = {
        id: 'test-id',
        question: 'Remote Question',
        questionId: 'remote-question-id',
      };

      const mockModelConstructor = { name: 'Question' };

      const result = await conflictHandler({
        modelConstructor: mockModelConstructor,
        localModel,
        remoteModel,
        operation: OpType.DELETE,
        attempts: 1,
      });

      expect(result._deleted).toBe(true);
    });

    it('should handle Activity DELETE conflicts with incomplete local model', async () => {
      ConflictResolution.configure();
      const configCall = (DataStore.configure as jest.Mock).mock.calls[0][0];
      const conflictHandler = configCall.conflictHandler;

      const localModel = {
        id: 'test-id',
        _deleted: true,
        // Missing name and title
      };

      const remoteModel = {
        id: 'test-id',
        name: 'Remote Activity',
        title: 'Remote Title',
      };

      const mockModelConstructor = { name: 'Activity' };

      const result = await conflictHandler({
        modelConstructor: mockModelConstructor,
        localModel,
        remoteModel,
        operation: OpType.DELETE,
        attempts: 1,
      });

      expect(result._deleted).toBe(true);
    });
  });
});



