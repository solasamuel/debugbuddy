export type ErrorSeverity = "error" | "warning" | "info";

export interface CapturedError {
  id: string;
  message: string;
  stack?: string;
  sourceURL?: string;
  line?: number;
  column?: number;
  severity: ErrorSeverity;
  timestamp: number;
  count: number;
  hash: string;
}

export interface Explanation {
  summary: string;
  likelyCause: string;
  suggestedFix: string;
  relevantLinks: string[];
}
