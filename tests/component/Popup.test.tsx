import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/popup/App";

describe("Popup App", () => {
  it("renders the DebugBuddy heading", () => {
    render(<App />);
    expect(screen.getByText("DebugBuddy")).toBeInTheDocument();
  });

  it("shows an empty state message when no errors exist", () => {
    render(<App />);
    expect(screen.getByText(/no errors captured/i)).toBeInTheDocument();
  });
});
