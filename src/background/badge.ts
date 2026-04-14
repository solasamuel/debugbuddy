const BADGE_COLOR = "#e74c3c";
const MAX_DISPLAY = 99;

export function updateBadge(tabId: number, count: number): void {
  const text = count === 0 ? "" : count > MAX_DISPLAY ? "99+" : String(count);

  chrome.action.setBadgeText({ text, tabId });

  if (count > 0) {
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR, tabId });
  }
}

export function clearBadge(tabId: number): void {
  chrome.action.setBadgeText({ text: "", tabId });
}
