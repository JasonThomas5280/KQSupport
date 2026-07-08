import { ACCENT, PANEL, WARM } from "../styles/tokens";
import type { TaperUnit } from "../model/types";

// Descriptive only: draws the doses the user chose to log, nothing more.
// No advice, projections, or pacing commentary (build spec §2).
export function TaperChart({
  history,
  unit,
  goal,
}: {
  history: { date: string; dose: number }[];
  unit: TaperUnit;
  goal: number;
}) {
  if (history.length < 2) return null;
  const pts = [...history].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const W = 320,
    H = 130,
    pad = 24;
  const doses = pts.map((p) => p.dose);
  const lo = Math.min(goal, ...doses);
  const hi = Math.max(...doses);
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i / (pts.length - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / span) * (H - pad * 2);
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.dose).toFixed(1)}`)
    .join(" ");
  return (
    <div style={{ background: PANEL, borderRadius: 16, padding: 18 }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Logged doses over time">
        <defs>
          <linearGradient id="tl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={WARM} />
            <stop offset="100%" stopColor={ACCENT} />
          </linearGradient>
        </defs>
        <line
          x1={pad}
          y1={y(goal)}
          x2={W - pad}
          y2={y(goal)}
          stroke="rgba(234,242,244,0.25)"
          strokeDasharray="4 4"
        />
        <text x={W - pad} y={y(goal) - 5} fill="rgba(234,242,244,0.35)" fontSize="9" textAnchor="end">
          goal {goal}
          {unit}
        </text>
        <path d={path} fill="none" stroke="url(#tl)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.dose)} r="3" fill={i === pts.length - 1 ? ACCENT : WARM} />
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
        <span>{pts[0].date.slice(5)}</span>
        <span>
          {pts[pts.length - 1].dose}
          {unit} last logged
        </span>
        <span>{pts[pts.length - 1].date.slice(5)}</span>
      </div>
      <div style={{ fontSize: 12, color: "rgba(234,242,244,0.4)", marginTop: 8, lineHeight: 1.5 }}>
        Your logged doses, in the order you logged them.
      </div>
    </div>
  );
}
