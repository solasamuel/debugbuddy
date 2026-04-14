import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyButton from "@/popup/components/CopyButton";

// Mock the clipboard utility module
const mockCopy = vi.fn().mockResolvedValue(undefined);
vi.mock("@/utils/clipboard", () => ({
  copyToClipboard: (...args: unknown[]) => mockCopy(...args),
}));

describe("S4.3 — CopyButton component", () => {
  beforeEach(() => {
    mockCopy.mockClear();
  });

  it("renders with the provided label", () => {
    render(<CopyButton text="hello" label="Copy Error" />);
    expect(
      screen.getByRole("button", { name: /copy error/i }),
    ).toBeInTheDocument();
  });

  it("copies text to clipboard when clicked", async () => {
    const user = userEvent.setup();

    render(<CopyButton text="error text to copy" label="Copy" />);
    await user.click(screen.getByRole("button", { name: /copy/i }));

    await waitFor(() => {
      expect(mockCopy).toHaveBeenCalledWith("error text to copy");
    });
  });

  it("shows visual feedback after copying", async () => {
    const user = userEvent.setup();

    render(<CopyButton text="test" label="Copy" />);
    await user.click(screen.getByRole("button", { name: /copy/i }));

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it("copies markdown-formatted text when markdown prop is true", async () => {
    const user = userEvent.setup();

    render(
      <CopyButton
        text="TypeError: something broke"
        label="Copy as Markdown"
        markdown={true}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: /copy as markdown/i }),
    );

    await waitFor(() => {
      expect(mockCopy).toHaveBeenCalledOnce();
    });

    const copied = mockCopy.mock.calls[0][0] as string;
    expect(copied).toContain("```");
    expect(copied).toContain("TypeError: something broke");
  });
});
