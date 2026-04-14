import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OptionsApp from "@/options/OptionsApp";

// Mock chrome.storage.local.get with callback style
vi.stubGlobal("chrome", {
  ...chrome,
  storage: {
    ...chrome.storage,
    local: {
      ...chrome.storage.local,
      get: vi.fn((_keys: unknown, cb?: (result: Record<string, unknown>) => void) => {
        if (cb) cb({});
        return Promise.resolve({});
      }),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
});

describe("Options App", () => {
  it("renders the settings heading", () => {
    render(<OptionsApp />);
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it("renders an API key input field", () => {
    render(<OptionsApp />);
    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
  });
});
