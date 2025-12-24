/**
 * Centralized debug toggles for the task-system package.
 *
 * Keep these OFF by default to avoid noisy Metro logs in host apps.
 * If you need to debug, flip to true temporarily.
 */
export const DEBUG_TRANSLATION_LOGS = false;

/**
 * Temp answer sync logs (AsyncStorage outbox + GraphQL flush).
 *
 * Keep OFF by default. Flip ON temporarily when validating temp-save payloads.
 */
export const DEBUG_TEMP_ANSWER_SYNC_LOGS = true;
