import { describe, it, expect, beforeEach } from "vitest";
import {
  addError,
  getErrors,
  clearErrors,
  MAX_ERRORS_PER_TAB,
} from "@/background/error-store";
import type { CapturedError } from "@/types/error";

function makeError(overrides: Partial<CapturedError> = {}): CapturedError {
  return {
    id: crypto.randomUUID(),
    message: "TypeError: test",
    severity: "error",
    timestamp: Date.now(),
    count: 1,
    hash: "abc123",
    ...overrides,
  };
}

describe("S2.3 — Error deduplication and storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage mock state
    const storageData: Record<string, unknown> = {};
    vi.mocked(chrome.storage.local.get).mockImplementation(
      ((keys: unknown) => {
        if (typeof keys === "string") {
          return Promise.resolve({ [keys]: storageData[keys] });
        }
        const result: Record<string, unknown> = {};
        for (const key of keys as string[]) {
          result[key] = storageData[key];
        }
        return Promise.resolve(result);
      }) as typeof chrome.storage.local.get,
    );
    vi.mocked(chrome.storage.local.set).mockImplementation(
      ((items: Record<string, unknown>) => {
        Object.assign(storageData, items);
        return Promise.resolve();
      }) as typeof chrome.storage.local.set,
    );
    vi.mocked(chrome.storage.local.remove).mockImplementation(
      ((keys: unknown) => {
        const keyArr =
          typeof keys === "string" ? [keys] : (keys as string[]);
        for (const key of keyArr) {
          delete storageData[key];
        }
        return Promise.resolve();
      }) as typeof chrome.storage.local.remove,
    );
  });

  it("stores a new error for a tab", async () => {
    const error = makeError({ hash: "unique1" });

    await addError(1, error);
    const errors = await getErrors(1);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe("TypeError: test");
  });

  it("deduplicates errors by hash and increments count", async () => {
    const error1 = makeError({ hash: "dup-hash", message: "Same error" });
    const error2 = makeError({
      hash: "dup-hash",
      message: "Same error",
      id: "different-id",
    });

    await addError(1, error1);
    await addError(1, error2);
    const errors = await getErrors(1);

    expect(errors).toHaveLength(1);
    expect(errors[0].count).toBe(2);
  });

  it("stores different errors separately", async () => {
    const error1 = makeError({ hash: "hash-a", message: "Error A" });
    const error2 = makeError({ hash: "hash-b", message: "Error B" });

    await addError(1, error1);
    await addError(1, error2);
    const errors = await getErrors(1);

    expect(errors).toHaveLength(2);
  });

  it("maintains a rolling buffer of MAX_ERRORS_PER_TAB", async () => {
    for (let i = 0; i < MAX_ERRORS_PER_TAB + 10; i++) {
      await addError(1, makeError({ hash: `hash-${i}`, id: `id-${i}` }));
    }

    const errors = await getErrors(1);

    expect(errors).toHaveLength(MAX_ERRORS_PER_TAB);
  });

  it("evicts the oldest error when buffer is full", async () => {
    for (let i = 0; i < MAX_ERRORS_PER_TAB; i++) {
      await addError(
        1,
        makeError({
          hash: `hash-${i}`,
          id: `id-${i}`,
          message: `Error ${i}`,
          timestamp: 1000 + i,
        }),
      );
    }

    await addError(
      1,
      makeError({
        hash: "newest",
        id: "newest-id",
        message: "Newest error",
        timestamp: 9999,
      }),
    );

    const errors = await getErrors(1);
    const messages = errors.map((e) => e.message);

    expect(messages).not.toContain("Error 0");
    expect(messages).toContain("Newest error");
    expect(errors).toHaveLength(MAX_ERRORS_PER_TAB);
  });

  it("keeps errors separated by tab ID", async () => {
    await addError(1, makeError({ hash: "tab1-err" }));
    await addError(2, makeError({ hash: "tab2-err" }));

    const tab1Errors = await getErrors(1);
    const tab2Errors = await getErrors(2);

    expect(tab1Errors).toHaveLength(1);
    expect(tab2Errors).toHaveLength(1);
  });

  it("clears all errors for a tab", async () => {
    await addError(1, makeError({ hash: "h1" }));
    await addError(1, makeError({ hash: "h2" }));

    await clearErrors(1);
    const errors = await getErrors(1);

    expect(errors).toHaveLength(0);
  });

  it("returns empty array when no errors exist for a tab", async () => {
    const errors = await getErrors(999);
    expect(errors).toEqual([]);
  });

  it("errors persist across reads (stored in chrome.storage.local)", async () => {
    await addError(1, makeError({ hash: "persist" }));

    const firstRead = await getErrors(1);
    const secondRead = await getErrors(1);

    expect(firstRead).toEqual(secondRead);
    expect(chrome.storage.local.get).toHaveBeenCalled();
  });
});
