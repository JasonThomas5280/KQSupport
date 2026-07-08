import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SeverityTrack } from "./SeverityTrack";

describe("SeverityTrack", () => {
  it("renders a radiogroup with five labelled segments", () => {
    render(<SeverityTrack label="Cravings" value={undefined} onChange={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: "Cravings" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "Cravings severity 3 of 5" })).toBeInTheDocument();
  });

  it("tapping a segment reports that severity", () => {
    const onChange = vi.fn();
    render(<SeverityTrack label="Anxiety" value={undefined} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Anxiety severity 4 of 5" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("tapping the current severity clears it", () => {
    const onChange = vi.fn();
    render(<SeverityTrack label="Anxiety" value={4} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Anxiety severity 4 of 5" }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("marks only the selected segment aria-checked", () => {
    render(<SeverityTrack label="Low mood" value={2} onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "Low mood severity 2 of 5" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Low mood severity 5 of 5" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});
