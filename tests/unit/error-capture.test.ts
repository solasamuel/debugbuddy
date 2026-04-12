import { describe, it, expect } from "vitest";
import {
  parseExceptionThrown,
  parseLogEntry,
} from "@/background/error-capture";
import type { CapturedError } from "@/types/error";

describe("S2.2 — Error capture via Runtime.exceptionThrown and Log.entryAdded", () => {
  it("parses Runtime.exceptionThrown into a CapturedError", () => {
    const params = {
      exceptionDetails: {
        text: "Uncaught TypeError",
        exception: {
          description:
            "TypeError: Cannot read properties of undefined (reading 'foo')",
        },
        url: "https://example.com/app.js",
        lineNumber: 10,
        columnNumber: 5,
        stackTrace: {
          callFrames: [
            {
              functionName: "doStuff",
              url: "https://example.com/app.js",
              lineNumber: 10,
              columnNumber: 5,
              scriptId: "1",
            },
            {
              functionName: "main",
              url: "https://example.com/app.js",
              lineNumber: 3,
              columnNumber: 0,
              scriptId: "1",
            },
          ],
        },
      },
    };

    const result = parseExceptionThrown(params);

    expect(result).toBeDefined();
    expect(result!.message).toBe(
      "TypeError: Cannot read properties of undefined (reading 'foo')",
    );
    expect(result!.severity).toBe("error");
    expect(result!.sourceURL).toBe("https://example.com/app.js");
    expect(result!.line).toBe(10);
    expect(result!.column).toBe(5);
    expect(result!.stack).toContain("doStuff");
    expect(result!.stack).toContain("main");
    expect(result!.hash).toBeTruthy();
    expect(result!.count).toBe(1);
  });

  it("parses Log.entryAdded (error level) into a CapturedError", () => {
    const params = {
      entry: {
        level: "error",
        text: "Something went wrong",
        url: "https://example.com/index.js",
        lineNumber: 42,
        stackTrace: {
          callFrames: [
            {
              functionName: "handleClick",
              url: "https://example.com/index.js",
              lineNumber: 42,
              columnNumber: 12,
              scriptId: "2",
            },
          ],
        },
      },
    };

    const result = parseLogEntry(params);

    expect(result).toBeDefined();
    expect(result!.message).toBe("Something went wrong");
    expect(result!.severity).toBe("error");
    expect(result!.sourceURL).toBe("https://example.com/index.js");
    expect(result!.line).toBe(42);
    expect(result!.stack).toContain("handleClick");
  });

  it("parses Log.entryAdded (warning level) with correct severity", () => {
    const params = {
      entry: {
        level: "warning",
        text: "Deprecation notice",
        url: "https://example.com/lib.js",
        lineNumber: 7,
      },
    };

    const result = parseLogEntry(params);

    expect(result).toBeDefined();
    expect(result!.severity).toBe("warning");
    expect(result!.message).toBe("Deprecation notice");
  });

  it("returns null for Log.entryAdded with info level (filtered out)", () => {
    const params = {
      entry: {
        level: "info",
        text: "Page loaded",
        url: "https://example.com/",
        lineNumber: 1,
      },
    };

    const result = parseLogEntry(params);

    expect(result).toBeNull();
  });

  it("handles missing stack trace gracefully", () => {
    const params = {
      exceptionDetails: {
        text: "Script error.",
        exception: { description: "Script error." },
        url: "",
        lineNumber: 0,
        columnNumber: 0,
      },
    };

    const result = parseExceptionThrown(params);

    expect(result).toBeDefined();
    expect(result!.message).toBe("Script error.");
    expect(result!.stack).toBeUndefined();
  });
});
