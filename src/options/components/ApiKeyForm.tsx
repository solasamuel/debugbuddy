import { useState } from "react";

export type KeyStatus = "valid" | "invalid" | "missing" | "validating";

interface ApiKeyFormProps {
  currentKey: string;
  keyStatus: KeyStatus;
  onSave: (key: string) => Promise<void>;
  onRemove: () => void;
}

export default function ApiKeyForm({
  currentKey,
  keyStatus,
  onSave,
  onRemove,
}: ApiKeyFormProps) {
  const [key, setKey] = useState(currentKey);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(key);
    setSaving(false);
  };

  const handleRemove = () => {
    if (confirm("Are you sure you want to remove your API key?")) {
      onRemove();
      setKey("");
    }
  };

  const statusLabel: Record<string, string> = {
    valid: "Valid",
    invalid: "Invalid",
    missing: "Not set",
    validating: "Checking…",
  };

  return (
    <div className="api-key-form">
      <form onSubmit={handleSave}>
        <label htmlFor="api-key">Claude API Key</label>
        <div className="key-input-row">
          <input
            id="api-key"
            type={revealed ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            autoComplete="off"
          />
          <button
            type="button"
            aria-label="Reveal key"
            className="reveal-button"
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? "Hide" : "Show"}
          </button>
        </div>

        <div className="key-status-row">
          <span
            className={`key-status key-status-${keyStatus}`}
            data-testid="key-status"
            data-status={keyStatus}
          >
            {statusLabel[keyStatus]}
          </span>
        </div>

        <div className="key-actions">
          <button type="submit" disabled={!key.trim() || saving}>
            {saving ? "Validating…" : "Save & Validate"}
          </button>
          {currentKey && (
            <button
              type="button"
              className="remove-button"
              aria-label="Remove key"
              onClick={handleRemove}
            >
              Remove Key
            </button>
          )}
        </div>
      </form>

      <a
        href="https://console.anthropic.com/settings/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="help-link"
      >
        Get a key
      </a>
    </div>
  );
}
