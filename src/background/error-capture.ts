import type { CapturedError, ErrorSeverity } from "@/types/error";
import { hashError } from "@/utils/hash";

interface CallFrame {
  functionName: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
  scriptId: string;
}

interface StackTrace {
  callFrames: CallFrame[];
}

interface ExceptionThrownParams {
  exceptionDetails: {
    text: string;
    exception?: { description?: string };
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
    stackTrace?: StackTrace;
  };
}

interface LogEntryParams {
  entry: {
    level: string;
    text: string;
    url?: string;
    lineNumber?: number;
    stackTrace?: StackTrace;
  };
}

function formatStack(stackTrace?: StackTrace): string | undefined {
  if (!stackTrace?.callFrames?.length) return undefined;

  return stackTrace.callFrames
    .map(
      (frame) =>
        `    at ${frame.functionName || "(anonymous)"} (${frame.url}:${frame.lineNumber}:${frame.columnNumber})`,
    )
    .join("\n");
}

function mapLogLevel(level: string): ErrorSeverity | null {
  switch (level) {
    case "error":
      return "error";
    case "warning":
      return "warning";
    default:
      return null;
  }
}

export function parseExceptionThrown(
  params: ExceptionThrownParams,
): CapturedError | null {
  const details = params.exceptionDetails;
  const message = details.exception?.description || details.text || "Unknown error";
  const stack = formatStack(details.stackTrace);

  return {
    id: crypto.randomUUID(),
    message,
    stack,
    sourceURL: details.url || undefined,
    line: details.lineNumber,
    column: details.columnNumber,
    severity: "error",
    timestamp: Date.now(),
    count: 1,
    hash: hashError(message),
  };
}

export function parseLogEntry(params: LogEntryParams): CapturedError | null {
  const entry = params.entry;
  const severity = mapLogLevel(entry.level);

  if (!severity) return null;

  const message = entry.text || "Unknown log entry";
  const stack = formatStack(entry.stackTrace);

  return {
    id: crypto.randomUUID(),
    message,
    stack,
    sourceURL: entry.url || undefined,
    line: entry.lineNumber,
    severity,
    timestamp: Date.now(),
    count: 1,
    hash: hashError(message),
  };
}
