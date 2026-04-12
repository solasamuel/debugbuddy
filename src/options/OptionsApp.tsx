export default function OptionsApp() {
  return (
    <div className="options-container">
      <h1>DebugBuddy Settings</h1>
      <form>
        <label htmlFor="api-key">Claude API Key</label>
        <input
          id="api-key"
          type="password"
          placeholder="sk-ant-..."
          autoComplete="off"
        />
        <button type="submit">Save &amp; Validate</button>
      </form>
    </div>
  );
}
