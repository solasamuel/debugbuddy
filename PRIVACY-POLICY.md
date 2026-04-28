# DebugBuddy Privacy Policy

**Last updated:** 2026-04-14
**Effective date:** 2026-04-14

DebugBuddy ("we", "the extension") is a Chrome extension that captures JavaScript errors from web pages you visit and uses the Anthropic Claude API to explain them. This policy describes what data we handle and how.

## 1. Summary

- DebugBuddy does not collect, sell, or share your personal data with anyone.
- Your Claude API key is stored only on your local device.
- Error messages are sent only to the Anthropic Claude API (your own account, your own billing) when you choose to explain an error.
- There is no analytics, telemetry, advertising, or third-party tracking.
- There are no DebugBuddy-operated servers — the extension runs entirely in your browser.

## 2. Data we handle

### 2.1 Your Claude API key
- **What:** The API key you paste during onboarding or on the options page.
- **Where it's stored:** `chrome.storage.local` on your device only.
- **Where it's sent:** Only to `https://api.anthropic.com` in the `x-api-key` request header, and only when validating the key or requesting an explanation.
- **Sync:** The key is **never** synced via Chrome Sync. It stays on the device where you entered it.
- **Deletion:** Removed when you click "Remove Key" in options, or automatically when you uninstall the extension.

### 2.2 JavaScript error messages from web pages
- **What:** Error messages, stack traces, source URLs, line and column numbers captured from the active tab via the Chrome DevTools Protocol (`chrome.debugger`).
- **Where it's stored:** `chrome.storage.local` on your device, capped at 50 errors per tab.
- **Where it's sent:** Only sent to `https://api.anthropic.com` when **you click an error** to request an AI explanation. Errors that you do not click are never sent anywhere.
- **What Anthropic does with it:** Subject to Anthropic's [Privacy Policy](https://www.anthropic.com/legal/privacy) and [Usage Policies](https://www.anthropic.com/legal/usage-policy). DebugBuddy does not transmit your data to any other party.
- **Deletion:** Errors are evicted automatically (rolling buffer of 50 per tab) and cleared entirely when you uninstall the extension.

### 2.3 User preferences
- **What:** Auto-explain toggle, severity filter, cache TTL.
- **Where it's stored:** `chrome.storage.local` on your device only.
- **Where it's sent:** Nowhere. These never leave your device.

### 2.4 AI explanation cache
- **What:** Responses returned by the Claude API, keyed by a hash of the error message.
- **Where it's stored:** In-memory in the extension's background service worker. Cleared when the service worker idles (typically within a few minutes of inactivity).
- **Where it's sent:** Nowhere.

## 3. Data we do not collect

- We do not collect your name, email, IP address, or any personally identifiable information.
- We do not collect browsing history, cookies, page content, or any data from web pages other than JavaScript errors thrown on those pages.
- We do not use analytics or tracking services (no Google Analytics, no Mixpanel, no Sentry, etc.).
- We do not show ads.
- We do not have a backend server.

## 4. Permissions

DebugBuddy requests only the permissions strictly necessary for it to work:

| Permission | Why we need it |
|---|---|
| `debugger` | To attach the Chrome DevTools Protocol to a tab and capture JavaScript errors via `Runtime.exceptionThrown` and `Log.entryAdded` events. |
| `activeTab` | To identify the currently active tab so errors can be associated with the right tab and badge counts shown correctly. |
| `storage` | To save your API key and error history locally on your device using `chrome.storage.local`. |
| `host_permissions: https://api.anthropic.com/*` | To send error context to the Claude API for explanations. No other domains are accessed. |

## 5. Data security

- Your API key is stored using Chrome's built-in `chrome.storage.local`, which is sandboxed per-extension.
- All communication with the Claude API uses HTTPS (TLS).
- Your API key is never logged, sent to telemetry, or included in error reports.
- The extension's source code is open and can be audited at https://github.com/solasamuel/debugbuddy.

## 6. Children's privacy

DebugBuddy is a developer tool and is not directed at children under 13. We do not knowingly collect personal information from children.

## 7. Changes to this policy

If we change this policy, we will update the "Last updated" date at the top and publish the new version in the extension repository before submitting an update. Material changes will be called out in the extension's release notes.

## 8. Contact

For questions, concerns, or requests related to this privacy policy:

- Open an issue: https://github.com/solasamuel/debugbuddy/issues
- Author: Sola Samuel / Spearhead Finance Ltd
