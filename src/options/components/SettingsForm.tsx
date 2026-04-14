interface SettingsFormProps {
  autoExplain: boolean;
  severityFilter: string[];
  onChange: (settings: { autoExplain: boolean; severityFilter: string[] }) => void;
}

export default function SettingsForm({
  autoExplain,
  severityFilter,
  onChange,
}: SettingsFormProps) {
  const handleAutoExplain = () => {
    onChange({ autoExplain: !autoExplain, severityFilter });
  };

  const handleSeverity = (level: string) => {
    const updated = severityFilter.includes(level)
      ? severityFilter.filter((s) => s !== level)
      : [...severityFilter, level];
    onChange({ autoExplain, severityFilter: updated });
  };

  return (
    <div className="settings-form">
      <h2>Preferences</h2>

      <div className="setting-row">
        <label htmlFor="auto-explain">
          <input
            id="auto-explain"
            type="checkbox"
            checked={autoExplain}
            onChange={handleAutoExplain}
          />
          Auto-explain errors
        </label>
      </div>

      <div className="setting-row">
        <p className="setting-label">Show errors by severity:</p>
        <label htmlFor="filter-error">
          <input
            id="filter-error"
            type="checkbox"
            checked={severityFilter.includes("error")}
            onChange={() => handleSeverity("error")}
          />
          Errors
        </label>
        <label htmlFor="filter-warning">
          <input
            id="filter-warning"
            type="checkbox"
            checked={severityFilter.includes("warning")}
            onChange={() => handleSeverity("warning")}
          />
          Warnings
        </label>
      </div>
    </div>
  );
}
