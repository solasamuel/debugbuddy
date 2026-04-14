import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsForm from "@/options/components/SettingsForm";

const mockOnChange = vi.fn();

describe("S5.4 — Auto-explain toggle and severity filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders auto-explain toggle", () => {
    render(
      <SettingsForm
        autoExplain={false}
        severityFilter={["error"]}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByLabelText(/auto-explain/i)).toBeInTheDocument();
  });

  it("toggles auto-explain when clicked", async () => {
    const user = userEvent.setup();

    render(
      <SettingsForm
        autoExplain={false}
        severityFilter={["error"]}
        onChange={mockOnChange}
      />,
    );

    await user.click(screen.getByLabelText(/auto-explain/i));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ autoExplain: true }),
    );
  });

  it("renders severity filter checkboxes", () => {
    render(
      <SettingsForm
        autoExplain={false}
        severityFilter={["error", "warning"]}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByLabelText("Errors")).toBeChecked();
    expect(screen.getByLabelText("Warnings")).toBeChecked();
  });

  it("toggles severity filter when checkbox is clicked", async () => {
    const user = userEvent.setup();

    render(
      <SettingsForm
        autoExplain={false}
        severityFilter={["error"]}
        onChange={mockOnChange}
      />,
    );

    await user.click(screen.getByLabelText(/warnings/i));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        severityFilter: expect.arrayContaining(["error", "warning"]),
      }),
    );
  });
});
