import type { AppState } from "../model/types";
import { PANEL, eyebrow, primaryBtn } from "../styles/tokens";

export function Circle({ state, onInvite }: { state: AppState; onInvite: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={eyebrow}>Your Circle</div>
        <div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3 }}>Quitting alone is the hardest way.</div>
      </div>
      {state.circle.length === 0 ? (
        <div style={{ fontSize: 14, color: "rgba(234,242,244,0.45)", textAlign: "center", padding: "18px 0", lineHeight: 1.5 }}>
          No one here yet. Add a quit buddy, family member, or counselor — ideally someone you'd text
          mid-craving.
        </div>
      ) : (
        state.circle.map((c) => (
          <div key={c.id} style={{ background: PANEL, borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(95,176,165,0.2), rgba(91,143,199,0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {c.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "rgba(234,242,244,0.45)", marginTop: 2 }}>
                {c.role} · {c.sharedVisibility ? "Sees check-ins" : "Private"} · {c.quietAlertDays}d nudge
              </div>
            </div>
          </div>
        ))
      )}
      <button style={primaryBtn} onClick={onInvite}>
        + Add to Circle
      </button>
      <div style={{ background: "rgba(91,143,199,0.08)", border: "1px solid rgba(91,143,199,0.2)", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>How Circle works</div>
        <div style={{ fontSize: 13, color: "rgba(234,242,244,0.6)", lineHeight: 1.6 }}>
          You choose who sees what — opt-in per person, revocable anytime. The "text right now" button in a
          craving reaches a shared person. Go quiet past your threshold and they get a gentle nudge.
        </div>
      </div>
      <div style={{ background: PANEL, borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Free support lines</div>
        <div style={{ fontSize: 13, color: "rgba(234,242,244,0.6)", lineHeight: 1.7 }}>
          SAMHSA National Helpline · <strong>1-800-662-4357</strong> · free, confidential, 24/7
          <br />
          Crisis Text Line · text <strong>HOME to 741741</strong>
        </div>
      </div>
    </div>
  );
}
