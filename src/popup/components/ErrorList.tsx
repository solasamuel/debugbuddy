import type { CapturedError } from "@/types/error";

interface ErrorListProps {
  errors: CapturedError[];
  onSelectError: (error: CapturedError) => void;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function truncate(text: string, maxLen = 100): string {
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

export default function ErrorList({ errors, onSelectError }: ErrorListProps) {
  const sorted = [...errors].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <ul className="error-list">
      {sorted.map((error) => (
        <li
          key={error.id}
          role="listitem"
          className="error-item"
          data-severity={error.severity}
          onClick={() => onSelectError(error)}
        >
          <span className={`severity-icon severity-${error.severity}`}>
            {error.severity === "error" ? "✕" : "⚠"}
          </span>
          <div className="error-item-body">
            <span className="error-message">{truncate(error.message)}</span>
            <span className="error-time">{timeAgo(error.timestamp)}</span>
          </div>
          {error.count > 1 && <span className="error-count">{error.count}</span>}
        </li>
      ))}
    </ul>
  );
}
