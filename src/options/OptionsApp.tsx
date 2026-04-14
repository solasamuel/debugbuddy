import { useState, useEffect } from "react";
import ApiKeyForm from "./components/ApiKeyForm";
import type { KeyStatus } from "./components/ApiKeyForm";
import SettingsForm from "./components/SettingsForm";

export default function OptionsApp() {
  const [apiKey, setApiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<KeyStatus>("missing");
  const [autoExplain, setAutoExplain] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string[]>(["error"]);

  useEffect(() => {
    chrome.storage.local.get(["apiKey", "autoExplain", "severityFilter"], (result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey as string);
        setKeyStatus("valid");
      }
      if (result.autoExplain !== undefined) {
        setAutoExplain(result.autoExplain as boolean);
      }
      if (result.severityFilter) {
        setSeverityFilter(result.severityFilter as string[]);
      }
    });
  }, []);

  const handleSaveKey = async (key: string) => {
    setKeyStatus("validating");
    const response = await new Promise<{ valid: boolean }>((resolve) => {
      chrome.runtime.sendMessage({ type: "VALIDATE_KEY", key }, resolve);
    });

    if (response.valid) {
      await chrome.storage.local.set({ apiKey: key });
      setApiKey(key);
      setKeyStatus("valid");
    } else {
      setKeyStatus("invalid");
    }
  };

  const handleRemoveKey = () => {
    chrome.storage.local.remove("apiKey");
    setApiKey("");
    setKeyStatus("missing");
  };

  const handleSettingsChange = (settings: {
    autoExplain: boolean;
    severityFilter: string[];
  }) => {
    setAutoExplain(settings.autoExplain);
    setSeverityFilter(settings.severityFilter);
    chrome.storage.local.set({
      autoExplain: settings.autoExplain,
      severityFilter: settings.severityFilter,
    });
  };

  return (
    <div className="options-container">
      <h1>DebugBuddy Settings</h1>
      <ApiKeyForm
        currentKey={apiKey}
        keyStatus={keyStatus}
        onSave={handleSaveKey}
        onRemove={handleRemoveKey}
      />
      <hr />
      <SettingsForm
        autoExplain={autoExplain}
        severityFilter={severityFilter}
        onChange={handleSettingsChange}
      />
    </div>
  );
}
