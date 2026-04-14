import type { CapturedError, Explanation } from "@/types/error";
import CopyButton from "./CopyButton";

interface ErrorDetailProps {
  error: CapturedError;
  explanation: Explanation | null;
  loading: boolean;
  apiError: string | null;
}

export default function ErrorDetail({
  error,
  explanation,
  loading,
  apiError,
}: ErrorDetailProps) {
  return (
    <div className="error-detail">
      <section className="detail-section">
        <h3>Error</h3>
        <pre className="detail-message">{error.message}</pre>
        <CopyButton text={error.message} label="Copy Error" />
      </section>

      {error.sourceURL && (
        <section className="detail-section">
          <h3>Source</h3>
          <p className="detail-source">
            {error.sourceURL}
            {error.line !== undefined && `:${error.line}`}
            {error.column !== undefined && `:${error.column}`}
          </p>
        </section>
      )}

      {error.stack && (
        <section className="detail-section">
          <h3>Stack Trace</h3>
          <pre className="detail-stack">{error.stack}</pre>
          <CopyButton text={error.stack} label="Copy Stack" />
        </section>
      )}

      <section className="detail-section">
        <h3>AI Explanation</h3>
        {loading && (
          <div className="loading-spinner" role="status">
            <span className="spinner" />
            <span>Analyzing error…</span>
          </div>
        )}
        {apiError && (
          <div className="api-error">
            <p>{apiError}</p>
          </div>
        )}
        {explanation && !loading && (
          <div className="explanation">
            <div className="explanation-field">
              <strong>Summary</strong>
              <p>{explanation.summary}</p>
            </div>
            <div className="explanation-field">
              <strong>Likely Cause</strong>
              <p>{explanation.likelyCause}</p>
            </div>
            <div className="explanation-field">
              <strong>Suggested Fix</strong>
              <p>{explanation.suggestedFix}</p>
            </div>
            {explanation.relevantLinks.length > 0 && (
              <div className="explanation-field">
                <strong>Relevant Links</strong>
                <ul>
                  {explanation.relevantLinks.map((link, i) => (
                    <li key={i}>
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <CopyButton
              text={`Summary: ${explanation.summary}\nCause: ${explanation.likelyCause}\nFix: ${explanation.suggestedFix}`}
              label="Copy Explanation"
            />
          </div>
        )}
      </section>
    </div>
  );
}
