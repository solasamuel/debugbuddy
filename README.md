# DebugBuddy

> AI-powered error message explainer for developers — Chrome Extension

DebugBuddy captures JavaScript errors from any webpage you visit and uses the [Claude API](https://www.anthropic.com/api) to explain them in plain language — with likely cause, suggested fix, and links to relevant documentation.

It runs entirely in your browser. No backend, no telemetry, no tracking. You bring your own Claude API key (BYOK), so you control your usage and billing.

---

## Features

- **Automatic error capture** via Chrome DevTools Protocol (`chrome.debugger`)
  - Catches uncaught exceptions and `console.error()` calls
  - Works on sites with strict Content Security Policy (no content-script injection)
- **AI-powered explanations** with structured output:
  - Summary, likely cause, suggested fix, and documentation links
- **Smart deduplication** — repeated errors are grouped with an occurrence count
- **Local-only storage** — errors and your API key never leave your device unless you click to explain
- **Response caching** — repeated errors return cached explanations to save API calls
- **Copy-to-clipboard** — copy errors, stack traces, or explanations (markdown supported)
- **BYOK** (Bring Your Own Key) — no DebugBuddy servers, no shared API key

---

## Installation

### From source (development)

```bash
git clone https://github.com/solasamuel/debugbuddy.git
cd debugbuddy
npm install
npm run build
```

Then load the unpacked extension in Chrome:

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select the `dist/` folder
4. Click the DebugBuddy icon and enter your Claude API key

### From the Chrome Web Store

*Coming soon — pending review.*

---

## Setup

1. [Get a Claude API key](https://console.anthropic.com/settings/keys) from the Anthropic Console.
2. Click the DebugBuddy icon in your browser toolbar.
3. Paste your key on the welcome screen and click **Save & Validate**.
4. Browse the web normally — errors are captured automatically.
5. Click any error to see an AI-powered explanation.

> **Note:** You will be billed by Anthropic per API request you make. Each error explanation is roughly one API call (cached for an hour). DebugBuddy never marks up or proxies these requests.

---

## How it works

```
Page throws JS error
    │
    ▼
chrome.debugger captures Runtime.exceptionThrown / Log.entryAdded
    │
    ▼
Background service worker parses, deduplicates, stores in chrome.storage.local
    │
    ▼
Badge updates with error count → popup shows error list
    │
    ▼
User clicks error → background SW sends to Claude API
    │
    ▼
Claude returns structured JSON → popup renders explanation
```

See [docs/SOLUTION-ARCHITECTURE.md](docs/SOLUTION-ARCHITECTURE.md) for the full architecture and data flow.

---

## Permissions

DebugBuddy requests only the permissions it needs. See [PRIVACY-POLICY.md](PRIVACY-POLICY.md) for the rationale behind each one.

| Permission | Why |
|---|---|
| `debugger` | Attach the Chrome DevTools Protocol to capture JavaScript errors |
| `activeTab` | Identify the current tab for per-tab error storage and badges |
| `storage` | Save your API key, errors, and preferences locally |
| `host_permissions: https://api.anthropic.com/*` | Send errors to Claude for explanation |

No host permissions for any other domain. No content scripts. No remote code.

---

## Privacy

Read the full [Privacy Policy](PRIVACY-POLICY.md). Highlights:

- **No data collection.** No analytics, no telemetry, no tracking.
- **No servers.** The extension runs entirely in your browser.
- **Your API key stays local.** Stored in `chrome.storage.local`, never synced.
- **Errors are sent to Anthropic only when you click to explain them** — never automatically.

---

## Development

```bash
npm install
npm run dev          # Watch build with hot reload
npm run test         # Run all tests (116 currently)
npm run test:watch   # Run tests in watch mode
npm run lint         # ESLint check
npm run format       # Prettier format
npm run build        # Production build
npm run package      # Build and create a .zip for Chrome Web Store
```

### Project structure

```
debugbuddy/
├── manifest.json              # Chrome extension manifest (MV3)
├── src/
│   ├── background/            # Service worker, debugger, error capture, badge
│   ├── popup/                 # Popup UI (React)
│   ├── options/               # Options page (React)
│   ├── api/                   # Claude API client, prompt, cache
│   ├── types/                 # Shared TypeScript types
│   └── utils/                 # hash, storage, clipboard helpers
├── tests/
│   ├── unit/                  # Vitest unit tests
│   ├── component/             # React Testing Library component tests
│   └── e2e/                   # Extension structure validation tests
├── docs/
│   ├── SOLUTION-ARCHITECTURE.md
│   ├── product-backlog.json
│   └── test-plan.json
├── public/icons/              # Extension icons (16/48/128px)
├── PRIVACY-POLICY.md
└── store-listing.md           # Chrome Web Store submission copy
```

### Stack

- TypeScript 5, React 19, Vite 6
- Chrome Extension Manifest V3 (via [@crxjs/vite-plugin](https://crxjs.dev))
- Chrome DevTools Protocol (`chrome.debugger`)
- Anthropic Claude API
- Vitest + React Testing Library

### Testing

```bash
npm run test
```

Currently 116 tests across 20 files: unit, component, build validation, and E2E structure tests. See [docs/test-plan.json](docs/test-plan.json) for the full test plan.

---

## Versions

| Tag | Epic |
|---|---|
| `v0.1.0` | Project setup, manifest v3, build tooling |
| `v0.2.0` | Error capture via Chrome DevTools Protocol |
| `v0.3.0` | Claude API integration |
| `v0.4.0` | Popup UI — error list, detail, explanations |
| `v0.5.0` | API key management (BYOK) and settings |
| `v0.6.0` | Polish, badge, branded icons, E2E tests |
| `v1.0.0` | Chrome Web Store submission *(in progress)* |

---

## Contributing

Issues and PRs welcome at https://github.com/solasamuel/debugbuddy.

---

## License

MIT — Sola Samuel / Spearhead Finance Ltd
