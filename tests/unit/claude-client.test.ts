import { describe, it, expect, beforeEach } from "vitest";
import type { ErrorContext } from "@/api/claude-client";

// Dynamic import to get fresh module per test
async function loadClient() {
  return await import("@/api/claude-client");
}

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("S3.1 — Claude API client module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Default: API key is stored
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chrome.storage.local.get as any).mockResolvedValue({
      apiKey: "sk-ant-test-key-123",
    });
  });

  it("sends a well-formed POST request to the Claude API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                summary: "Test summary",
                likelyCause: "Test cause",
                suggestedFix: "Test fix",
                relevantLinks: ["https://example.com"],
              }),
            },
          ],
        }),
    });

    const { explainError } = await loadClient();
    const error: ErrorContext = {
      message: "TypeError: Cannot read properties of undefined",
    };

    await explainError(error);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(options.method).toBe("POST");
    expect(options.headers["x-api-key"]).toBe("sk-ant-test-key-123");
    expect(options.headers["content-type"]).toBe("application/json");
    expect(options.headers["anthropic-version"]).toBeDefined();
  });

  it("retrieves API key from chrome.storage.local", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                summary: "s",
                likelyCause: "c",
                suggestedFix: "f",
                relevantLinks: [],
              }),
            },
          ],
        }),
    });

    const { explainError } = await loadClient();
    await explainError({ message: "test error" });

    expect(chrome.storage.local.get).toHaveBeenCalledWith("apiKey");
  });

  it("throws a clear error when API key is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chrome.storage.local.get as any).mockResolvedValue({ apiKey: undefined });

    const { explainError } = await loadClient();

    await expect(explainError({ message: "test" })).rejects.toThrow(
      /api key/i,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handles 401 Unauthorized with a clear message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    const { explainError } = await loadClient();

    await expect(explainError({ message: "test" })).rejects.toThrow(
      /invalid api key/i,
    );
  });

  it("handles 429 rate limit with a clear message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    });

    const { explainError } = await loadClient();

    await expect(explainError({ message: "test" })).rejects.toThrow(
      /rate limit/i,
    );
  });

  it("handles network errors gracefully", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    const { explainError } = await loadClient();

    await expect(explainError({ message: "test" })).rejects.toThrow(
      /network/i,
    );
  });
});
