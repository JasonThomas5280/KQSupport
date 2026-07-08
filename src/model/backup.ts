import { DEFAULT_STATE, PRODUCTS } from "./constants";
import type {
  AppState,
  CircleMember,
  Entry,
  Method,
  Product,
  TaperUnit,
  Urge,
} from "./types";

/** Full app state as pretty-printed JSON — the downloadable backup body. */
export function serializeState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v != null && !Array.isArray(v);
const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const numOrNull = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseEntry(v: unknown): Entry | null {
  if (!isObj(v) || typeof v.date !== "string" || !DATE_RE.test(v.date)) return null;
  if (v.type === "checkin") {
    const symptoms = Array.isArray(v.symptoms)
      ? v.symptoms.flatMap((s) =>
          isObj(s) && typeof s.key === "string" && typeof s.severity === "number"
            ? [{ key: s.key, severity: Math.min(5, Math.max(1, Math.round(s.severity))) }]
            : [],
        )
      : [];
    return { type: "checkin", date: v.date, mood: str(v.mood, "okay"), symptoms, note: str(v.note, "") };
  }
  if (v.type === "setback") {
    return {
      type: "setback",
      date: v.date,
      note: str(v.note, ""),
      learned: str(v.learned, ""),
      nextMove: str(v.nextMove, ""),
    };
  }
  return null;
}

function parseUrge(v: unknown): Urge | null {
  if (!isObj(v) || typeof v.date !== "string") return null;
  const outcome = v.outcome;
  if (outcome !== "rode_it" && outcome !== "reached_out" && outcome !== "used") return null;
  return { date: v.date, ts: num(v.ts, 0), outcome };
}

function parseMember(v: unknown): CircleMember | null {
  if (!isObj(v) || typeof v.name !== "string" || !v.name.trim()) return null;
  return {
    id: str(v.id, String(Math.abs(v.name.length * 7919))),
    name: v.name,
    role: str(v.role, "Support person"),
    phone: str(v.phone, ""),
    isGoTo: bool(v.isGoTo, false),
    quietAlertDays: num(v.quietAlertDays, 3),
  };
}

/**
 * Validate a backup file's text into an AppState, or null if it isn't one.
 * Unknown enum values coerce to defaults (forward compatibility); missing
 * sections backfill from DEFAULT_STATE; garbage in any list is dropped.
 */
export function parseBackup(raw: string): AppState | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(data) || !isObj(data.profile)) return null;
  const p = data.profile;
  if (typeof p.quitDate !== "string" || !DATE_RE.test(p.quitDate)) return null;

  const product: Product = PRODUCTS.includes(p.product as Product) ? (p.product as Product) : "Other";
  const method: Method = p.method === "taper" ? "taper" : "cold_turkey";
  const t = isObj(data.taper) ? data.taper : {};
  const unit: TaperUnit = t.unit === "ml" || t.unit === "bottles" ? t.unit : "g";
  const s = isObj(data.settings) ? data.settings : {};

  return {
    onboarded: bool(data.onboarded, true),
    profile: {
      name: str(p.name, ""),
      reason: str(p.reason, ""),
      product,
      method,
      quitDate: p.quitDate,
      dailySpend: numOrNull(p.dailySpend),
    },
    entries: Array.isArray(data.entries) ? data.entries.flatMap((e) => parseEntry(e) ?? []) : [],
    urgesRidden: Array.isArray(data.urgesRidden) ? data.urgesRidden.flatMap((u) => parseUrge(u) ?? []) : [],
    taper: {
      active: bool(t.active, false),
      startDose: numOrNull(t.startDose),
      currentDose: numOrNull(t.currentDose),
      unit,
      goal: num(t.goal, 0),
      history: Array.isArray(t.history)
        ? t.history.flatMap((h) =>
            isObj(h) && typeof h.date === "string" && typeof h.dose === "number"
              ? [{ date: h.date, dose: h.dose }]
              : [],
          )
        : [],
    },
    circle: Array.isArray(data.circle) ? data.circle.flatMap((c) => parseMember(c) ?? []) : [],
    settings: {
      reminderTime: str(s.reminderTime, DEFAULT_STATE.settings.reminderTime),
      quietAlertDefaultDays: num(s.quietAlertDefaultDays, DEFAULT_STATE.settings.quietAlertDefaultDays),
    },
  };
}
