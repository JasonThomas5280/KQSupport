import { ACCENT, PANEL, WARM } from "../styles/tokens";

// One full-width tap-track per symptom: five contiguous segments, each a
// large target. Tap to rate 1–5; tap the current rating again to clear it.
export function SeverityTrack({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div style={{ background: PANEL, borderRadius: 12, padding: "12px 12px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{label}</span>
        {value != null && <span style={{ fontSize: 12, color: ACCENT }}>{value}/5</span>}
      </div>
      <div role="radiogroup" aria-label={label} style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} severity ${n} of 5`}
            onClick={() => onChange(value === n ? undefined : n)}
            style={{
              flex: 1,
              height: 40,
              cursor: "pointer",
              fontSize: 13,
              color: (value ?? 0) >= n ? "#06120f" : "rgba(234,242,244,0.5)",
              background:
                (value ?? 0) >= n
                  ? `linear-gradient(135deg, ${WARM}, ${ACCENT})`
                  : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: n === 1 ? "10px 0 0 10px" : n === 5 ? "0 10px 10px 0" : 0,
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "rgba(234,242,244,0.35)",
          marginTop: 6,
        }}
      >
        <span>Mild</span>
        <span>Severe</span>
      </div>
    </div>
  );
}
