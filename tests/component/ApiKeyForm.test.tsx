import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApiKeyForm from "@/options/components/ApiKeyForm";

const mockOnSave = vi.fn();
const mockOnRemove = vi.fn();

describe("S5.2 — Options page API key management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders API key input masked by default", () => {
    render(
      <ApiKeyForm
        currentKey="sk-ant-existing-key"
        keyStatus="valid"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    const input = screen.getByLabelText(/api key/i);
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles key visibility when reveal button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ApiKeyForm
        currentKey="sk-ant-existing-key"
        keyStatus="valid"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    const toggle = screen.getByRole("button", { name: /reveal/i });
    await user.click(toggle);

    expect(screen.getByLabelText(/api key/i)).toHaveAttribute("type", "text");
  });

  it("shows green status indicator when key is valid", () => {
    render(
      <ApiKeyForm
        currentKey="sk-ant-key"
        keyStatus="valid"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByTestId("key-status")).toHaveAttribute(
      "data-status",
      "valid",
    );
  });

  it("shows red status indicator when key is invalid", () => {
    render(
      <ApiKeyForm
        currentKey="sk-ant-bad"
        keyStatus="invalid"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByTestId("key-status")).toHaveAttribute(
      "data-status",
      "invalid",
    );
  });

  it("shows grey status indicator when no key is set", () => {
    render(
      <ApiKeyForm
        currentKey=""
        keyStatus="missing"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByTestId("key-status")).toHaveAttribute(
      "data-status",
      "missing",
    );
  });

  it("calls onSave with the new key value", async () => {
    mockOnSave.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <ApiKeyForm
        currentKey=""
        keyStatus="missing"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    await user.type(screen.getByLabelText(/api key/i), "sk-ant-new-key");
    await user.click(
      screen.getByRole("button", { name: /save & validate/i }),
    );

    expect(mockOnSave).toHaveBeenCalledWith("sk-ant-new-key");
  });

  it("calls onRemove when remove button is clicked and confirmed", async () => {
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <ApiKeyForm
        currentKey="sk-ant-key"
        keyStatus="valid"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: /remove/i }));

    expect(mockOnRemove).toHaveBeenCalled();
  });

  it("does not call onRemove when confirmation is cancelled", async () => {
    vi.spyOn(globalThis, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    render(
      <ApiKeyForm
        currentKey="sk-ant-key"
        keyStatus="valid"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: /remove/i }));

    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it("renders a 'Get a key' help link", () => {
    render(
      <ApiKeyForm
        currentKey=""
        keyStatus="missing"
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />,
    );

    const link = screen.getByRole("link", { name: /get a key/i });
    expect(link).toHaveAttribute(
      "href",
      "https://console.anthropic.com/settings/keys",
    );
  });
});
