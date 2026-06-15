import { describe, it, expect } from "vitest";
import { phaseFor, cleanMilestones, moneyMilestones } from "./phase";

describe("phaseFor", () => {
  it("names the day 3–4 peak and that it lifts", () => {
    expect(phaseFor(3).tag).toContain("peak");
    expect(phaseFor(3).msg).toContain("lifts");
    expect(phaseFor(4).tag).toContain("peak");
  });
  it("names PAWS in the day 15–42 window", () => {
    expect(phaseFor(20).msg).toContain("PAWS");
  });
  it("handles day 0 and far-out days without throwing", () => {
    expect(phaseFor(0).tag).toBe("Starting");
    expect(phaseFor(500).tag).toBe("Day 500");
  });
});

describe("milestones", () => {
  it("flags clean milestones at/after their threshold", () => {
    const ms = cleanMilestones(7);
    expect(ms.find((m) => m.d === 7)?.hit).toBe(true);
    expect(ms.find((m) => m.d === 14)?.hit).toBe(false);
  });
  it("returns no money milestones when saved is null", () => {
    expect(moneyMilestones(null)).toEqual([]);
    expect(moneyMilestones(300).find((m) => m.v === 250)?.hit).toBe(true);
  });
});
