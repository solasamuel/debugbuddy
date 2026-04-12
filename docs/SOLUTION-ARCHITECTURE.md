# DebugBuddy — Solution Architecture

> AI-Powered Error Message Explainer for Developers
> Version 1.0 — April 2026
> Author: Sola Samuel / Spearhead Finance Ltd

---

## 1. Overview

DebugBuddy is a Chrome extension that captures JavaScript errors from the browser console using the Chrome DevTools Protocol (`chrome.debugger`) and sends them to the Claude API for plain-language explanations. Developers see a popup with captured errors and can click any error to get an AI-generated explanation with likely cause, suggested fix, and relevant documentation links.

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Extension manifest | MV3 (Manifest V3) | Required for new Chrome Web Store submissions; service worker model |
| Error capture method | `chrome.debugger` API | Direct access to DevTools Protocol; captures all errors regardless of page CSP |
| AI provider | Claude API (Anthropic) | Strong reasoning for code explanations; structured output support |
| UI framework | React + TypeScript | Fast popup development; type safety across the extension |
| Bundler | Vite | Fast builds, native TS support, good Chrome extension plugin ecosystem |
| Storage | `chrome.storage.local` | Persistent across sessions; no server required; up to 10MB |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Chrome Browser                      │
│                                                          │
│  ┌──────────┐    ┌──────────────────┐    ┌───────────┐  │
│  │  Active   │◄──►│   Background      │◄──►│  Popup    │  │
│  │  Tab      │    │   Service Worker  │    │  (React)  │  │
│  │          │    │                    │    │           │  │
│  │  (page   │    │  • chrome.debugger │    │  • Error  │  │
│  │   with   │    │  • Error capture   │    │    list   │  │
│  │   JS     │    │  • Storage mgmt    │    │  • Detail │  │
│  │   errors)│    │  • Badge updates   │    │    panel  │  │
│  └──────────┘    └────────┬───────────┘    └─────┬─────┘  │
│                           │                       │        │
│                           │ chrome.storage.local  │        │
│                           └───────┬───────────────┘        │
│                                   │                        │
│  ┌────────────────────────────────┴─────────────────────┐ │
│  │                 Options Page (React)                   │ │
│  │                 • API key config                       │ │
│  │                 • Preferences                          │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │   Claude API          │
                    │   (api.anthropic.com) │
                    │                       │
                    │   POST /v1/messages   │
                    └──────────────────────┘
```

---

## 3. Component Details

### 3.1 Background Service Worker (`src/background/`)

The central hub of the extension. Runs as a MV3 service worker.

**Responsibilities:**
- Attach/detach `chrome.debugger` to the active tab
- Listen for `Runtime.exceptionThrown` and `Log.entryAdded` events
- Parse and normalise error objects (message, stack, source URL, line/col)
- Deduplicate errors by message hash and store in `chrome.storage.local`
- Manage the rolling buffer (50 errors per tab)
- Update the extension badge count
- Relay errors to the popup via `chrome.runtime` messaging

**Key APIs:**
- `chrome.debugger.attach()` / `.detach()` / `.sendCommand()` / `.onEvent`
- `chrome.storage.local.get()` / `.set()`
- `chrome.action.setBadgeText()` / `.setBadgeBackgroundColor()`
- `chrome.runtime.onMessage` / `.sendMessage()`

### 3.2 Popup UI (`src/popup/`)

A React application rendered in the extension popup (400×500px).

**Views:**
1. **Error List** — scrollable list of captured errors with severity icon, truncated message, timestamp, and occurrence count
2. **Error Detail** — expanded view with full message, stack trace, and AI explanation (or loading/error state)
3. **Empty State** — shown when no errors are captured
4. **API Key Missing** — prompt to configure via options page

**State Management:**
- React state + `chrome.storage.local` for persistence
- Errors loaded from storage on popup open
- Real-time updates via `chrome.runtime.onMessage` listener

### 3.3 Claude API Client (`src/api/`)

Handles all communication with the Anthropic Claude API.

**Module: `claude-client.ts`**
```typescript
interface ErrorContext {
  message: string;
  stack?: string;
  sourceURL?: string;
  line?: number;
  column?: number;
}

interface Explanation {
  summary: string;
  likelyCause: string;
  suggestedFix: string;
  relevantLinks: string[];
}

async function explainError(error: ErrorContext): Promise<Explanation>
```

**System Prompt Strategy:**
```
You are DebugBuddy, a developer assistant that explains JavaScript errors.
Given an error message and optional stack trace, provide:
1. Summary — one sentence explaining what happened
2. Likely Cause — the most common reason this error occurs
3. Suggested Fix — a concrete code change or debugging step
4. Relevant Links — up to 3 documentation URLs

