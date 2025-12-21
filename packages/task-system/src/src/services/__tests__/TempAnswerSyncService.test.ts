import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { TempAnswerSyncService } from "../TempAnswerSyncService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(),
}));

describe("TempAnswerSyncService", () => {
  const storage: Record<string, string> = {};
  const storageKey = "@task-system/temp-answers-outbox-test";

  const mockExecutor = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(storage).forEach(k => delete storage[k]);

    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        return storage[key] ?? null;
      }
    );

    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      async (key: string, value: string) => {
        storage[key] = value;
      }
    );

    TempAnswerSyncService.configure({
      executor: mockExecutor as any,
      mapper: () => null,
      document: "mutation SaveTemp($input: JSON!) { saveTemp(input: $input) }",
      storageKey,
    });
  });

  it("upserts by stableKey (replaces existing payload)", async () => {
    await TempAnswerSyncService.enqueueTempAnswers({
      stableKey: "TASK-PK-1",
      variables: { a: 1 },
    });

    await TempAnswerSyncService.enqueueTempAnswers({
      stableKey: "TASK-PK-1",
      variables: { a: 2 },
    });

    const items = await TempAnswerSyncService.peekOutbox();
    expect(items).toHaveLength(1);
    expect(items[0].stableKey).toBe("TASK-PK-1");
    expect(items[0].variables).toEqual({ a: 2 });
  });

  it("flush removes items on success and retains on GraphQL errors", async () => {
    await TempAnswerSyncService.enqueueTempAnswers({
      stableKey: "TASK-PK-1",
      variables: { a: 1 },
    });
    await TempAnswerSyncService.enqueueTempAnswers({
      stableKey: "TASK-PK-2",
      variables: { b: 2 },
    });

    mockExecutor.execute
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockResolvedValueOnce({ errors: [{ message: "nope" }] });

    const result = await TempAnswerSyncService.flush();
    expect(result.flushed).toBe(1);
    expect(result.remaining).toBe(1);

    const items = await TempAnswerSyncService.peekOutbox();
    expect(items.map(i => i.stableKey)).toEqual(["TASK-PK-2"]);
  });

  it("flush retains items when executor throws", async () => {
    await TempAnswerSyncService.enqueueTempAnswers({
      stableKey: "TASK-PK-1",
      variables: { a: 1 },
    });

    mockExecutor.execute.mockRejectedValueOnce(new Error("network down"));

    const result = await TempAnswerSyncService.flush();
    expect(result.flushed).toBe(0);
    expect(result.remaining).toBe(1);
  });

  it("startAutoFlush triggers flush when connectivity becomes reachable", async () => {
    const flushSpy = jest
      .spyOn(TempAnswerSyncService, "flush")
      .mockResolvedValue({ flushed: 0, remaining: 0 });

    let listener: ((state: any) => void) | null = null;
    (NetInfo.addEventListener as jest.Mock).mockImplementation(cb => {
      listener = cb;
      return () => {};
    });

    TempAnswerSyncService.startAutoFlush();
    expect(NetInfo.addEventListener).toHaveBeenCalled();

    listener?.({ isConnected: true });
    expect(flushSpy).toHaveBeenCalled();
  });
});
