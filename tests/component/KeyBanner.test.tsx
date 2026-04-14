import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KeyBanner from "@/popup/components/KeyBanner";

describe("S5.3 — Graceful degradation without API key", () => {
  it("shows 'API key required' banner", () => {
    render(<KeyBanner />);

    expect(screen.getByText(/api key required/i)).toBeInTheDocument();
  });

  it("includes a link to the options page", () => {
    render(<KeyBanner />);

    const link = screen.getByRole("link", { name: /configure/i });
    expect(link).toBeInTheDocument();
  });
});
