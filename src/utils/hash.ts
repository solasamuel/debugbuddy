/**
 * Generate a deterministic hash for an error message.
 * Uses a simple djb2 hash — sufficient for deduplication.
 */
export function hashError(message: string): string {
  let hash = 5381;
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 33) ^ message.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
