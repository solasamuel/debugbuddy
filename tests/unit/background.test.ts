import { describe, it, expect, beforeEach } from "vitest";

describe("Background Service Worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("registers all required listeners on load", async () => {
    await import("@/background/index");

    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    expect(chrome.debugger.onEvent.addListener).toHaveBeenCalled();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });
});
