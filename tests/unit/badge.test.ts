import { describe, it, expect, beforeEach } from "vitest";

async function loadBadge() {
  return await import("@/background/badge");
}

describe("S6.1 — Extension badge count", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("sets badge text to the error count for a tab", async () => {
    const { updateBadge } = await loadBadge();

    updateBadge(42, 3);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: "3",
      tabId: 42,
    });
  });

  it("sets badge background color to red", async () => {
    const { updateBadge } = await loadBadge();

    updateBadge(42, 1);

    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#e74c3c",
      tabId: 42,
    });
  });

  it("clears badge when count is 0", async () => {
    const { updateBadge } = await loadBadge();

    updateBadge(42, 0);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: "",
      tabId: 42,
    });
  });

  it("shows 99+ for counts over 99", async () => {
    const { updateBadge } = await loadBadge();

    updateBadge(42, 150);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: "99+",
      tabId: 42,
    });
  });

  it("clears badge for a specific tab", async () => {
    const { clearBadge } = await loadBadge();

    clearBadge(42);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: "",
      tabId: 42,
    });
  });
});
