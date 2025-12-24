/**
 * Test utilities for subscription callback patterns.
 *
 * These utilities help create properly-typed callback holders that work with
 * TypeScript's control flow analysis when testing async subscription patterns.
 */

/**
 * Creates a typed callback holder for subscription testing.
 * Use this instead of `let callback: any = null` pattern.
 *
 * This utility solves TypeScript's control flow analysis issue where
 * a callback assigned in a mock implementation is incorrectly narrowed
 * to `never` inside conditional blocks.
 *
 * @template TArgs - Tuple type representing the callback arguments
 * @returns An object containing:
 *   - `holder`: Object with `callback` property that stores the captured callback
 *   - `setCallback`: Function to set the callback (pass to mock implementations)
 *
 * @example
 * const { holder, setCallback } = createCallbackHolder<[ActivityModel[], boolean]>();
 * mockSubscribe.mockImplementation(cb => {
 *   setCallback(cb);
 *   return { unsubscribe: jest.fn() };
 * });
 * // Later: holder.callback?.(items, true);
 */
export function createCallbackHolder<TArgs extends unknown[]>(): {
  holder: { callback: ((...args: TArgs) => void) | null };
  setCallback: (cb: (...args: TArgs) => void) => void;
} {
  const holder: { callback: ((...args: TArgs) => void) | null } = {
    callback: null,
  };
  return {
    holder,
    setCallback: (cb: (...args: TArgs) => void) => {
      holder.callback = cb;
    },
  };
}

/**
 * Type alias for subscription callback that takes items array and synced boolean.
 * This matches the signature used by DataStore subscription callbacks.
 *
 * @template T - The model type for items in the subscription
 */
export type SubscriptionCallback<T> = (items: T[], synced: boolean) => void;

/**
 * Creates a holder specifically for DataStore subscription callbacks.
 * This is a convenience wrapper around `createCallbackHolder` with the
 * standard DataStore subscription signature `(items: T[], synced: boolean)`.
 *
 * @template T - The model type for items in the subscription
 * @returns An object containing:
 *   - `holder`: Object with `callback` property for the subscription callback
 *   - `setCallback`: Function to capture the callback from mock implementations
 *
 * @example
 * const { holder, setCallback } = createSubscriptionHolder<TaskModel>();
 * mockSubscribe.mockImplementation(cb => {
 *   setCallback(cb);
 *   return { unsubscribe: jest.fn() };
 * });
 * // Trigger the subscription callback:
 * holder.callback?.(mockTasks, true);
 */
export function createSubscriptionHolder<T>(): {
  holder: { callback: SubscriptionCallback<T> | null };
  setCallback: (cb: SubscriptionCallback<T>) => void;
} {
  return createCallbackHolder<[T[], boolean]>();
}
