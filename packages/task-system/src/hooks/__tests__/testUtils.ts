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
 */
export type SubscriptionCallback<T> = (items: T[], synced: boolean) => void;

/**
 * Creates a holder specifically for DataStore subscription callbacks.
 */
export function createSubscriptionHolder<T>(): {
  holder: { callback: SubscriptionCallback<T> | null };
  setCallback: (cb: SubscriptionCallback<T>) => void;
} {
  return createCallbackHolder<[T[], boolean]>();
}
