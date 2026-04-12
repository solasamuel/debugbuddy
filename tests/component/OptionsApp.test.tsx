import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OptionsApp from "@/options/OptionsApp";

describe("Options App", () => {
  it("renders the settings heading", () => {
    render(<OptionsApp />);
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it("renders an API key input field", () => {
    render(<OptionsApp />);
    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
  });
});
