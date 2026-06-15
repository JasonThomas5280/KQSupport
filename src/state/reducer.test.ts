import { describe, it, expect } from "vitest";
import { appReducer } from "./reducer";
import { DEFAULT_STATE } from "../model/constants";

describe("appReducer", () => {
  it('RESOLVE_URGE "used" appends exactly one setback and one urge', () => {
    const next = appReducer(DEFAULT_STATE, { type: "RESOLVE_URGE", outcome: "used" });
    expect(next.urgesRidden).toHaveLength(1);
    expect(next.entries.filter((e) => e.type === "setback")).toHaveLength(1);
  });

  it('RESOLVE_URGE "rode_it" records an urge but no setback', () => {
    const next = appReducer(DEFAULT_STATE, { type: "RESOLVE_URGE", outcome: "rode_it" });
    expect(next.urgesRidden).toHaveLength(1);
    expect(next.entries.filter((e) => e.type === "setback")).toHaveLength(0);
  });

  it("ADD_ENTRY prepends newest-first", () => {
    const s1 = appReducer(DEFAULT_STATE, {
      type: "ADD_ENTRY",
      entry: { type: "setback", date: "2026-06-01", note: "", learned: "", nextMove: "" },
    });
    const s2 = appReducer(s1, {
      type: "ADD_ENTRY",
      entry: { type: "setback", date: "2026-06-02", note: "", learned: "", nextMove: "" },
    });
    expect(s2.entries[0].date).toBe("2026-06-02");
  });

  it("HARD_RESET clears to a fresh onboarding state", () => {
    const dirty = appReducer(DEFAULT_STATE, { type: "COMPLETE_ONBOARDING", profile: { ...DEFAULT_STATE.profile, name: "X" } });
    const reset = appReducer(dirty, { type: "HARD_RESET" });
    expect(reset.onboarded).toBe(false);
    expect(reset.entries).toHaveLength(0);
  });
});
