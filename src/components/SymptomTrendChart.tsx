import { ACCENT, PANEL, WARM } from "../styles/tokens";
import type { TrendPoint } from "../model/types";

export function SymptomTrendChart({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) return null;
  const W = 320,
    H = 130,
    pad = 24;
  const maxDay = Math.max(...points.map((p) => p.day), 1);
  const x = (d: number) => pad + (d / maxDay) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - 1) / 4) * (H - pad * 2);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.avg).toFixed(1)}`)
    .join(" ");
  const first = points[0].avg;
  const last = points[points.length - 1].avg;
  const falling = last < first;
  return (
    <div style={{ background: PANEL, borderRadius: 16, padding: 18 }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Symptom intensity over time">
        <defs>
          <linearGradient id="sl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={WARM} />
            <stop offset="100%" stopColor={ACCENT} />
          </linearGradient>
        </defs>
        {[1, 3, 5].map((v) => (
          <g key={v}>
            <line x1={pad} y1={y(v)} x2={W - pad} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
            <text x={4} y={y(v) + 3} fill="rgba(234,242,244,0.3)" fontSize="9">
              {v}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="url(#sl)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(p.day)}
            cy={y(p.avg)}
            r="3"
            fill={i === points.length - 1 ? ACCENT : WARM}
          />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "rgba(234,242,244,0.4)",
          marginTop: 4,
        }}
      >
        <span>Day {points[0].day}</span>
        <span>severity over days clean</span>
        <span>Day {points[points.length - 1].day}</span>
      </div>
      {falling && (
        <div style={{ fontSize: 13, color: ACCENT, marginTop: 10, lineHeight: 1.5 }}>
          Your symptoms are measurably lighter than when you started. That's the healing, on a graph.
        </div>
      )}
    </div>
  );
}
