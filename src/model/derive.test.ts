import { describe, it, expect, vi, beforeEach } from "vitest";
import { deriveMetrics, deriveJourney, deriveSymptomTrend } from "./derive";
import * as dates from "./dates";
import type { Entry, Urge } from "./types";

// "today" is pinned so "fresh quit = 100%" is deterministic (spec §6 comment).
const TODAY = "2026-06-15";
beforeEach(() => {
  vi.spyOn(dates, "todayISO").mockReturnValue(TODAY);
});

const base = (over: {
  profile?: { quitDate: string; dailySpend: number | null };
  entries?: Partial<Entry>[];
  urgesRidden?: Partial<Urge>[];
}) => ({
  profile: over.profile ?? { quitDate: "2026-06-01", dailySpend: 20 },
  entries: (over.entries ?? []) as Entry[],
  urgesRidden: (over.urgesRidden ?? []) as Urge[],
});

describe("deriveMetrics", () => {
  it("counts a fresh quit as full clean", () => {
    const m = deriveMetrics(
      base({ profile: { quitDate: "2026-06-15", dailySpend: 20 } }),
    );
    expect(m.cleanDays).toBe(m.totalDaysTracked);
    expect(m.cumulativePct).toBe(100);
  });

  it("a slip lowers the ratio but NEVER zeroes it", () => {
    const m = deriveMetrics(
      base({ entries: [{ type: "setback", date: "2026-06-10" }] }),
    );
    expect(m.setbackCount).toBe(1);
    expect(m.cumulativePct).toBeGreaterThan(0); // the core guarantee
    expect(m.cumulativePct).toBeLessThan(100);
  });

  it("dedupes multiple slips on the same day to one clean-day loss", () => {
    const m = deriveMetrics(
      base({
        entries: [
          { type: "setback", date: "2026-06-10" },
          { type: "setback", date: "2026-06-10" },
        ],
      }),
    );
    expect(m.setbackCount).toBe(1);
  });

  it("currentStreak counts from the most recent setback", () => {
    const m = deriveMetrics(
      base({
        entries: [
          { type: "setback", date: "2026-06-05" },
          { type: "setback", date: "2026-06-12" },
        ],
      }),
    );
    expect(m.currentStreak).toBeGreaterThanOrEqual(0);
    expect(m.currentStreak).toBe(3); // 2026-06-12 → 2026-06-15
  });

  it("moneySaved is null when dailySpend missing, else spend * cleanDays", () => {
    expect(
      deriveMetrics(base({ profile: { quitDate: "2026-06-01", dailySpend: null } }))
        .moneySaved,
    ).toBeNull();
    const m = deriveMetrics(base({}));
    expect(m.moneySaved).toBe(20 * m.cleanDays);
  });

  it("urgesRidden excludes outcomes where the person used", () => {
    const m = deriveMetrics(
      base({
        urgesRidden: [
          { outcome: "rode_it" },
          { outcome: "reached_out" },
          { outcome: "used" },
        ],
      }),
    );
    expect(m.urgesRidden).toBe(2);
  });
});

describe("deriveJourney", () => {
  it("returns one bucket per calendar month since quitDate", () => {
    const j = deriveJourney(
      base({ profile: { quitDate: "2026-04-15", dailySpend: 20 } }),
    );
    expect(j.length).toBeGreaterThanOrEqual(2);
  });

  it("does not crash on a >18-month journey (chart-overflow guard)", () => {
    expect(() =>
      deriveJourney(base({ profile: { quitDate: "2024-01-01", dailySpend: 20 } })),
    ).not.toThrow();
  });
});

describe("deriveSymptomTrend", () => {
  it("needs >=2 distinct days to plot", () => {
    const t = deriveSymptomTrend(
      base({
        entries: [
          {
            type: "checkin",
            date: "2026-06-02",
            symptoms: [{ key: "anxiety", severity: 5 }],
          },
        ],
      }),
    );
    expect(t.length).toBeLessThan(2);
  });

  it("averages severity per day and sorts ascending by day", () => {
    const t = deriveSymptomTrend(
      base({
        entries: [
          {
            type: "checkin",
            date: "2026-06-08",
            symptoms: [{ key: "anxiety", severity: 2 }],
          },
          {
            type: "checkin",
            date: "2026-06-02",
            symptoms: [
              { key: "anxiety", severity: 5 },
              { key: "sleep", severity: 5 },
            ],
          },
        ],
      }),
    );
    expect(t[0].day).toBeLessThan(t[1].day); // sorted
    expect(t[0].avg).toBe(5); // day 1 mean
  });
});
