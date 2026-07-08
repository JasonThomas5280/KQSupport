import { describe, it, expect } from "vitest";
import { serializeState } from "./backup";
import { DEFAULT_STATE } from "./constants";
import type { AppState } from "./types";

describe("serializeState", () => {
  it("round-trips the full state through JSON", () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      onboarded: true,
      profile: { ...DEFAULT_STATE.profile, name: "River", dailySpend: 21.5 },
      entries: [
        { type: "checkin", date: "2026-07-01", mood: "okay", symptoms: [{ key: "cravings", severity: 3 }], note: "" },
        { type: "setback", date: "2026-06-28", note: "party", learned: "", nextMove: "" },
      ],
      taper: { ...DEFAULT_STATE.taper, active: true, history: [{ date: "2026-07-01", dose: 3 }] },
    };
    expect(JSON.parse(serializeState(state))).toEqual(state);
  });

  it("emits human-readable (indented) JSON", () => {
    expect(serializeState(DEFAULT_STATE)).toContain("\n  ");
  });
});
