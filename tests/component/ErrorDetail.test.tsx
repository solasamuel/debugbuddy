import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorDetail from "@/popup/components/ErrorDetail";
import type { CapturedError, Explanation } from "@/types/error";

const mockError: CapturedError = {
  id: "1",
  message: "TypeError: Cannot read properties of undefined (reading 'foo')",
  stack: "    at doStuff (app.js:10:5)\n    at main (app.js:3:0)",
  severity: "error",
  timestamp: Date.now(),
  count: 1,
  hash: "hash-1",
  sourceURL: "https://example.com/app.js",
  line: 10,
  column: 5,
};

const mockExplanation: Explanation = {
  summary: "You tried to access a property on undefined",
  likelyCause: "The object was not initialised before use",
  suggestedFix: "Add a null check before accessing the property",
  relevantLinks: [
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors",
  ],
};

describe("S4.2 — ErrorDetail component", () => {
  it("shows the full error message", () => {
    render(
      <ErrorDetail
        error={mockError}
        explanation={mockExplanation}
        loading={false}
        apiError={null}
      />,
    );

    expect(
      screen.getByText(
        "TypeError: Cannot read properties of undefined (reading 'foo')",
      ),
    ).toBeInTheDocument();
  });

  it("shows the stack trace", () => {
    render(
      <ErrorDetail
        error={mockError}
        explanation={mockExplanation}
        loading={false}
        apiError={null}
      />,
    );

    const stack = screen.getByText(/doStuff/);
    expect(stack).toBeInTheDocument();
    expect(stack.textContent).toContain("app.js:10:5");
  });

  it("shows the AI explanation with all sections", () => {
    render(
      <ErrorDetail
        error={mockError}
        explanation={mockExplanation}
        loading={false}
        apiError={null}
      />,
    );

    expect(
      screen.getByText(/You tried to access a property on undefined/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not initialised before use/),
    ).toBeInTheDocument();
    expect(screen.getByText(/null check/)).toBeInTheDocument();
  });

  it("shows a loading spinner when loading is true", () => {
    render(
      <ErrorDetail
        error={mockError}
        explanation={null}
        loading={true}
        apiError={null}
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not show explanation while loading", () => {
    render(
      <ErrorDetail
        error={mockError}
        explanation={null}
        loading={true}
        apiError={null}
      />,
    );

    expect(screen.queryByText(/Summary/i)).not.toBeInTheDocument();
  });

  it("shows an error state when API call fails", () => {
    render(
      <ErrorDetail
        error={mockError}
        explanation={null}
        loading={false}
        apiError="Rate limit exceeded"
      />,
    );

    expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument();
  });

  it("shows source URL and line number", () => {
    render(
      <ErrorDetail
        error={mockError}
        explanation={mockExplanation}
        loading={false}
        apiError={null}
      />,
    );

    const source = screen.getByText(/example\.com\/app\.js/);
    expect(source).toBeInTheDocument();
  });
});
