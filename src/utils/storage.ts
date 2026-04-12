/**
 * Typed wrappers around chrome.storage.local.
 */
export async function getFromStorage<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
}

export async function setInStorage<T>(
  key: string,
  value: T
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeFromStorage(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}
