import { JourneyChart } from "../components/JourneyChart";
import type { JourneyMonth, Metrics } from "../model/types";
import { ACCENT, PANEL, WARM, eyebrow } from "../styles/tokens";

export function Path({ m, journey }: { m: Metrics; journey: JourneyMonth[] }) {
  const stats = [
    { value: `${m.cumulativePct}%`, label: "Clean days" },
    { value: m.currentStreak, label: "Current streak" },
    { value: m.moneySaved != null ? `$${m.moneySaved.toLocaleString()}` : "—", label: "Money saved" },
    { value: m.urgesRidden, label: "Urges ridden" },
  ];
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: PANEL, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(234,242,244,0.45)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
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
