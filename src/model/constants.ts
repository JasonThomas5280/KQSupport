import { todayISO } from "./dates";
import type { AppState, Product } from "./types";

export const SYMPTOMS = [
  { key: "cravings", label: "Cravings" },
  { key: "anxiety", label: "Anxiety" },
  { key: "sleep", label: "Can't sleep" },
  { key: "energy", label: "Low energy" },
  { key: "restless", label: "Restless / RLS" },
  { key: "gi", label: "Stomach / nausea" },
  { key: "mood", label: "Low mood" },
  { key: "irritable", label: "Irritable" },
] as const;

export const PRODUCTS: Product[] = [
  "Feel Free",
  "Kratom (leaf/powder)",
  "7-OH extract / shots",
  "Other",
];

export const MOOD_MAP: Record<
  string,
  { color: string; label: string; emoji: string }
> = {
  strong: { color: "#6db4a8", label: "Strong", emoji: "💪" },
  okay: { color: "#5b8fc7", label: "Okay", emoji: "🙂" },
  rough: { color: "#d89c5a", label: "Rough", emoji: "🌧️" },
  crisis: { color: "#d4685e", label: "Slipping", emoji: "🆘" },
};

export const DEFAULT_STATE: AppState = {
  onboarded: false,
  profile: {
    name: "",
    reason: "",
    product: "Feel Free",
    method: "cold_turkey",
    quitDate: todayISO(),
    dailySpend: null,
  },
  entries: [],
  urgesRidden: [],
  taper: {
    active: false,
    startDose: null,
    currentDose: null,
    unit: "g",
    goal: 0,
    history: [],
  },
  circle: [],
  settings: { reminderTime: "20:00", quietAlertDefaultDays: 3 },
};
