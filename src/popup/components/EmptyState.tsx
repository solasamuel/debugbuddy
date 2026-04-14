export default function EmptyState() {
  return (
    <div className="empty-state">
      <p>No errors captured yet.</p>
      <p className="empty-hint">
        Errors will appear here when they occur on the current tab.
      </p>
    </div>
  );
}