Be concise. Target mid-level developers. Use code examples where helpful.
```

**Caching:**
- In-memory `Map<string, { explanation: Explanation; timestamp: number }>`
- Key: SHA-256 hash of error message
- TTL: 1 hour (configurable)
- Cache is lost when service worker goes idle (MV3 limitation) — acceptable trade-off since `chrome.storage.local` cache would add latency for reads

### 3.4 API Key Management (BYOK — Bring Your Own Key)

DebugBuddy does **not** bundle or proxy an API key. Each user provides their own Claude API key, which is stored locally on their machine and used for direct calls to `api.anthropic.com`. This keeps the extension serverless, eliminates backend costs, and gives users full control over their usage and billing.

#### 3.4.1 First-Run Onboarding Flow

```
User installs extension
    │
    ▼
Opens popup → sees "Welcome to DebugBuddy" onboarding screen
    │
    ▼
Prompt: "Enter your Claude API key to get started"
    │
    ├── [Get a key] link → opens https://console.anthropic.com/settings/keys
    │
    └── User pastes key → clicks "Save & Validate"
         │
         ▼
    Background SW sends a lightweight validation request
    (POST /v1/messages with a minimal prompt)
         │
         ├── ✅ 200 OK → key saved, onboarding complete, popup shows error list
         │
         └── ❌ 401/403 → inline error: "Invalid API key. Please check and try again."
              │
              └── ❌ Network error → inline error: "Could not reach the API. Check your connection."
```

#### 3.4.2 Options Page (`src/options/`)

A standalone React page for managing the API key and extension settings. Accessible via:
- Right-click extension icon → "Options"
- Chrome → Extensions → DebugBuddy → "Extension options"
- Link from the popup settings gear icon

**API Key Section:**

| Element | Behaviour |
|---------|-----------|
| Key input field | Masked by default (`sk-ant-•••••••`); toggle to reveal. Pre-filled if key exists |
| "Save & Validate" button | Sends a test request; shows success/error inline |
| "Remove Key" button | Clears key from storage after confirmation dialog |
| Key status indicator | Green checkmark (valid), red X (invalid/missing), spinner (validating) |
| "Get a key" help link | Opens Anthropic Console API keys page in a new tab |

**Other Settings:**

| Setting | Type | Default | Storage Key |
|---------|------|---------|-------------|
| Claude API Key | string | — | `apiKey` |
| Auto-explain errors | boolean | false | `autoExplain` |
| Severity filter | string[] | ["error"] | `severityFilter` |
| Cache TTL (minutes) | number | 60 | `cacheTTL` |

#### 3.4.3 API Key Storage & Security

| Concern | Approach |
|---------|----------|
| Storage location | `chrome.storage.local` — encrypted at rest by Chrome, never synced to Google account |
| Access scope | Only the background service worker reads the key; popup and content scripts never access it directly |
| Key in transit | Sent only in the `x-api-key` header over HTTPS to `api.anthropic.com` |
| Key in code | Never hardcoded, logged, or included in error reports |
| Key rotation | User can update the key at any time via the options page; old key is overwritten immediately |
| Uninstall cleanup | `chrome.storage.local` is automatically deleted when the extension is uninstalled |

#### 3.4.4 Popup Behaviour Without a Key

When no valid API key is configured, the popup degrades gracefully:

- **Error capture still works** — errors are captured and listed normally
- **Explain button is disabled** — shows tooltip: "Configure your API key to enable explanations"
- **Banner at top of popup** — "API key required" with a button linking to the options page
- **No silent failures** — the extension never attempts an API call without a key

### 3.5 Shared Types & Utilities (`src/types/`, `src/utils/`)

- `types/error.ts` — `CapturedError`, `ErrorSeverity`, `Explanation` interfaces
- `types/messages.ts` — Chrome runtime message types (discriminated union)
- `utils/hash.ts` — Deterministic error message hashing
- `utils/storage.ts` — Typed wrappers around `chrome.storage.local`

---

## 4. Data Flow

### Error Capture → Display

```
Page throws error
    │
    ▼
chrome.debugger receives Runtime.exceptionThrown
    │
    ▼
Background SW parses error → creates CapturedError object
    │
    ├──► Deduplicate (hash check)
    ├──► Store in chrome.storage.local
    ├──► Update badge count
    └──► Send message to popup (if open)
           │
           ▼
       Popup receives message → prepends to error list
```

### Error Explanation

```
User clicks error in popup
    │
    ▼
Popup sends "explain" message to background SW
    │
    ▼
