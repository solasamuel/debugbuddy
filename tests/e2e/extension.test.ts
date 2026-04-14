import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "../..");

describe("S6.2 — Extension structure validation for real-world use", () => {
  it("manifest.json has all required permissions for error capture", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, "manifest.json"), "utf-8"),
    );

    expect(manifest.permissions).toContain("debugger");
    expect(manifest.permissions).toContain("activeTab");
    expect(manifest.permissions).toContain("storage");
  });

  it("manifest.json does not request unnecessary permissions", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, "manifest.json"), "utf-8"),
    );

    // Should not have broad host permissions
    expect(manifest.host_permissions).toBeUndefined();
    // Should not request tabs (we use activeTab instead)
    expect(manifest.permissions).not.toContain("tabs");
  });

  it("background service worker entry point exists", () => {
    expect(existsSync(resolve(ROOT, "src/background/index.ts"))).toBe(true);
  });

  it("popup entry point exists", () => {
    expect(existsSync(resolve(ROOT, "src/popup/index.html"))).toBe(true);
    expect(existsSync(resolve(ROOT, "src/popup/index.tsx"))).toBe(true);
  });

  it("options page entry point exists", () => {
    expect(existsSync(resolve(ROOT, "src/options/index.html"))).toBe(true);
    expect(existsSync(resolve(ROOT, "src/options/index.tsx"))).toBe(true);
  });

  it("all icon sizes exist", () => {
    for (const size of [16, 48, 128]) {
      expect(
        existsSync(resolve(ROOT, `public/icons/icon-${size}.png`)),
      ).toBe(true);
    }
  });

  it("no API keys or secrets in source files", () => {
    const clientSrc = readFileSync(
      resolve(ROOT, "src/api/claude-client.ts"),
      "utf-8",
    );
    // Ensure no hardcoded keys
    expect(clientSrc).not.toMatch(/sk-ant-api\d{2}-[A-Za-z0-9]/);
    expect(clientSrc).not.toContain("ANTHROPIC_API_KEY=");
  });

  it("CSP-safe: extension uses chrome.debugger, not content script injection", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, "manifest.json"), "utf-8"),
    );

    // No content_scripts — we use chrome.debugger which bypasses page CSP
    expect(manifest.content_scripts).toBeUndefined();
  });
});
