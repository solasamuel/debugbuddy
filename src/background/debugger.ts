const PROTOCOL_VERSION = "1.3";
const attachedTabs = new Set<number>();

export interface AttachResult {
  success: boolean;
  error?: string;
}

export async function attachDebugger(tabId: number): Promise<AttachResult> {
  try {
    await chrome.debugger.attach({ tabId }, PROTOCOL_VERSION);
    await chrome.debugger.sendCommand({ tabId }, "Runtime.enable");
    await chrome.debugger.sendCommand({ tabId }, "Log.enable");
    attachedTabs.add(tabId);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export async function detachDebugger(tabId: number): Promise<void> {
  if (!attachedTabs.has(tabId)) return;

  await chrome.debugger.detach({ tabId });
  attachedTabs.delete(tabId);
}

export function isAttached(tabId: number): boolean {
  return attachedTabs.has(tabId);
}

export function markDetached(tabId: number): void {
  attachedTabs.delete(tabId);
}
