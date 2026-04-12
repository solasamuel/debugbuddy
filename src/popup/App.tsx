import "./styles/popup.css";

export default function App() {
  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>DebugBuddy</h1>
      </header>
      <main className="popup-body">
        <p className="empty-state">No errors captured yet.</p>
      </main>
    </div>
  );
}
