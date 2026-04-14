import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildUserMessage, parseExplanation } from "@/api/prompt";
import type { ErrorContext } from "@/api/claude-client";

describe("S3.2 — Prompt engineering for error explanations", () => {
  describe("buildSystemPrompt", () => {
    it("returns a non-empty system prompt string", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe("string");
    });

    it("instructs Claude to provide summary, cause, fix, and links", () => {
      const prompt = buildSystemPrompt();
      expect(prompt.toLowerCase()).toContain("summary");
      expect(prompt.toLowerCase()).toContain("cause");
      expect(prompt.toLowerCase()).toContain("fix");
      expect(prompt.toLowerCase()).toContain("link");
    });

    it("instructs Claude to return valid JSON", () => {
      const prompt = buildSystemPrompt();
      expect(prompt.toLowerCase()).toContain("json");
    });
  });

  describe("buildUserMessage", () => {
    it("includes the error message", () => {
      const error: ErrorContext = {
        message: "TypeError: Cannot read properties of undefined",
      };
      const msg = buildUserMessage(error);
      expect(msg).toContain("TypeError: Cannot read properties of undefined");
    });

    it("includes stack trace when available", () => {
      const error: ErrorContext = {
        message: "ReferenceError: x is not defined",
        stack: "    at main (app.js:10:5)\n    at init (app.js:1:0)",
      };
      const msg = buildUserMessage(error);
      expect(msg).toContain("app.js:10:5");
      expect(msg).toContain("Stack Trace");
    });

    it("includes source URL and line number when available", () => {
      const error: ErrorContext = {
        message: "SyntaxError: Unexpected token",
        sourceURL: "https://example.com/bundle.js",
        line: 42,
        column: 7,
      };
      const msg = buildUserMessage(error);
      expect(msg).toContain("https://example.com/bundle.js");
      expect(msg).toContain("42");
    });

    it("omits optional fields when not provided", () => {
      const error: ErrorContext = { message: "Error: something broke" };
      const msg = buildUserMessage(error);
      expect(msg).not.toContain("Stack Trace");
      expect(msg).not.toContain("Source");
    });
  });

  describe("parseExplanation", () => {
    it("parses a valid JSON response into an Explanation object", () => {
      const json = JSON.stringify({
        summary: "A variable was used before declaration",
        likelyCause: "The variable is referenced before initialisation",
        suggestedFix: "Move the variable declaration above its usage",
        relevantLinks: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_defined"],
      });

      const result = parseExplanation(json);

      expect(result.summary).toBe("A variable was used before declaration");
      expect(result.likelyCause).toContain("before initialisation");
      expect(result.suggestedFix).toContain("Move the variable");
      expect(result.relevantLinks).toHaveLength(1);
    });

    it("handles response with missing optional fields gracefully", () => {
      const json = JSON.stringify({
        summary: "Something went wrong",
        likelyCause: "Unknown",
        suggestedFix: "Check the code",
      });

      const result = parseExplanation(json);

      expect(result.summary).toBe("Something went wrong");
      expect(result.relevantLinks).toEqual([]);
    });

    it("returns a fallback explanation for malformed JSON", () => {
      const result = parseExplanation("this is not json {{{");

      expect(result.summary).toContain("Unable to parse");
      expect(result.likelyCause).toBeTruthy();
      expect(result.suggestedFix).toBeTruthy();
      expect(result.relevantLinks).toEqual([]);
    });
  });
});
