import { describe, it, expect, beforeEach } from "vitest";
import type { Explanation } from "@/types/error";

async function loadCache() {
  return await import("@/api/cache");
}

const mockExplanation: Explanation = {
  summary: "Test error summary",
  likelyCause: "Test cause",
  suggestedFix: "Test fix",
  relevantLinks: ["https://example.com"],
};

describe("S3.3 — Response caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined for a cache miss", async () => {
    const { getFromCache } = await loadCache();

    const result = getFromCache("nonexistent-hash");
    expect(result).toBeUndefined();
  });

  it("stores and retrieves a cached explanation by hash", async () => {
    const { getFromCache, addToCache } = await loadCache();

    addToCache("hash-abc", mockExplanation);
    const result = getFromCache("hash-abc");

    expect(result).toEqual(mockExplanation);
  });

  it("returns undefined after TTL has expired", async () => {
    const { getFromCache, addToCache, DEFAULT_TTL_MS } = await loadCache();

    addToCache("hash-expire", mockExplanation);

    // Advance time past the TTL
    vi.advanceTimersByTime(DEFAULT_TTL_MS + 1);

    const result = getFromCache("hash-expire");
    expect(result).toBeUndefined();
  });

  it("returns cached value before TTL expires", async () => {
    const { getFromCache, addToCache, DEFAULT_TTL_MS } = await loadCache();

    addToCache("hash-valid", mockExplanation);

    // Advance time but stay within TTL
    vi.advanceTimersByTime(DEFAULT_TTL_MS - 1000);

    const result = getFromCache("hash-valid");
    expect(result).toEqual(mockExplanation);
  });

  it("clears all cached entries", async () => {
    const { getFromCache, addToCache, clearCache } = await loadCache();

    addToCache("hash-1", mockExplanation);
    addToCache("hash-2", { ...mockExplanation, summary: "Other" });

    clearCache();

    expect(getFromCache("hash-1")).toBeUndefined();
    expect(getFromCache("hash-2")).toBeUndefined();
  });

  it("overwrites existing cache entry for the same hash", async () => {
    const { getFromCache, addToCache } = await loadCache();

    addToCache("hash-dup", mockExplanation);
    const updated = { ...mockExplanation, summary: "Updated summary" };
    addToCache("hash-dup", updated);

    const result = getFromCache("hash-dup");
    expect(result?.summary).toBe("Updated summary");
  });
});
