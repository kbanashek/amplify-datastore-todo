import { DataStore } from '@aws-amplify/datastore';
import { DataPointService } from '../DataPointService';
import { DataPoint, DataPointInstance } from '../../../models';

jest.mock('@aws-amplify/datastore');

describe('DataPointService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDataPoint', () => {
    it('should create a data point successfully', async () => {
      const mockDataPoint = {
        id: 'test-id',
        pk: 'test-pk',
        sk: 'test-sk',
        name: 'Test DataPoint',
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockDataPoint);

      const input = {
        pk: 'test-pk',
        sk: 'test-sk',
        name: 'Test DataPoint',
      };

      const result = await DataPointService.createDataPoint(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(DataPoint));
      expect(result).toEqual(mockDataPoint);
    });
  });

  describe('getDataPoints', () => {
    it('should return all data points', async () => {
      const mockDataPoints = [
        { id: '1', name: 'DataPoint 1' },
        { id: '2', name: 'DataPoint 2' },
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockDataPoints);

      const result = await DataPointService.getDataPoints();

      expect(DataStore.query).toHaveBeenCalledWith(DataPoint);
      expect(result).toEqual(mockDataPoints);
    });
  });

  describe('createDataPointInstance', () => {
    it('should create a data point instance successfully', async () => {
      const mockInstance = {
        id: 'test-id',
        pk: 'test-pk',
        sk: 'test-sk',
        dataPointId: 'data-point-id',
        value: 'test-value',
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockInstance);

      const input = {
        pk: 'test-pk',
        sk: 'test-sk',
        dataPointId: 'data-point-id',
        value: 'test-value',
      };

      const result = await DataPointService.createDataPointInstance(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(DataPointInstance));
      expect(result).toEqual(mockInstance);
    });
  });

  describe('getDataPointInstances', () => {
    it('should return all data point instances', async () => {
      const mockInstances = [
        { id: '1', dataPointId: 'dp-1' },
        { id: '2', dataPointId: 'dp-2' },
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockInstances);

      const result = await DataPointService.getDataPointInstances();

      expect(DataStore.query).toHaveBeenCalledWith(DataPointInstance);
      expect(result).toEqual(mockInstances);
    });
  });
});



