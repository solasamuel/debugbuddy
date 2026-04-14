import { useState, useEffect } from "react";
import type { CapturedError, Explanation } from "@/types/error";
import ErrorList from "./components/ErrorList";
import ErrorDetail from "./components/ErrorDetail";
import EmptyState from "./components/EmptyState";
import Onboarding from "./components/Onboarding";
import KeyBanner from "./components/KeyBanner";
import "./styles/popup.css";

export default function App() {
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [selectedError, setSelectedError] = useState<CapturedError | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for API key
    chrome.storage.local.get("apiKey", (result) => {
      setHasApiKey(!!result.apiKey);
    });

    // Attach debugger and load errors for the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        // Attach debugger (no-op if already attached)
        chrome.runtime.sendMessage({ type: "ATTACH_DEBUGGER", tabId });

        // Load existing errors
        chrome.runtime.sendMessage({ type: "GET_ERRORS", tabId }, (response) => {
          if (response?.errors) setErrors(response.errors);
        });
      }
    });

    const listener = (message: { type: string; payload: CapturedError }) => {
      if (message.type === "ERROR_CAPTURED") {
        setErrors((prev) => [message.payload, ...prev]);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleValidateKey = async (key: string): Promise<boolean> => {
    const response = await new Promise<{ valid: boolean }>((resolve) => {
      chrome.runtime.sendMessage({ type: "VALIDATE_KEY", key }, resolve);
    });
    if (response.valid) {
      await chrome.storage.local.set({ apiKey: key });
    }
    return response.valid;
  };

  const handleOnboardingComplete = () => {
    setHasApiKey(true);
  };

  const handleSelectError = (error: CapturedError) => {
    if (!hasApiKey) return;
    setSelectedError(error);
    setExplanation(null);
    setApiError(null);
    setLoading(true);

    chrome.runtime.sendMessage({ type: "EXPLAIN_ERROR", error }, (response) => {
      setLoading(false);
      if (response?.explanation) {
        setExplanation(response.explanation);
      } else if (response?.error) {
        setApiError(response.error);
      }
    });
  };

  const handleBack = () => {
    setSelectedError(null);
    setExplanation(null);
    setApiError(null);
  };

  // Show onboarding on first run
  if (hasApiKey === false) {
    return (
      <div className="popup-container">
        <header className="popup-header">
          <h1>DebugBuddy</h1>
        </header>
        <main className="popup-body">
          <Onboarding
            onValidateKey={handleValidateKey}
            onComplete={handleOnboardingComplete}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>DebugBuddy</h1>
        {selectedError && (
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
        )}
      </header>
      <main className="popup-body">
        {!hasApiKey && <KeyBanner />}
        {selectedError ? (
          <ErrorDetail
            error={selectedError}
            explanation={explanation}
            loading={loading}
            apiError={apiError}
          />
        ) : errors.length > 0 ? (
          <ErrorList errors={errors} onSelectError={handleSelectError} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
