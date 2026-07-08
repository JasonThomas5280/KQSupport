import { GradientRing } from "./GradientRing";
import { BG, TEXT } from "../styles/tokens";

// Branded loading screen shown while persisted state hydrates.
export function Splash() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: BG,
        color: TEXT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div className="clear-splash-mark" style={{ display: "flex" }}>
        <GradientRing percentage={72} size={72} strokeWidth={6} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: 6 }}>CLEAR</div>
      <div style={{ fontSize: 13, color: "rgba(234,242,244,0.45)" }}>A direction, not a streak.</div>
    </div>
  );
}
