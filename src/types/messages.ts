import type { CapturedError, Explanation } from "./error";

export type RuntimeMessage =
  | { type: "ERROR_CAPTURED"; payload: CapturedError }
  | { type: "EXPLAIN_ERROR"; payload: { errorHash: string } }
  | { type: "EXPLANATION_RESULT"; payload: Explanation }
  | { type: "CLEAR_ERRORS" };
