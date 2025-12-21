import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import type {
  BuildSaveTempAnswersVariablesInput,
  TaskSystemGraphQLExecutor,
  TaskSystemSaveTempAnswersMapper,
  TempAnswerSyncConfig,
} from "../types/tempAnswerSync";
import { DEBUG_TEMP_ANSWER_SYNC_LOGS } from "../utils/debug";

type OutboxItem = {
  stableKey: string;
  document: string;
  variables: Record<string, unknown>;
  updatedAt: number;
};

type OutboxState = Record<string, OutboxItem>;

const DEFAULT_STORAGE_KEY = "@task-system/temp-answers-outbox";

let config: TempAnswerSyncConfig | null = null;
let flushInFlight: Promise<{ flushed: number; remaining: number }> | null =
  null;
let netInfoUnsubscribe: (() => void) | null = null;

const debugLog = (message: string, meta?: Record<string, unknown>): void => {
  if (!__DEV__) return;
  if (!DEBUG_TEMP_ANSWER_SYNC_LOGS) return;
  console.log(`[TempAnswerSyncService] ${message}`, meta ?? {});
};

const truncateForLog = (value: unknown): unknown => {
  if (typeof value === "string") {
    const max = 2000;
    return value.length > max ? `${value.slice(0, max)}…(truncated)` : value;
  }
  if (Array.isArray(value)) {
    const max = 50;
    return value.length > max
      ? [...value.slice(0, max), "…(truncated)"]
      : value;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    const max = 50;
    if (keys.length > max) {
      const next: Record<string, unknown> = {};
      for (const k of keys.slice(0, max)) next[k] = truncateForLog(obj[k]);
      next["…"] = `truncated ${keys.length - max} keys`;
      return next;
    }
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) next[k] = truncateForLog(v);
    return next;
  }
  return value;
};

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const readOutbox = async (storageKey: string): Promise<OutboxState> => {
  const raw = await AsyncStorage.getItem(storageKey);
  return safeJsonParse<OutboxState>(raw, {});
};

const writeOutbox = async (
  storageKey: string,
  next: OutboxState
): Promise<void> => {
  await AsyncStorage.setItem(storageKey, JSON.stringify(next));
};

const hasGraphQLErrors = (resp: unknown): boolean => {
  if (!resp || typeof resp !== "object") return false;
  const errors = (resp as any).errors;
  if (!errors) return false;
  if (Array.isArray(errors)) return errors.length > 0;
  return true;
};

/**
 * TempAnswerSyncService
 *
 * Package-owned offline-first outbox for LX "temp answers" (save-as-you-go).
 *
 * Host provides:
 * - GraphQL executor (Apollo/Amplify/etc.)
 * - mapper to shape variables + stableKey (`task.pk`)
 */
export class TempAnswerSyncService {
  static configure(next: TempAnswerSyncConfig): void {
    config = next;
    debugLog("configured", {
      storageKey: next.storageKey ?? DEFAULT_STORAGE_KEY,
      hasExecutor: !!next.executor,
      hasMapper: !!next.mapper,
    });
  }

  static isConfigured(): boolean {
    return !!config;
  }

  static startAutoFlush(): void {
    if (netInfoUnsubscribe) return;

    netInfoUnsubscribe = NetInfo.addEventListener(state => {
      const isOnline =
        state.isInternetReachable === true || state.isConnected === true;
      if (isOnline) {
        debugLog("netinfo online -> flush()", {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        });
        void TempAnswerSyncService.flush();
      }
    });
  }

  static stopAutoFlush(): void {
    if (netInfoUnsubscribe) {
      netInfoUnsubscribe();
      netInfoUnsubscribe = null;
    }
  }

