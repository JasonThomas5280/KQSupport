import { JourneyChart } from "../components/JourneyChart";
import { SymptomTrendChart } from "../components/SymptomTrendChart";
import { cleanMilestones } from "../model/phase";
import type { JourneyMonth, Metrics, TrendPoint } from "../model/types";
import { ACCENT, PANEL, WARM, eyebrow } from "../styles/tokens";

// Longitudinal view only — summary numbers live on Today and Money.
export function Path({
  m,
  journey,
  trend,
}: {
  m: Metrics;
  journey: JourneyMonth[];
  trend: TrendPoint[];
}) {
  const miles = cleanMilestones(m.currentStreak);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={eyebrow}>Your path</div>
        <div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3 }}>Every month, the honest version.</div>
      </div>
      <div style={{ background: PANEL, borderRadius: 16, padding: 20 }}>
        <JourneyChart data={journey} />
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, fontSize: 11, color: "rgba(234,242,244,0.4)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: ACCENT }} /> Full month clear
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: WARM }} /> Had a slip
          </span>
        </div>
      </div>
      <div>
        <div style={{ ...eyebrow, letterSpacing: 0.5 }}>Symptoms over time</div>
        {trend.length < 2 ? (
          <div style={{ fontSize: 14, color: "rgba(234,242,244,0.4)", padding: "14px 0", lineHeight: 1.5 }}>
            Rate your symptoms in a few check-ins. Once there are two days of data, you'll see the line — and
            watch it fall as withdrawal recedes.
          </div>
        ) : (
          <SymptomTrendChart points={trend} />
        )}
      </div>
      <div>
        <div style={{ ...eyebrow, letterSpacing: 0.5 }}>Milestones</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {miles.map((x) => (
            <div
              key={x.d}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "7px 0",
                opacity: x.hit ? 1 : 0.35,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: x.hit ? ACCENT : "transparent",
                  border: `2px solid ${x.hit ? ACCENT : "rgba(234,242,244,0.4)"}`,
                  boxSizing: "border-box",
                }}
              />
              <span style={{ flex: 1, fontSize: 14 }}>{x.label}</span>
              <span style={{ fontSize: 11, color: "rgba(234,242,244,0.45)" }}>day {x.d}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(95,176,165,0.08)", border: "1px solid rgba(95,176,165,0.2)", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(234,242,244,0.75)" }}>
          {m.setbackCount > 0 ? (
            <>
              You've stayed clean <strong style={{ color: ACCENT }}>{m.cumulativePct}% of your days</strong>. {m.setbackCount}{" "}
              slip{m.setbackCount > 1 ? "s" : ""} — logged, learned from, behind you. The line still goes up.
            </>
          ) : (
            <>
              You're <strong style={{ color: ACCENT }}>{m.currentStreak} days</strong> in with no slips logged. And if one
              comes, it still won't reset you to zero.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
