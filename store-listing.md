# Chrome Web Store Submission — DebugBuddy

This document contains everything you need to submit DebugBuddy to the Chrome Web Store. Copy/paste each section into the corresponding field in the Developer Dashboard.

---

## 1. Store Listing

### Extension name (45 chars max)
```
DebugBuddy — AI Error Explainer
```

### Short description (132 chars max)
```
Captures JavaScript errors in your browser and explains them in plain language using the Claude API. Bring your own API key.
```

### Detailed description (max 16,000 chars)
```
DebugBuddy turns cryptic JavaScript errors into plain-language explanations — right in your browser, on demand.

When an error appears in the console of any page you visit, DebugBuddy captures it and shows it in a clean popup. Click the error and it sends the message and stack trace to Anthropic's Claude API, which returns a structured explanation: a one-line summary, the most likely cause, a concrete suggested fix, and links to relevant documentation.

You stay in control. DebugBuddy is BYOK (Bring Your Own Key) — you provide your own Claude API key, you pay Anthropic directly, and your data is never routed through a DebugBuddy server (because there isn't one).

WHAT IT DOES
• Captures uncaught exceptions and console.error() calls via the Chrome DevTools Protocol
• Works on sites with strict Content Security Policy (no content-script injection)
• Deduplicates repeating errors with an occurrence count
• Stores recent errors per-tab in chrome.storage.local (rolling buffer of 50)
• Shows a badge count on the extension icon
• Sends an error to the Claude API only when YOU click to explain it
• Caches AI responses for one hour to save API calls
• Lets you copy errors, stack traces, or explanations to the clipboard (markdown supported)

WHY YOU MIGHT WANT IT
• Stop pasting errors into ChatGPT one by one
• Faster than wading through Stack Overflow for common errors
• Stays in context — you don't switch tools or windows
• Great for learning, code review, and debugging unfamiliar codebases

PRIVACY
• No analytics, no telemetry, no third-party tracking
• Your API key is stored locally on your device only (never synced)
• Error messages are sent only to Anthropic, only when you click to explain
• No DebugBuddy-operated servers — the extension runs entirely in your browser

REQUIREMENTS
• A free Claude API key from https://console.anthropic.com
• Anthropic charges per API request — DebugBuddy does not mark up or proxy these requests

OPEN SOURCE
DebugBuddy is open source. You can audit the code at https://github.com/solasamuel/debugbuddy.
```

### Category
```
Developer Tools
```

### Language
```
English
```

---

## 2. Single Purpose

When asked "What is the single purpose of your extension?", use:

```
DebugBuddy captures JavaScript errors from web pages and explains them using the Claude API. The single purpose is helping developers understand and fix errors faster by providing AI-powered explanations of console errors that occur on the page.
```

---

## 3. Permission Justifications

The Chrome Web Store requires a justification for each permission. Use these:

### Permission: `debugger`
```
DebugBuddy uses the chrome.debugger API to attach the Chrome DevTools Protocol to the active tab. It listens for "Runtime.exceptionThrown" and "Log.entryAdded" events, which is the only reliable way to capture both uncaught exceptions and console.error() calls without injecting content scripts. This approach also works on sites with strict Content Security Policy where script injection would be blocked. The debugger is only used to read error events — DebugBuddy never modifies page state, sets breakpoints, or executes scripts in the page.
```

### Permission: `activeTab`
```
DebugBuddy uses activeTab to identify the currently active tab so that captured errors can be associated with the correct tab. The popup queries chrome.tabs to display errors for the tab the user is currently viewing, and the badge count is shown per-tab. activeTab grants temporary access only to the tab the user clicked into the extension, which is the minimum needed scope.
```

### Permission: `storage`
```
DebugBuddy uses chrome.storage.local to persist three things on the user's device: (1) the user's Claude API key, (2) the rolling buffer of captured errors per tab (max 50 per tab), and (3) user preferences such as the auto-explain toggle and severity filter. Storage is local-only and never synced to a Google account. Nothing is sent to remote servers.
```

### Host permission: `https://api.anthropic.com/*`
```
DebugBuddy sends error messages to the Anthropic Claude API at https://api.anthropic.com/v1/messages so the AI can return an explanation. This is the only external host the extension contacts. The user supplies their own API key (BYOK) and we send it in the standard "x-api-key" header. The request is initiated only when the user clicks an error to explain it; errors are never sent automatically.
```

### Remote code use
```
No. DebugBuddy does not load, execute, or eval any remote code. All JavaScript is bundled at build time. The extension only sends data to api.anthropic.com (the Claude API) and parses the JSON response.
```

---

## 4. Privacy

### Single purpose disclosure
Already covered in section 2 above.

### Data usage disclosure (Privacy Practices tab)

