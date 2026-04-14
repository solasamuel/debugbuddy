import type { Explanation } from "@/types/error";
import { buildSystemPrompt, buildUserMessage, parseExplanation } from "./prompt";
import { getFromCache, addToCache } from "./cache";
import { hashError } from "@/utils/hash";

const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-4-20250514";

export interface ErrorContext {
  message: string;
  stack?: string;
  sourceURL?: string;
  line?: number;
  column?: number;
}

async function getApiKey(): Promise<string> {
  const result = await chrome.storage.local.get("apiKey");
  const key = result.apiKey as string | undefined;
  if (!key) {
    throw new Error(
      "API key not configured. Please set your Claude API key in the extension options.",
    );
  }
  return key;
}

export async function explainError(error: ErrorContext): Promise<Explanation> {
  // Check cache first
  const errorHash = hashError(error.message);
  const cached = getFromCache(errorHash);
  if (cached) return cached;

  const apiKey = await getApiKey();

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(),
        messages: [{ role: "user", content: buildUserMessage(error) }],
      }),
    });
  } catch (err) {
    throw new Error(
      `Network error: could not reach the Claude API. ${err instanceof Error ? err.message : ""}`.trim(),
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid API key. Please check your key in the extension options.");
    }
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const explanation = parseExplanation(text);

  // Cache the result
  addToCache(errorHash, explanation);

  return explanation;
}

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 10,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
