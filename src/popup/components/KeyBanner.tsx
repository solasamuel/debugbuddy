export default function KeyBanner() {
  const optionsUrl = chrome.runtime.getURL("src/options/index.html");

  return (
    <div className="key-banner">
      <span>API key required</span>
      <a href={optionsUrl} target="_blank" rel="noopener noreferrer">
        Configure
      </a>
    </div>
  );
}