DebugBuddy handles the following data categories. Mark these in the Privacy Practices form:

| Data type | Collected? | Purpose |
|---|---|---|
| Personally identifiable information (name, email, address, etc.) | **No** | — |
| Health information | No | — |
| Financial and payment information | No | — |
| Authentication information (user-supplied API key) | **Yes** | Stored locally; sent only to Anthropic to authenticate API requests. Not collected by us. |
| Personal communications | No | — |
| Location | No | — |
| Web history | No | — |
| User activity (clicks, mouse movement, etc.) | No | — |
| Website content (JS error messages and stack traces only) | **Yes** | Sent to Anthropic only when the user clicks an error to explain it. Not collected by us. |

### Required certification statements (tick all)
- ✅ I do not sell or transfer user data to third parties, apart from the approved use cases.
- ✅ I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- ✅ I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL
After publishing PRIVACY-POLICY.md to your repository or hosting it on a public URL, paste the URL here. Suggested options:

- **GitHub raw:** `https://raw.githubusercontent.com/solasamuel/debugbuddy/main/PRIVACY-POLICY.md`
- **GitHub pages (rendered):** `https://solasamuel.github.io/debugbuddy/PRIVACY-POLICY`
- **Direct file in repo:** `https://github.com/solasamuel/debugbuddy/blob/main/PRIVACY-POLICY.md`

> The Chrome Web Store accepts any publicly accessible URL. The GitHub blob link is the simplest option.

---

## 5. Required Visual Assets

You'll need to upload these images. Generate them before submitting.

### Icon (already in repo)
- `public/icons/icon-128.png` — 128×128 PNG ✅

### Small promotional tile (required)
- **Size:** 440×280 PNG
- **Content:** DebugBuddy logo + tagline ("AI Error Explainer")
- **Background:** Dark blue (#1a1a2e) for brand consistency

### Marquee promotional tile (optional but recommended)
- **Size:** 1400×560 PNG
- **Use:** Featured in store search results

### Screenshots (1–5 required, 1280×800 or 640×400)
Suggested set:
1. **Empty state** — popup showing "No errors captured yet"
2. **Error list** — popup with a few captured errors, badges, and severity icons
3. **Error detail with explanation** — selected error with full Claude explanation visible
4. **Onboarding** — first-run welcome screen with API key input
5. **Options page** — settings panel with API key form

> Take screenshots at exactly 1280×800 for best results. Use a clean Chrome profile with no other extensions visible.

---

## 6. Distribution Settings

| Setting | Value |
|---|---|
| Visibility | Public |
| Distribution | All regions (or restrict if needed) |
| Pricing | Free |
| Mature content | No |

---

## 7. Submission Checklist

Before clicking "Submit for Review", confirm:

- [ ] Bumped `version` in `manifest.json` and `package.json` to `1.0.0`
- [ ] `npm run test` passes (all tests green)
- [ ] `npm run build` produces a clean `dist/` folder
- [ ] `npm run package` produces `debugbuddy-1.0.0.zip` under 5MB
- [ ] Loaded the `dist/` folder unpacked in Chrome and tested:
  - [ ] Onboarding accepts a valid API key
  - [ ] Error capture works on a page with JS errors (e.g. open DevTools Console and run `throw new Error('test')`)
  - [ ] Clicking an error returns a Claude explanation
  - [ ] Copy buttons work
  - [ ] Options page shows masked key, reveal toggle works, remove key works
- [ ] Privacy policy is published and accessible at a public URL
- [ ] Screenshots captured (5 at 1280×800)
- [ ] Promotional tile created (440×280)
- [ ] Read all permission justifications above

---

## 8. Build & Package

```bash
# Clean build
rm -rf dist *.zip

# Build production bundle
npm run build

# Package as .zip for upload
npm run package
```

The resulting `debugbuddy-1.0.0.zip` is what you upload to the Developer Dashboard.

---

## 9. Submission Steps

1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with the Google account that holds the developer license (one-time $5 fee if first publication)
3. Click **New item**
4. Upload `debugbuddy-1.0.0.zip`
5. Fill in the **Store listing** tab (use sections 1–4 above)
6. Fill in the **Privacy practices** tab (use section 4 above)
7. Add screenshots and promotional images
8. Set **Distribution** (section 6)
9. Click **Submit for review**

Review typically takes 1–3 business days. Anthropic API access does not require any special review since users supply their own keys.

---

## 10. Post-Submission

When approved, you will get an extension URL like `https://chrome.google.com/webstore/detail/debugbuddy/...`.

Update these locations with the URL:
- `README.md` — Installation section ("Coming soon" → store link)
- `homepage_url` in `manifest.json` (optional)
- Repository description on GitHub
