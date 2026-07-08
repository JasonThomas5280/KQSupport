import { moneyMilestones } from "../model/phase";
import type { AppState, Metrics } from "../model/types";
import { ACCENT, PANEL, eyebrow, ghostBtn } from "../styles/tokens";

export function Money({
  state,
  m,
  onOpenSettings,
}: {
  state: AppState;
  m: Metrics;
  onOpenSettings: () => void;
}) {
  const mMiles = moneyMilestones(m.moneySaved);
  const spend = state.profile.dailySpend;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={eyebrow}>Money</div>
        <div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3 }}>
          The cost of quitting is zero. The cost of using was not.
        </div>
      </div>
      {m.moneySaved != null && spend != null ? (
        <div style={{ background: PANEL, borderRadius: 16, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 44, fontWeight: 700, color: ACCENT }}>${m.moneySaved.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: "rgba(234,242,244,0.5)", marginTop: 4 }}>kept over {m.cleanDays} clean days</div>
          <div style={{ fontSize: 12, color: "rgba(234,242,244,0.35)", marginTop: 10, lineHeight: 1.5 }}>
            ${Math.round(spend)}/day · ~${Math.round(spend * 30).toLocaleString()}/mo · $
            {Math.round(spend * 365).toLocaleString()}/yr
          </div>
          {mMiles.some((x) => x.hit) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 14 }}>
              {mMiles.map((x) => (
                <span
                  key={x.v}
                  style={{
                    fontSize: 11,
                    padding: "5px 10px",
                    borderRadius: 20,
                    background: x.hit ? "rgba(95,176,165,0.15)" : "rgba(255,255,255,0.04)",
                    color: x.hit ? ACCENT : "rgba(234,242,244,0.3)",
                    border: x.hit ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {x.hit ? "✓ " : ""}${x.v.toLocaleString()}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button style={ghostBtn} onClick={onOpenSettings}>
          Add your daily spend to see money saved →
        </button>
      )}
    </div>
  );
}
