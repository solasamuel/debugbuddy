import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/popup/App";

// Mock chrome.tabs and storage for the App useEffect
vi.stubGlobal("chrome", {
  ...chrome,
  tabs: {
    query: vi.fn((_query: unknown, cb: (tabs: { id: number }[]) => void) =>
      cb([{ id: 1 }]),
    ),
  },
  storage: {
    ...chrome.storage,
    local: {
      ...chrome.storage.local,
      get: vi.fn((_keys: unknown, cb?: (result: Record<string, unknown>) => void) => {
        // Simulate existing API key so we skip onboarding
        if (cb) cb({ apiKey: "sk-ant-test" });
        return Promise.resolve({ apiKey: "sk-ant-test" });
      }),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
});

describe("Popup App", () => {
  it("renders the DebugBuddy heading", () => {
    render(<App />);
    expect(screen.getByText("DebugBuddy")).toBeInTheDocument();
  });

  it("shows an empty state message when no errors exist and key is set", () => {
    render(<App />);
    expect(screen.getByText(/no errors captured/i)).toBeInTheDocument();
  });
});
