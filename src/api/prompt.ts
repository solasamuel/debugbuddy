import type { ErrorContext } from "./claude-client";
import type { Explanation } from "@/types/error";

export function buildSystemPrompt(): string {
  return `You are DebugBuddy, a developer assistant that explains JavaScript errors.

Given an error message and optional context (stack trace, source URL, line number), respond with a JSON object containing exactly these fields:

{
  "summary": "One sentence explaining what happened",
  "likelyCause": "The most common reason this error occurs",
  "suggestedFix": "A concrete code change or debugging step",
  "relevantLinks": ["Up to 3 documentation URLs"]
}

Rules:
- Return ONLY valid JSON, no markdown fences or extra text
- Be concise and developer-friendly
- Target mid-level developers
- Use code examples in suggestedFix where helpful
- relevantLinks should be real, well-known documentation URLs (MDN, Node.js docs, etc.)
- If you cannot determine relevant links, return an empty array`;
}

export function buildUserMessage(error: ErrorContext): string {
  let message = `**Error Message:**\n${error.message}`;

  if (error.sourceURL) {
    message += `\n\n**Source:** ${error.sourceURL}`;
    if (error.line !== undefined) {
      message += `:${error.line}`;
      if (error.column !== undefined) {
        message += `:${error.column}`;
      }
    }
  }

  if (error.stack) {
    message += `\n\n**Stack Trace:**\n${error.stack}`;
  }

  return message;
}

export function parseExplanation(raw: string): Explanation {
  try {
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary || "No summary available",
      likelyCause: parsed.likelyCause || "Unknown cause",
      suggestedFix: parsed.suggestedFix || "No fix suggestion available",
      relevantLinks: Array.isArray(parsed.relevantLinks) ? parsed.relevantLinks : [],
    };
  } catch {
    return {
      summary: "Unable to parse the AI response",
      likelyCause: "The API returned a response that could not be parsed as JSON",
      suggestedFix: "Try again, or check the error details manually",
      relevantLinks: [],
    };
  }
}
