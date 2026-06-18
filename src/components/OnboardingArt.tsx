import { ACCENT, ACCENT2, WARM } from "../styles/tokens";

// Calm, abstract inline-SVG motifs — one per onboarding step. Pure SVG (no
// image assets) so the static build stays light. Tuned to the app's tokens.

export type ArtVariant = "path" | "wave" | "sunrise" | "savings";

const BLUE = "#5b8fc7";
const W = 320;
const H = 150;

export function OnboardingArt({ variant }: { variant: ArtVariant }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ maxWidth: 300 }}
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="oa-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={WARM} />
            <stop offset="55%" stopColor={BLUE} />
            <stop offset="100%" stopColor={ACCENT} />
          </linearGradient>
          <radialGradient id="oa-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.45" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="oa-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={WARM} stopOpacity="0.95" />
            <stop offset="100%" stopColor={WARM} stopOpacity="0.15" />
          </radialGradient>
          <filter id="oa-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {variant === "path" && <PathArt />}
        {variant === "wave" && <WaveArt />}
        {variant === "sunrise" && <SunriseArt />}
        {variant === "savings" && <SavingsArt />}
      </svg>
    </div>
  );
}

// A winding road narrowing toward a glowing destination — "a direction."
function PathArt() {
  return (
    <g>
      <circle cx={160} cy={46} r={60} fill="url(#oa-glow)" />
      <circle cx={160} cy={46} r={13} fill="url(#oa-sun)" />
      <circle cx={160} cy={46} r={5} fill={ACCENT} />
      {/* converging road edges */}
      <path d="M96 150 L150 58" fill="none" stroke="url(#oa-grad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <path d="M224 150 L170 58" fill="none" stroke="url(#oa-grad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      {/* dashed centre line */}
      <path
        d="M160 150 L160 62"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2"
        strokeDasharray="2 10"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  );
}

// Concentric ripples settling on calm water — stepping away from the churn.
function WaveArt() {
  const cy = 96;
  return (
    <g>
      <circle cx={160} cy={cy} r={70} fill="url(#oa-glow)" opacity="0.7" />
      {[64, 48, 32, 16].map((r, i) => (
        <ellipse
          key={r}
          cx={160}
          cy={cy}
          rx={r}
          ry={r * 0.34}
          fill="none"
          stroke="url(#oa-grad)"
          strokeWidth="2"
          opacity={0.3 + i * 0.18}
        />
      ))}
      <circle cx={160} cy={cy} r={4} fill={ACCENT} />
    </g>
  );
}

// Sun cresting a horizon with soft rays — hope, the reason to begin.
function SunriseArt() {
  const horizon = 104;
  const cx = 160;
  const cy = horizon;
  return (
    <g>
      <circle cx={cx} cy={cy} r={66} fill="url(#oa-glow)" />
      {/* rays */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = Math.PI - (i / 8) * Math.PI;
        const x1 = cx + Math.cos(a) * 36;
        const y1 = cy - Math.sin(a) * 36;
        const x2 = cx + Math.cos(a) * 50;
        const y2 = cy - Math.sin(a) * 50;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={WARM} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        );
      })}
      {/* sun */}
      <path d={`M${cx - 26} ${cy} a26 26 0 0 1 52 0 Z`} fill="url(#oa-sun)" />
      <path d={`M${cx - 26} ${cy} a26 26 0 0 1 52 0`} fill="none" stroke={WARM} strokeWidth="2" opacity="0.8" />
      {/* horizon */}
      <line x1={36} y1={horizon} x2={284} y2={horizon} stroke="url(#oa-grad)" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

// Rising rounded columns — the money coming back, growth over time.
function SavingsArt() {
  const base = 128;
  const bars = [34, 56, 78, 104];
  const bw = 30;
  const gap = 18;
  const totalW = bars.length * bw + (bars.length - 1) * gap;
  const startX = (W - totalW) / 2;
  return (
    <g>
      <circle cx={160} cy={90} r={72} fill="url(#oa-glow)" opacity="0.6" />
      {bars.map((h, i) => {
        const x = startX + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={bw} height={h} rx={9} fill="url(#oa-grad)" opacity={0.55 + i * 0.12} />
            <circle cx={x + bw / 2} cy={base - h - 12} r={4} fill={i === bars.length - 1 ? ACCENT : WARM} opacity="0.9" />
          </g>
        );
      })}
      {/* baseline */}
      <line x1={startX - 10} y1={base + 3} x2={startX + totalW + 10} y2={base + 3} stroke={ACCENT2} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}
