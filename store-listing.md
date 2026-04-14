# DebugBuddy — Chrome Web Store Listing

## Name
DebugBuddy — AI Error Explainer

## Short Description (132 chars max)
AI-powered error message explainer. Captures JavaScript errors and explains them in plain language using Claude.

## Detailed Description
DebugBuddy captures JavaScript errors from any webpage and uses AI to explain them in plain language — right in your browser.

**How it works:**
1. Install the extension and enter your Claude API key
2. Browse the web normally — errors are captured automatically
3. Click the DebugBuddy icon to see captured errors
4. Click any error for an AI-powered explanation with:
   - A clear summary of what happened
   - The most likely cause
   - A concrete suggested fix
   - Links to relevant documentation

**Key features:**
- Captures uncaught exceptions and console.error() calls via Chrome DevTools Protocol
- Works on CSP-restricted sites (no content script injection)
- Deduplicates repeated errors with occurrence counts
- Caches AI responses to save API calls
- Copy errors, stack traces, or explanations to clipboard
- Bring Your Own Key (BYOK) — you control your API usage and billing

**Privacy:**
- Your API key is stored locally and never synced
- Error messages are sent only to the Anthropic Claude API
- No telemetry, analytics, or third-party tracking

**Requirements:**
- A Claude API key from https://console.anthropic.com

## Category
Developer Tools

## Language
English
