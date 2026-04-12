// DebugBuddy — Background Service Worker
// Handles chrome.debugger lifecycle, error capture, and message relay.

export const EXTENSION_NAME = "DebugBuddy";

chrome.runtime.onInstalled.addListener(() => {
  console.log("DebugBuddy installed");
});

chrome.debugger.onEvent.addListener((_source, method, params) => {
  if (method === "Runtime.exceptionThrown" || method === "Log.entryAdded") {
    // TODO: Parse and store captured error (Epic E2)
    console.log("Error captured:", method, params);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // TODO: Handle explain requests from popup (Epic E3)
  console.log("Message received:", message);
  sendResponse({ ok: true });
});
