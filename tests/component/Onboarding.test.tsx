import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Onboarding from "@/popup/components/Onboarding";

const mockValidate = vi.fn();
const mockOnComplete = vi.fn();

describe("S5.1 — First-run onboarding flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows welcome message and API key input", () => {
    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    expect(screen.getByText(/welcome to debugbuddy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
  });

  it("renders a masked password input field", () => {
    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    const input = screen.getByLabelText(/api key/i);
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders a 'Get a key' link to Anthropic Console", () => {
    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    const link = screen.getByRole("link", { name: /get a key/i });
    expect(link).toHaveAttribute(
      "href",
      "https://console.anthropic.com/settings/keys",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders a 'Save & Validate' button", () => {
    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    expect(
      screen.getByRole("button", { name: /save & validate/i }),
    ).toBeInTheDocument();
  });

  it("calls onValidateKey with the entered key on submit", async () => {
    mockValidate.mockResolvedValue(true);
    const user = userEvent.setup();

    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    await user.type(screen.getByLabelText(/api key/i), "sk-ant-test-123");
    await user.click(
      screen.getByRole("button", { name: /save & validate/i }),
    );

    expect(mockValidate).toHaveBeenCalledWith("sk-ant-test-123");
  });

  it("calls onComplete after successful validation", async () => {
    mockValidate.mockResolvedValue(true);
    const user = userEvent.setup();

    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    await user.type(screen.getByLabelText(/api key/i), "sk-ant-valid");
    await user.click(
      screen.getByRole("button", { name: /save & validate/i }),
    );

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it("shows inline error when validation fails", async () => {
    mockValidate.mockResolvedValue(false);
    const user = userEvent.setup();

    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    await user.type(screen.getByLabelText(/api key/i), "sk-ant-invalid");
    await user.click(
      screen.getByRole("button", { name: /save & validate/i }),
    );

    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it("disables submit button when input is empty", () => {
    render(
      <Onboarding onValidateKey={mockValidate} onComplete={mockOnComplete} />,
    );

    const button = screen.getByRole("button", { name: /save & validate/i });
    expect(button).toBeDisabled();
  });
});
