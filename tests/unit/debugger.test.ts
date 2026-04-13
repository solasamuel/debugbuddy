import { describe, it, expect, beforeEach } from "vitest";
import type { AttachResult } from "@/background/debugger";

// Use dynamic imports so vi.resetModules() gives us fresh module state each test
async function loadModule() {
  const mod = await import("@/background/debugger");
  return mod;
}

describe("S2.1 — chrome.debugger attach/detach lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("attaches debugger to a tab and enables Runtime + Log domains", async () => {
    vi.mocked(chrome.debugger.attach).mockResolvedValue(undefined);
    vi.mocked(chrome.debugger.sendCommand).mockResolvedValue(undefined);

    const { attachDebugger } = await loadModule();
    await attachDebugger(42);

    expect(chrome.debugger.attach).toHaveBeenCalledWith(
      { tabId: 42 },
      "1.3",
    );
    expect(chrome.debugger.sendCommand).toHaveBeenCalledWith(
      { tabId: 42 },
      "Runtime.enable",
    );
    expect(chrome.debugger.sendCommand).toHaveBeenCalledWith(
      { tabId: 42 },
      "Log.enable",
    );
  });

  it("tracks attached state after successful attach", async () => {
    vi.mocked(chrome.debugger.attach).mockResolvedValue(undefined);
    vi.mocked(chrome.debugger.sendCommand).mockResolvedValue(undefined);

    const { attachDebugger, isAttached } = await loadModule();

    expect(isAttached(42)).toBe(false);
    await attachDebugger(42);
    expect(isAttached(42)).toBe(true);
  });

  it("detaches debugger cleanly from a tab", async () => {
    vi.mocked(chrome.debugger.attach).mockResolvedValue(undefined);
    vi.mocked(chrome.debugger.sendCommand).mockResolvedValue(undefined);
    vi.mocked(chrome.debugger.detach).mockResolvedValue(undefined);

    const { attachDebugger, detachDebugger, isAttached } = await loadModule();

    await attachDebugger(42);
    await detachDebugger(42);

    expect(chrome.debugger.detach).toHaveBeenCalledWith({ tabId: 42 });
    expect(isAttached(42)).toBe(false);
  });

  it("handles attach failure gracefully (already attached)", async () => {
    vi.mocked(chrome.debugger.attach).mockRejectedValue(
      new Error("Another debugger is already attached"),
    );

    const { attachDebugger, isAttached } = await loadModule();
    const result: AttachResult = await attachDebugger(42);

    expect(result).toEqual({
      success: false,
      error: "Another debugger is already attached",
    });
    expect(isAttached(42)).toBe(false);
  });

  it("handles detach when not attached (no-op)", async () => {
    const { detachDebugger } = await loadModule();
    await detachDebugger(99);

    expect(chrome.debugger.detach).not.toHaveBeenCalled();
  });
});
