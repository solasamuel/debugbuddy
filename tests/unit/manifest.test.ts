import { describe, it, expect } from "vitest";
import manifest from "../../manifest.json";

describe("manifest.json", () => {
  it("uses manifest version 3", () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it("has the correct extension name", () => {
    expect(manifest.name).toBe("DebugBuddy");
  });

  it("has a valid semver version", () => {
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("requests the debugger permission", () => {
    expect(manifest.permissions).toContain("debugger");
  });

  it("requests the activeTab permission", () => {
    expect(manifest.permissions).toContain("activeTab");
  });

  it("requests the storage permission", () => {
    expect(manifest.permissions).toContain("storage");
  });

  it("defines a background service worker", () => {
    expect(manifest.background).toBeDefined();
    expect(manifest.background.service_worker).toBeDefined();
    expect(manifest.background.type).toBe("module");
  });

  it("defines a default popup", () => {
    expect(manifest.action.default_popup).toBeDefined();
  });

  it("defines an options page", () => {
    expect(manifest.options_page).toBeDefined();
  });

  it("defines icons at required sizes", () => {
    expect(manifest.icons).toHaveProperty("16");
    expect(manifest.icons).toHaveProperty("48");
    expect(manifest.icons).toHaveProperty("128");
  });
});
