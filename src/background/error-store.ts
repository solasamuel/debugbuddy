import type { CapturedError } from "@/types/error";

export const MAX_ERRORS_PER_TAB = 50;

function storageKey(tabId: number): string {
  return `errors_tab_${tabId}`;
}

export async function getErrors(tabId: number): Promise<CapturedError[]> {
  const key = storageKey(tabId);
  const result = await chrome.storage.local.get(key);
  return (result[key] as CapturedError[]) || [];
}

export async function addError(tabId: number, error: CapturedError): Promise<void> {
  const errors = await getErrors(tabId);

  const existing = errors.find((e) => e.hash === error.hash);
  if (existing) {
    existing.count += 1;
    existing.timestamp = error.timestamp;
  } else {
    errors.push(error);
  }

  // Evict oldest if over the limit
  if (errors.length > MAX_ERRORS_PER_TAB) {
    errors.sort((a, b) => a.timestamp - b.timestamp);
    errors.splice(0, errors.length - MAX_ERRORS_PER_TAB);
  }

  await chrome.storage.local.set({ [storageKey(tabId)]: errors });
}

export async function clearErrors(tabId: number): Promise<void> {
  await chrome.storage.local.remove(storageKey(tabId));
}
