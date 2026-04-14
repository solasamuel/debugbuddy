import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorList from "@/popup/components/ErrorList";
import type { CapturedError } from "@/types/error";

const mockErrors: CapturedError[] = [
  {
    id: "1",
    message: "TypeError: Cannot read properties of undefined (reading 'foo')",
    severity: "error",
    timestamp: Date.now() - 5000,
    count: 1,
    hash: "hash-1",
    sourceURL: "https://example.com/app.js",
    line: 10,
  },
  {
    id: "2",
    message: "Deprecation warning: use newMethod() instead",
    severity: "warning",
    timestamp: Date.now() - 60000,
    count: 3,
    hash: "hash-2",
  },
];

describe("S4.1 — ErrorList component", () => {
  it("renders a list of errors in reverse-chronological order", () => {
    render(<ErrorList errors={mockErrors} onSelectError={() => {}} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain("TypeError");
  });

  it("shows severity indicator for each error", () => {
    render(<ErrorList errors={mockErrors} onSelectError={() => {}} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-severity", "error");
    expect(items[1]).toHaveAttribute("data-severity", "warning");
  });

  it("shows truncated message preview", () => {
    const longError: CapturedError = {
      id: "3",
      message: "A".repeat(200),
      severity: "error",
      timestamp: Date.now(),
      count: 1,
      hash: "hash-3",
    };
    render(<ErrorList errors={[longError]} onSelectError={() => {}} />);

    const item = screen.getByRole("listitem");
    expect(item.textContent!.length).toBeLessThan(200);
  });

  it("shows duplicate count badge when count > 1", () => {
    render(<ErrorList errors={mockErrors} onSelectError={() => {}} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows relative timestamp for each error", () => {
    render(<ErrorList errors={mockErrors} onSelectError={() => {}} />);

    const times = screen.getAllByText(/ago/i);
    expect(times.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onSelectError when an error is clicked", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<ErrorList errors={mockErrors} onSelectError={onSelect} />);

    await user.click(screen.getAllByRole("listitem")[0]);
    expect(onSelect).toHaveBeenCalledWith(mockErrors[0]);
  });
});