Background SW checks cache
    │
    ├── Cache HIT → return cached explanation
    │
    └── Cache MISS
         │
         ▼
    Build prompt with error context
         │
         ▼
    POST to Claude API (/v1/messages)
         │
         ▼
    Parse structured response → cache → return to popup
         │
         ▼
    Popup renders explanation in detail panel
```

---

## 5. Project Structure

```
debugbuddy/
├── manifest.json              # Chrome extension manifest (MV3)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── product-backlog.json
├── test-plan.json
├── SOLUTION-ARCHITECTURE.md
│
├── src/
│   ├── background/
│   │   ├── index.ts           # Service worker entry point
│   │   ├── debugger.ts        # chrome.debugger attach/detach/event handling
│   │   ├── error-store.ts     # Storage CRUD, deduplication, rolling buffer
│   │   └── badge.ts           # Badge count management
│   │
│   ├── popup/
│   │   ├── index.html         # Popup HTML shell
│   │   ├── index.tsx          # React entry point
│   │   ├── App.tsx            # Root component
│   │   ├── components/
│   │   │   ├── ErrorList.tsx
│   │   │   ├── ErrorItem.tsx
│   │   │   ├── ErrorDetail.tsx
│   │   │   ├── ExplanationPanel.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── styles/
│   │       └── popup.css
│   │
│   ├── options/
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── OptionsApp.tsx
│   │   └── components/
│   │       ├── ApiKeyForm.tsx     # Key input, validate, save, remove
│   │       └── KeyStatusBadge.tsx # Visual key status indicator
│   │
│   ├── api/
│   │   ├── claude-client.ts   # Claude API client + prompt construction
│   │   ├── key-manager.ts     # API key CRUD, validation, status checks
│   │   └── cache.ts           # In-memory response cache
│   │
│   ├── types/
│   │   ├── error.ts           # CapturedError, Explanation interfaces
│   │   ├── messages.ts        # Runtime message types
│   │   └── chrome.d.ts        # Chrome API type augmentations
│   │
│   └── utils/
│       ├── hash.ts            # Error message hashing
│       └── storage.ts         # Typed chrome.storage wrappers
│
├── public/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
│
└── tests/
    ├── unit/
    │   ├── error-store.test.ts
    │   ├── claude-client.test.ts
    │   ├── cache.test.ts
    │   └── hash.test.ts
    ├── component/
    │   ├── ErrorList.test.tsx
    │   ├── ErrorDetail.test.tsx
    │   └── OptionsApp.test.tsx
    └── e2e/
        └── extension.test.ts
```

---

## 6. Chrome Extension Manifest

```json
{
  "manifest_version": 3,
  "name": "DebugBuddy",
  "version": "1.0.0",
  "description": "AI-powered error message explainer for developers",
  "permissions": [
    "debugger",
    "activeTab",
    "storage"
  ],
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },
  "options_page": "options/index.html",
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

---

## 7. Security Considerations

| Risk | Mitigation |
|------|------------|
| API key exposure | BYOK model — key stored in `chrome.storage.local` (not synced); only background SW reads it; never exposed to page scripts or logged |
| Key theft via compromised page | Content scripts have no access to `chrome.storage.local`; key is only used in the isolated background service worker |
| Prompt injection via error messages | System prompt instructs Claude to treat error content as data, not instructions |
| Excessive API usage | Response caching, rate limiting in the client, optional manual-explain mode; users control their own billing |
| Data privacy | Error messages are sent to Claude API — users must consent; no telemetry, analytics, or proxy servers |
| Invalid/revoked key | Validation on save; graceful degradation (capture works, explain disabled) when key is missing or rejected |
| MV3 service worker lifecycle | Service worker may go idle; all persistent state is in `chrome.storage.local`, not in-memory |

---

## 8. Build & Deployment

| Stage | Command | Output |
|-------|---------|--------|
| Development | `npm run dev` | Watch build with hot reload |
| Production | `npm run build` | Optimised bundle in `dist/` |
| Lint | `npm run lint` | ESLint + TypeScript checks |
| Test | `npm run test` | Vitest test runner |
| Package | `npm run package` | `debugbuddy-1.0.0.zip` for Chrome Web Store |

---

## 9. Future Considerations (Out of Scope for v1.0)

- **DevTools Panel** — dedicated panel inside Chrome DevTools instead of popup
- **Multi-browser support** — Firefox (WebExtensions API) and Edge
- **Error grouping by source** — group errors by originating script/domain
- **Conversation mode** — follow-up questions about an error
- **Local LLM support** — use a local model for offline/private usage
- **Team sharing** — share error explanations with teammates via link
