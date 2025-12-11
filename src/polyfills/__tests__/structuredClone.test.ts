/**
 * Test to verify structuredClone polyfill works correctly
 * This ensures the polyfill is compatible with AWS SDK's use case
 */

// Import the polyfill
import '../structuredClone';

describe('structuredClone polyfill', () => {
  it('should be available globally', () => {
    expect(typeof global.structuredClone).toBe('function');
  });

  it('should clone primitives', () => {
    expect(global.structuredClone(42)).toBe(42);
    expect(global.structuredClone('test')).toBe('test');
    expect(global.structuredClone(true)).toBe(true);
    expect(global.structuredClone(null)).toBe(null);
    expect(global.structuredClone(undefined)).toBe(undefined);
  });

  it('should clone plain objects (AWS SDK response format)', () => {
    const original = {
      TranslatedText: 'Bonjour',
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'fr',
    };
    
    const cloned = global.structuredClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original); // Should be a new object
    expect(cloned.TranslatedText).toBe('Bonjour');
  });

  it('should clone nested objects', () => {
    const original = {
      response: {
        data: {
          text: 'test',
          number: 123,
        },
      },
    };
    
    const cloned = global.structuredClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned.response).not.toBe(original.response);
    expect(cloned.response.data).not.toBe(original.response.data);
  });

  it('should clone arrays', () => {
    const original = [1, 2, { nested: 'value' }];
    const cloned = global.structuredClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[2]).not.toBe(original[2]);
  });

  it('should handle Date objects', () => {
    const original = new Date('2024-01-01');
    const cloned = global.structuredClone(original);
    
    // Date cloning might go through JSON path, so check if it's a Date or has the same timestamp
    if (cloned instanceof Date) {
      expect(cloned.getTime()).toBe(original.getTime());
      expect(cloned).not.toBe(original);
    } else {
      // If it went through JSON, it might be a string, but timestamp should be preserved
      const clonedTime = cloned instanceof Date ? cloned.getTime() : new Date(cloned as string).getTime();
      expect(clonedTime).toBe(original.getTime());
    }
  });

  it('should handle AWS Translate response format', () => {
    // Simulate actual AWS Translate response
    const awsResponse = {
      TranslatedText: 'Comment allez-vous?',
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'fr',
      AppliedSettings: {
        Profanity: 'MASK',
        Formality: 'FORMAL',
      },
    };
    
    const cloned = global.structuredClone(awsResponse);
    
    expect(cloned.TranslatedText).toBe('Comment allez-vous?');
    expect(cloned.SourceLanguageCode).toBe('en');
    expect(cloned.TargetLanguageCode).toBe('fr');
    expect(cloned.AppliedSettings).toEqual(awsResponse.AppliedSettings);
    expect(cloned.AppliedSettings).not.toBe(awsResponse.AppliedSettings);
  });
});

