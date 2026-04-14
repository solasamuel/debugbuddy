import { useState } from "react";

interface OnboardingProps {
  onValidateKey: (key: string) => Promise<boolean>;
  onComplete: () => void;
}

export default function Onboarding({ onValidateKey, onComplete }: OnboardingProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidating(true);

    const valid = await onValidateKey(key);
    setValidating(false);

    if (valid) {
      onComplete();
    } else {
      setError("Invalid API key. Please check and try again.");
    }
  };

  return (
    <div className="onboarding">
      <h2>Welcome to DebugBuddy</h2>
      <p>Enter your Claude API key to get started with AI-powered error explanations.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="onboarding-key">Claude API Key</label>
        <input
          id="onboarding-key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          autoComplete="off"
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={!key.trim() || validating}>
          {validating ? "Validating…" : "Save & Validate"}
        </button>
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
