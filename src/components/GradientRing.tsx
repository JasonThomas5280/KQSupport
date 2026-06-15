import { ACCENT, WARM } from "../styles/tokens";

export function GradientRing({
  percentage,
  size = 210,
  strokeWidth = 14,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (percentage / 100) * c;
  const ctr = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={WARM} />
          <stop offset="45%" stopColor="#5b8fc7" />
          <stop offset="100%" stopColor={ACCENT} />
        </linearGradient>
        <filter id="gl">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={ctr} cy={ctr} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={ctr}
        cy={ctr}
        r={r}
        fill="none"
        stroke="url(#rg)"
        strokeWidth={strokeWidth}
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        filter="url(#gl)"
        style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
      />
    </svg>
  );
}
