# DebugBuddy

AI-powered error message explainer for developers — Chrome Extension.

Captures JavaScript errors from any webpage and uses the Claude API to explain them in plain language with likely cause, suggested fix, and documentation links.

## Setup

```bash
npm install
npm run build
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder
4. Click the DebugBuddy icon and enter your Claude API key

## Development

```bash
npm run dev       # Watch build with hot reload
npm run test      # Run test suite
npm run lint      # ESLint check
npm run format    # Prettier format
npm run build     # Production build
npm run package   # Build + zip for Chrome Web Store
```

## Stack

- TypeScript, React 19, Vite 6
- Chrome Extension Manifest V3 (CRXJS plugin)
- Chrome DevTools Protocol (`chrome.debugger`)
- Claude API (Anthropic)
- Vitest + React Testing Library

## Architecture

See [docs/SOLUTION-ARCHITECTURE.md](docs/SOLUTION-ARCHITECTURE.md) for full details.

## License

MIT — Sola Samuel / Spearhead Finance Ltd
