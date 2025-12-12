/**
 * Polyfill for structuredClone() which is not available in React Native
 * AWS SDK v3 requires this for deserialization
 * 
 * This must be imported BEFORE any AWS SDK imports
 */

if (typeof global.structuredClone === 'undefined') {
  // Robust polyfill that handles AWS SDK's use case
  // AWS SDK uses structuredClone for deserializing API responses (plain objects)
  const structuredCloneImpl = function structuredClone<T>(value: T, options?: StructuredSerializeOptions): T {
    // Handle primitives
    if (value === null || typeof value !== 'object') {
      return value;
    }

    // Handle Date objects
    if (value instanceof Date) {
      return new Date(value.getTime()) as unknown as T;
    }

    // Handle RegExp
    if (value instanceof RegExp) {
      return new RegExp(value.source, value.flags) as unknown as T;
    }

    // Handle Arrays - use the function reference directly
    if (Array.isArray(value)) {
      return value.map(item => structuredCloneImpl(item, options)) as unknown as T;
    }

    // Handle plain objects (most common case for AWS SDK responses)
    if (value.constructor === Object || value.constructor === undefined) {
      const cloned: Record<string, unknown> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          cloned[key] = structuredCloneImpl((value as Record<string, unknown>)[key], options);
        }
      }
      return cloned as T;
    }

    // For other object types, try JSON serialization (works for AWS SDK responses)
    // This is the most reliable method for AWS SDK response objects
    try {
      return JSON.parse(JSON.stringify(value)) as T;
    } catch (error) {
      // If JSON fails, return a shallow copy as last resort
      console.warn('[Polyfill] structuredClone: JSON serialization failed, using shallow copy', error);
      if (Array.isArray(value)) {
        return [...value] as unknown as T;
      }
      return { ...value } as T;
    }
  };
  
  // Assign to global
  global.structuredClone = structuredCloneImpl;
  
  console.log('[Polyfill] ✅ structuredClone polyfill installed successfully');
  
  // Verify it works with a test
  try {
    const testObj = { test: 'value', nested: { data: 123 } };
    const cloned = global.structuredClone(testObj);
    if (cloned && typeof cloned === 'object' && 'test' in cloned) {
      console.log('[Polyfill] ✅ structuredClone verification test passed');
    } else {
      console.warn('[Polyfill] ⚠️ structuredClone verification test failed');
    }
  } catch (error) {
    console.error('[Polyfill] ❌ structuredClone verification test error:', error);
  }
}

// Type definition for options (if not already defined)
interface StructuredSerializeOptions {
  transfer?: Transferable[];
}

export {};

