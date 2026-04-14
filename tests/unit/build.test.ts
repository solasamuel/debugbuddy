import { describe, it, expect } from "vitest";
import { existsSync, statSync, readFileSync } from "fs";
import { resolve } from "path";

const DIST = resolve(__dirname, "../../dist");

describe("S6.3 — Production build validation", () => {
  it("dist directory exists", () => {
    expect(existsSync(DIST)).toBe(true);
  });

  it("dist/manifest.json exists and is valid MV3", () => {
    const manifestPath = resolve(DIST, "manifest.json");
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe("DebugBuddy");
  });

  it("popup HTML exists in dist", () => {
    // CRXJS outputs to src/popup/index.html within dist
    const popupPath = resolve(DIST, "src/popup/index.html");
    expect(existsSync(popupPath)).toBe(true);
  });

  it("options HTML exists in dist", () => {
    const optionsPath = resolve(DIST, "src/options/index.html");
    expect(existsSync(optionsPath)).toBe(true);
  });

  it("service worker loader exists in dist", () => {
    const swPath = resolve(DIST, "service-worker-loader.js");
    expect(existsSync(swPath)).toBe(true);
  });

  it("icons exist in dist at all sizes", () => {
    for (const size of [16, 48, 128]) {
      const iconPath = resolve(DIST, `public/icons/icon-${size}.png`);
      expect(existsSync(iconPath)).toBe(true);
    }
  });

  it("total dist size is under 5MB", () => {
    function getDirSize(dir: string): number {
      const { readdirSync } = require("fs");
      let size = 0;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          size += getDirSize(fullPath);
        } else {
          size += statSync(fullPath).size;
        }
      }
      return size;
    }

    const totalSize = getDirSize(DIST);
    const fiveMB = 5 * 1024 * 1024;
    expect(totalSize).toBeLessThan(fiveMB);
  });
});
