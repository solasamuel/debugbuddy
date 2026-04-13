import type { Explanation } from "@/types/error";

export const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  explanation: Explanation;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function getFromCache(hash: string): Explanation | undefined {
  const entry = cache.get(hash);
  if (!entry) return undefined;

  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    cache.delete(hash);
    return undefined;
  }

  return entry.explanation;
}

export function addToCache(hash: string, explanation: Explanation): void {
  cache.set(hash, { explanation, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
}
