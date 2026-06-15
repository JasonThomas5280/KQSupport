import { daysBetween, todayISO } from "./dates";
import type {
  AppState,
  Entry,
  JourneyMonth,
  Metrics,
  TrendPoint,
  Urge,
} from "./types";

// Pure functions over `entries` + `quitDate`. There is no stored clean-day
// counter — a slip lowers a ratio, it never zeroes a number (build spec §0/§4.1).
// These are the tested heart of the app; render reads only derived output.

type MetricsInput = {
  profile: { quitDate: string; dailySpend: number | null };
  entries: Entry[];
  urgesRidden?: Urge[];
};

export function deriveMetrics(s: MetricsInput): Metrics {
  const start = s.profile.quitDate;
  const today = todayISO();
  const totalDaysTracked = Math.max(1, daysBetween(start, today) + 1);
  const setbackDates = new Set(
    s.entries.filter((e) => e.type === "setback").map((e) => e.date),
  );
  const setbackCount = setbackDates.size;
  const cleanDays = Math.max(0, totalDaysTracked - setbackCount);
  const cumulativePct = Math.round((cleanDays / totalDaysTracked) * 100);
  let lastSetback: string | null = null;
  s.entries
    .filter((e) => e.type === "setback")
    .forEach((e) => {
      if (!lastSetback || e.date > lastSetback) lastSetback = e.date;
    });
  const currentStreak = lastSetback
    ? daysBetween(lastSetback, today)
    : totalDaysTracked - 1;
  const moneySaved = s.profile.dailySpend
    ? Math.round(s.profile.dailySpend * cleanDays)
    : null;
  const urgesRidden = (s.urgesRidden || []).filter(
    (u) => u.outcome !== "used",
  ).length;
  return {
    totalDaysTracked,
    cleanDays,
    cumulativePct,
    currentStreak,
    setbackCount,
    daysSinceLastUse: currentStreak,
    moneySaved,
    urgesRidden,
  };
}

type JourneyInput = { profile: { quitDate: string }; entries: Entry[] };

export function deriveJourney(s: JourneyInput): JourneyMonth[] {
  const start = new Date(s.profile.quitDate);
  const today = new Date();
  const setbackDates = new Set(
    s.entries.filter((e) => e.type === "setback").map((e) => e.date),
  );
  const months: JourneyMonth[] = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= today) {
    const y = cur.getFullYear();
    const mo = cur.getMonth();
    const mStart = new Date(y, mo, 1);
    const mEnd = new Date(y, mo + 1, 0);
    const rStart = mStart < start ? start : mStart;
    const rEnd = mEnd > today ? today : mEnd;
    const total =
      Math.round((rEnd.getTime() - rStart.getTime()) / 86400000) + 1;
    let sb = 0;
    setbackDates.forEach((d) => {
      const dd = new Date(d);
      if (dd >= rStart && dd <= rEnd) sb++;
    });
    months.push({
      label: cur.toLocaleString("en", { month: "short" }),
      clean: Math.max(0, total - sb),
      total,
    });
    cur = new Date(y, mo + 1, 1);
  }
  return months;
}

type TrendInput = { profile: { quitDate: string }; entries: Entry[] };

export function deriveSymptomTrend(s: TrendInput): TrendPoint[] {
  const quit = s.profile.quitDate;
  const byDay: Record<number, number[]> = {};
  s.entries
    .filter((e) => e.type === "checkin" && e.symptoms?.length)
    .forEach((e) => {
      if (e.type !== "checkin") return;
      const day = daysBetween(quit, e.date);
      const sev =
        e.symptoms.reduce((a, x) => a + (x.severity || 0), 0) /
        e.symptoms.length;
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(sev);
    });
  return Object.entries(byDay)
    .map(([day, arr]) => ({
      day: Number(day),
      avg: arr.reduce((a, b) => a + b, 0) / arr.length,
    }))
    .sort((a, b) => a.day - b.day);
}

// Convenience overload accepting the full AppState.
export const metricsOf = (s: AppState) => deriveMetrics(s);
export const journeyOf = (s: AppState) => deriveJourney(s);
export const trendOf = (s: AppState) => deriveSymptomTrend(s);
