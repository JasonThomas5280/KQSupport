import { describe, it, expect } from "vitest";
import { parseBackup, serializeState } from "./backup";
import { DEFAULT_STATE } from "./constants";
import type { AppState } from "./types";

const fullState = (): AppState => ({
  ...DEFAULT_STATE,
  onboarded: true,
  profile: {
    name: "River",
    reason: "Mornings back",
    product: "Feel Free",
    method: "taper",
    quitDate: "2026-06-01",
    dailySpend: 21.5,
  },
  entries: [
    { type: "checkin", date: "2026-07-01", mood: "okay", symptoms: [{ key: "cravings", severity: 3 }], note: "" },
    { type: "setback", date: "2026-06-28", note: "party", learned: "avoid", nextMove: "call" },
  ],
  urgesRidden: [{ date: "2026-07-02", ts: 1751400000000, outcome: "rode_it" }],
  taper: {
    active: true,
    startDose: 4,
    currentDose: 3,
    unit: "g",
    goal: 0,
    history: [
      { date: "2026-06-20", dose: 4 },
      { date: "2026-07-01", dose: 3 },
    ],
  },
  circle: [{ id: "1", name: "Sam", role: "Quit buddy", phone: "555", isGoTo: true, quietAlertDays: 3 }],
});

describe("serializeState", () => {
  it("round-trips the full state through JSON", () => {
    expect(JSON.parse(serializeState(fullState()))).toEqual(fullState());
  });

  it("emits human-readable (indented) JSON", () => {
    expect(serializeState(DEFAULT_STATE)).toContain("\n  ");
  });
});

describe("parseBackup", () => {
  it("round-trips a serialized backup to a deep-equal state", () => {
    expect(parseBackup(serializeState(fullState()))).toEqual(fullState());
  });

  it("rejects non-JSON", () => {
    expect(parseBackup("not json {")).toBeNull();
  });

  it("rejects JSON that isn't a backup", () => {
    expect(parseBackup('"hello"')).toBeNull();
    expect(parseBackup("[1,2,3]")).toBeNull();
    expect(parseBackup('{"foo": 1}')).toBeNull();
  });

  it("rejects a backup with a malformed quitDate", () => {
    const bad = { ...fullState(), profile: { ...fullState().profile, quitDate: "junk" } };
    expect(parseBackup(JSON.stringify(bad))).toBeNull();
  });

  it("backfills missing sections from defaults", () => {
    const minimal = { profile: { quitDate: "2026-06-01" } };
    const parsed = parseBackup(JSON.stringify(minimal));
    expect(parsed).not.toBeNull();
    expect(parsed!.settings).toEqual(DEFAULT_STATE.settings);
    expect(parsed!.entries).toEqual([]);
    expect(parsed!.onboarded).toBe(true);
  });

  it("coerces unknown enum values to safe defaults", () => {
    const odd = {
      ...fullState(),
      profile: { ...fullState().profile, product: "Future Product 9000", method: "moon_phase" },
      taper: { ...fullState().taper, unit: "barrels" },
    };
    const parsed = parseBackup(JSON.stringify(odd));
    expect(parsed!.profile.product).toBe("Other");
    expect(parsed!.profile.method).toBe("cold_turkey");
    expect(parsed!.taper.unit).toBe("g");
  });

  it("drops garbage rows from lists and clamps severities", () => {
    const messy = {
      ...fullState(),
      entries: [
        { type: "checkin", date: "2026-07-01", mood: "okay", symptoms: [{ key: "cravings", severity: 99 }], note: "" },
        { type: "mystery", date: "2026-07-01" },
        "not an entry",
      ],
      urgesRidden: [{ date: "2026-07-02", ts: 1, outcome: "teleported" }],
    };
    const parsed = parseBackup(JSON.stringify(messy));
    expect(parsed!.entries).toHaveLength(1);
    expect((parsed!.entries[0] as { symptoms: { severity: number }[] }).symptoms[0].severity).toBe(5);
    expect(parsed!.urgesRidden).toEqual([]);
  });
});
