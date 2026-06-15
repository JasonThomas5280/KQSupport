// Data model — ported from build spec §4. Dates are local "YYYY-MM-DD" strings.

export type Product =
  | "Feel Free"
  | "Kratom (leaf/powder)"
  | "7-OH extract / shots"
  | "Other";

export type Method = "cold_turkey" | "taper";

export interface Profile {
  name: string;
  reason: string;
  product: Product;
  method: Method;
  /** ISO local date — origin for clean-day math, phase guidance, trend x-axis. */
  quitDate: string;
  /** $/day → money saved. null when not provided. */
  dailySpend: number | null;
}

export interface SymptomRating {
  key: string;
  severity: number; // 1..5
}

export interface CheckinEntry {
  type: "checkin";
  date: string;
  mood: string;
  symptoms: SymptomRating[];
  note: string;
}

export interface SetbackEntry {
  type: "setback";
  date: string;
  note: string;
  learned: string;
  nextMove: string;
}

export type Entry = CheckinEntry | SetbackEntry;

export type UrgeOutcome = "rode_it" | "reached_out" | "used";

export interface Urge {
  date: string;
  ts: number;
  outcome: UrgeOutcome;
}

export type TaperUnit = "g" | "ml" | "bottles";

export interface Taper {
  active: boolean;
  startDose: number | null;
  currentDose: number | null;
  unit: TaperUnit;
  goal: number;
  history: { date: string; dose: number }[];
}

export interface CircleMember {
  id: string;
  name: string;
  role: string;
  sharedVisibility: boolean;
  quietAlertDays: number;
}

export interface Settings {
  reminderTime: string;
  quietAlertDefaultDays: number;
}

export interface AppState {
  onboarded: boolean;
  profile: Profile;
  entries: Entry[]; // append-only, newest first
  urgesRidden: Urge[];
  taper: Taper;
  circle: CircleMember[];
  settings: Settings;
}

export interface Metrics {
  totalDaysTracked: number;
  cleanDays: number;
  cumulativePct: number;
  currentStreak: number;
  setbackCount: number;
  daysSinceLastUse: number;
  moneySaved: number | null;
  urgesRidden: number;
}

export interface JourneyMonth {
  label: string;
  clean: number;
  total: number;
}

export interface TrendPoint {
  day: number;
  avg: number;
}
