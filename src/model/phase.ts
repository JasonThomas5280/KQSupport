// Phase guidance + milestones. Copy preserved verbatim from the prototype
// (build spec §4.3): day 3–4 names the peak/relapse point and that it lifts;
// day 15–42 names PAWS so a flat week reads as healing.

export interface Phase {
  tag: string;
  msg: string;
}

export function phaseFor(dayNum: number): Phase {
  if (dayNum <= 0)
    return {
      tag: "Starting",
      msg: "Day one is a decision you can make again every hour. You don't have to feel good to be doing this right.",
    };
  if (dayNum === 1)
    return {
      tag: "Day 1",
      msg: "Symptoms often begin now. They build before they break. Hydrate, rest, ride the waves — each one ends.",
    };
  if (dayNum === 2)
    return {
      tag: "Day 2",
      msg: "Climbing toward the peak. This is hard and it is temporary. The discomfort is your body recalibrating, not a sign you're failing.",
    };
  if (dayNum >= 3 && dayNum <= 4)
    return {
      tag: `Day ${dayNum} — the peak`,
      msg: "This is usually the hardest stretch — and the one people most often quit during, because relief is one dose away. It lifts from here. Hold on.",
    };
  if (dayNum >= 5 && dayNum <= 7)
    return {
      tag: `Day ${dayNum}`,
      msg: "The acute peak is breaking. Physical symptoms ease over the next few days. Sleep may still be rough — that's normal and it passes.",
    };
  if (dayNum >= 8 && dayNum <= 14)
    return {
      tag: `Day ${dayNum}`,
      msg: "Through the acute phase. Energy and sleep are rebuilding. Cravings come in waves now, not constant — each one you ride teaches your brain it can.",
    };
  if (dayNum >= 15 && dayNum <= 42)
    return {
      tag: `Day ${dayNum} — rebuilding`,
      msg: "You may hit flat, low-energy, low-motivation stretches (PAWS). This is not relapse and not failure — it's the long tail of healing. It keeps getting better.",
    };
  return {
    tag: `Day ${dayNum}`,
    msg: "You're well past the hardest part. The brain keeps healing for months. Notice how far this is from day one.",
  };
}

export interface CleanMilestone {
  d: number;
  label: string;
  hit: boolean;
}

export function cleanMilestones(streak: number): CleanMilestone[] {
  const defs = [
    { d: 1, label: "First day down" },
    { d: 4, label: "Through the peak" },
    { d: 7, label: "Acute phase behind you" },
    { d: 14, label: "Two weeks clear" },
    { d: 30, label: "One month" },
    { d: 60, label: "Two months" },
    { d: 90, label: "Ninety days" },
  ];
  return defs.map((x) => ({ ...x, hit: streak >= x.d }));
}

export interface MoneyMilestone {
  v: number;
  hit: boolean;
}

export function moneyMilestones(saved: number | null): MoneyMilestone[] {
  if (saved == null) return [];
  return [100, 250, 500, 1000, 2000, 5000].map((v) => ({ v, hit: saved >= v }));
}
