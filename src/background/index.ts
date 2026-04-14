// DebugBuddy — Background Service Worker
// Handles chrome.debugger lifecycle, error capture, and message relay.

import { attachDebugger, detachDebugger, markDetached } from "./debugger";
import { parseExceptionThrown, parseLogEntry } from "./error-capture";
import { addError, clearErrors, getErrors } from "./error-store";
import { explainError, validateApiKey } from "@/api/claude-client";
import { clearCache } from "@/api/cache";

export const EXTENSION_NAME = "DebugBuddy";

chrome.runtime.onInstalled.addListener(() => {
  console.log("DebugBuddy installed");
});

chrome.debugger.onEvent.addListener((source, method, params) => {
  if (!source.tabId) return;

  let captured = null;
  if (method === "Runtime.exceptionThrown") {
    captured = parseExceptionThrown(params as Parameters<typeof parseExceptionThrown>[0]);
  } else if (method === "Log.entryAdded") {
    captured = parseLogEntry(params as Parameters<typeof parseLogEntry>[0]);
  }

  if (captured) {
    addError(source.tabId, captured).then(() => {
      chrome.action.setBadgeText({ text: "!", tabId: source.tabId });
      chrome.action.setBadgeBackgroundColor({
        color: "#e74c3c",
        tabId: source.tabId,
      });
      chrome.runtime.sendMessage({
        type: "ERROR_CAPTURED",
        payload: captured,
      });
    });
  }
});

chrome.debugger.onDetach.addListener((source) => {
  if (source.tabId) {
    markDetached(source.tabId);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ATTACH_DEBUGGER" && message.tabId) {
    attachDebugger(message.tabId).then(sendResponse);
    return true;
  }
  if (message.type === "DETACH_DEBUGGER" && message.tabId) {
    detachDebugger(message.tabId).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === "GET_ERRORS" && message.tabId) {
    getErrors(message.tabId).then((errors) => sendResponse({ errors }));
    return true;
  }
  if (message.type === "CLEAR_ERRORS" && message.tabId) {
    clearErrors(message.tabId).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === "VALIDATE_KEY" && message.key) {
    validateApiKey(message.key)
      .then((valid) => sendResponse({ valid }))
      .catch(() => sendResponse({ valid: false }));
    return true;
  }
  if (message.type === "EXPLAIN_ERROR" && message.error) {
    explainError(message.error)
      .then((explanation) => sendResponse({ explanation }))
      .catch((err) =>
        sendResponse({ error: err instanceof Error ? err.message : String(err) }),
      );
    return true;
  }
  if (message.type === "CLEAR_CACHE") {
    clearCache();
    sendResponse({ ok: true });
    return;
  }
  sendResponse({ ok: true });
});