  static async peekOutbox(): Promise<OutboxItem[]> {
    if (!config) return [];
    const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
    const outbox = await readOutbox(storageKey);
    return Object.values(outbox).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  static async clearOutbox(): Promise<void> {
    if (!config) return;
    const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
    await writeOutbox(storageKey, {});
  }

  static async enqueueTempAnswers(input: {
    stableKey: string;
    variables: Record<string, unknown>;
    document?: string;
  }): Promise<void> {
    if (!config) return;

    const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
    const document = input.document ?? config.document;

    const outbox = await readOutbox(storageKey);
    const existed = !!outbox[input.stableKey];
    outbox[input.stableKey] = {
      stableKey: input.stableKey,
      document,
      variables: input.variables,
      updatedAt: Date.now(),
    };
    await writeOutbox(storageKey, outbox);

    debugLog("persisted temp answers to outbox", {
      storageKey,
      stableKey: input.stableKey,
      replacedExisting: existed,
      outboxCount: Object.keys(outbox).length,
      outboxKeys: Object.keys(outbox),
      documentSnippet: document.slice(0, 80),
      variableKeys: Object.keys(input.variables ?? {}),
      variables: truncateForLog(input.variables ?? {}),
    });
  }

  static async enqueueFromMapper(
    input: BuildSaveTempAnswersVariablesInput
  ): Promise<void> {
    if (!config) return;
    const mapper: TaskSystemSaveTempAnswersMapper = config.mapper;
    const mapped = mapper(input);
    if (!mapped) {
      debugLog("mapper returned null (skipping temp save)", {
        taskPk: input.task.pk,
      });
      return;
    }

    debugLog("mapper produced temp-save payload", {
      stableKey: mapped.stableKey,
      documentSnippet: (mapped.document ?? config.document).slice(0, 80),
      variableKeys: Object.keys(mapped.variables ?? {}),
      variables: truncateForLog(mapped.variables ?? {}),
    });
    await TempAnswerSyncService.enqueueTempAnswers({
      stableKey: mapped.stableKey,
      variables: mapped.variables,
      document: mapped.document,
    });
  }

  /**
   * Sync temp answers immediately if online, otherwise queue for later.
   * Mimics LX app behavior: tries immediate sync, queues if offline or fails.
   *
   * This is the method to call when user clicks "Next" - it attempts immediate
   * sync and only queues if the sync fails or device is offline.
   */
  static async syncTempAnswers(
    input: BuildSaveTempAnswersVariablesInput
  ): Promise<void> {
    if (!config) return;

    const mapper: TaskSystemSaveTempAnswersMapper = config.mapper;
    const mapped = mapper(input);
    if (!mapped) {
      debugLog("mapper returned null (skipping temp save)", {
        taskPk: input.task.pk,
      });
      return;
    }

    const document = mapped.document ?? config.document;
    const executor: TaskSystemGraphQLExecutor = config.executor;

    // Check network status
    const netInfo = await NetInfo.fetch();
    const isOnline =
      netInfo.isInternetReachable === true || netInfo.isConnected === true;

    if (isOnline) {
      // Try immediate sync
      try {
        debugLog("attempting immediate temp-save sync", {
          stableKey: mapped.stableKey,
          documentSnippet: document.slice(0, 80),
          variableKeys: Object.keys(mapped.variables ?? {}),
        });

        const resp = await executor.execute({
          document,
          variables: mapped.variables,
        });

        if (hasGraphQLErrors(resp)) {
          debugLog("immediate sync failed with GraphQL errors (queuing)", {
            stableKey: mapped.stableKey,
            errors: resp.errors,
          });
          // Queue for retry
          await TempAnswerSyncService.enqueueTempAnswers({
            stableKey: mapped.stableKey,
            variables: mapped.variables,
            document,
          });
        } else {
          debugLog("immediate sync succeeded", {
            stableKey: mapped.stableKey,
          });
          // Success - no need to queue
          return;
        }
      } catch (error) {
        debugLog("immediate sync failed with exception (queuing)", {
          stableKey: mapped.stableKey,
          error: error instanceof Error ? error.message : String(error),
        });
        // Queue for retry
        await TempAnswerSyncService.enqueueTempAnswers({
          stableKey: mapped.stableKey,
          variables: mapped.variables,
          document,
        });
      }
    } else {
      // Offline - queue immediately
      debugLog("device offline (queuing temp answers)", {
        stableKey: mapped.stableKey,
        isConnected: netInfo.isConnected,
        isInternetReachable: netInfo.isInternetReachable,
      });
      await TempAnswerSyncService.enqueueTempAnswers({
        stableKey: mapped.stableKey,
        variables: mapped.variables,
        document,
      });
    }
  }

  static async flush(): Promise<{ flushed: number; remaining: number }> {
    if (!config) {
      return { flushed: 0, remaining: 0 };
    }

    if (flushInFlight) return flushInFlight;

    const executor: TaskSystemGraphQLExecutor = config.executor;
    const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;

    flushInFlight = (async () => {
      const outbox = await readOutbox(storageKey);
      const items = Object.values(outbox).sort(
        (a, b) => a.updatedAt - b.updatedAt
      );

      let flushed = 0;
      const nextOutbox: OutboxState = { ...outbox };

      debugLog("flush start", { storageKey, queued: items.length });

      for (const item of items) {
        try {
          debugLog("flush attempt", {
            stableKey: item.stableKey,
            updatedAt: item.updatedAt,
            documentSnippet: item.document.slice(0, 80),
            variableKeys: Object.keys(item.variables ?? {}),
          });

          const resp = await executor.execute({
            document: item.document,
            variables: item.variables,
          });

          if (hasGraphQLErrors(resp)) {
            debugLog("flush GraphQL errors (retaining item)", {
              stableKey: item.stableKey,
            });
            continue;
          }

          delete nextOutbox[item.stableKey];
          flushed++;
          await writeOutbox(storageKey, nextOutbox);
          debugLog("flush success (deleted from outbox)", {
            stableKey: item.stableKey,
            remaining: Object.keys(nextOutbox).length,
          });
        } catch {
          debugLog("flush failed (exception; retaining item)", {
            stableKey: item.stableKey,
          });
          // Keep the item for retry.
        }
      }

      const remaining = Object.keys(nextOutbox).length;
      debugLog("flush done", { flushed, remaining });
      return { flushed, remaining };
    })().finally(() => {
      flushInFlight = null;
    });

    return flushInFlight;
  }
}
