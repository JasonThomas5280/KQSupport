import { GradientRing } from "../components/GradientRing";
import { MOOD_MAP } from "../model/constants";
import { todayISO } from "../model/dates";
import { cleanMilestones, phaseFor } from "../model/phase";
import type { AppState, CheckinEntry, Metrics } from "../model/types";
import { ACCENT, PANEL, eyebrow, ghostBtn, primaryBtn } from "../styles/tokens";

export function Today({
  state,
  m,
  onCheckIn,
  onTaper,
  onDocument,
}: {
  state: AppState;
  m: Metrics;
  onCheckIn: () => void;
  onTaper: () => void;
  onDocument: () => void;
}) {
  const phase = phaseFor(m.daysSinceLastUse);
  const checkins = state.entries.filter((e): e is CheckinEntry => e.type === "checkin");
  const checkedInToday = state.entries.some((e) => e.date === todayISO() && e.type === "checkin");
  const cMiles = cleanMilestones(m.currentStreak);
  const nextClean = cMiles.find((x) => !x.hit);
  const lastClean = [...cMiles].reverse().find((x) => x.hit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ textAlign: "center", paddingTop: 4 }}>
        <div style={{ ...eyebrow, textAlign: "center" }}>Your reason</div>
        <div style={{ fontSize: 19, fontWeight: 300, fontStyle: "italic", lineHeight: 1.4, color: "rgba(234,242,244,0.85)" }}>
          "{state.profile.reason}"
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <GradientRing percentage={m.cumulativePct} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{m.currentStreak}</div>
          <div style={{ fontSize: 12, color: "rgba(234,242,244,0.5)", marginTop: 4 }}>days clear</div>
          <div style={{ fontSize: 11, color: "rgba(234,242,244,0.35)", marginTop: 2 }}>
            {m.cumulativePct}% of {m.totalDaysTracked} tracked
          </div>
        </div>
      </div>
      {(lastClean || nextClean) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 12, color: "rgba(234,242,244,0.55)" }}>
          {lastClean && <span style={{ color: ACCENT }}>✓ {lastClean.label}</span>}
          {nextClean && (
            <span>
              · next: {nextClean.label} (day {nextClean.d})
            </span>
          )}
        </div>
      )}
      <div style={{ background: "rgba(91,143,199,0.1)", border: "1px solid rgba(91,143,199,0.25)", borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>
          {phase.tag}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(234,242,244,0.8)" }}>{phase.msg}</div>
      </div>
      {m.moneySaved != null && (
        <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: ACCENT }}>${m.moneySaved.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>saved</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{m.urgesRidden}</div>
            <div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>urges ridden</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{m.setbackCount}</div>
            <div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>slips</div>
          </div>
        </div>
      )}
      <button
        style={{
          ...primaryBtn,
          background: "linear-gradient(135deg, rgba(95,176,165,0.16), rgba(95,176,165,0.08))",
          border: `1px solid rgba(95,176,165,0.3)`,
          color: ACCENT,
        }}
        onClick={onCheckIn}
      >
        {checkedInToday ? "Check in again" : "Check in"}
      </button>
      {state.profile.method === "taper" && (
        <button style={ghostBtn} onClick={onTaper}>
          {state.taper.active
            ? `Taper: ${state.taper.currentDose ?? "—"}${state.taper.unit} → ${state.taper.goal}${state.taper.unit}`
            : "Set up taper log"}
        </button>
      )}
      <div>
        <div style={{ ...eyebrow, letterSpacing: 0.5 }}>Recent check-ins</div>
        {checkins.length === 0 ? (
          <div style={{ fontSize: 14, color: "rgba(234,242,244,0.4)", padding: "14px 0", textAlign: "center", lineHeight: 1.5 }}>
            No check-ins yet. The first one starts your pattern.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checkins.slice(0, 5).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: PANEL, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: MOOD_MAP[c.mood]?.color || "#888", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 14 }}>
                  {c.note || MOOD_MAP[c.mood]?.label}
                  {c.symptoms?.length > 0 && (
                    <span style={{ fontSize: 11, color: "rgba(234,242,244,0.4)" }}>
                      {" "}
                      · {c.symptoms.length} symptom{c.symptoms.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "rgba(234,242,244,0.35)" }}>{c.date.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        style={{ ...ghostBtn, background: "transparent", borderColor: "rgba(255,255,255,0.06)", color: "rgba(234,242,244,0.35)", fontSize: 13 }}
        onClick={onDocument}
      >
        Document a slip
      </button>
    </div>
  );
}
