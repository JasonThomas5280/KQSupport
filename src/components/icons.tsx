import type { ReactNode } from "react";

// Stroke-based nav/UI icons. All inherit color via currentColor so the
// tab bar's active/inactive color logic needs no extra plumbing.
export interface IconProps {
  size?: number;
  strokeWidth?: number;
}

function Svg({ size = 22, strokeWidth = 1.8, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Sunrise over a horizon — Today. */
export function IconToday(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v3" />
      <path d="M5.6 6.6l2.1 2.1" />
      <path d="M18.4 6.6l-2.1 2.1" />
      <path d="M7 16a5 5 0 0 1 10 0" />
      <path d="M3 16h1.5" />
      <path d="M19.5 16h1.5" />
      <path d="M4 20h16" />
    </Svg>
  );
}

/** Circled dollar — Money. */
export function IconMoney(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v11" />
      <path d="M14.8 8.8c-.5-.8-1.6-1.3-2.8-1.3-1.7 0-3 .9-3 2.1s1.2 1.8 3 2.2 3 1 3 2.3-1.3 2.1-3 2.1c-1.2 0-2.3-.5-2.8-1.3" />
    </Svg>
  );
}

/** Rising route with waypoints — Path. */
export function IconPath(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 18l5-5 4 3 7-8" />
      <circle cx="4" cy="18" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="20" cy="8" r="1.7" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Two people — Circle. */
export function IconCircle(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
      <circle cx="16.9" cy="9.3" r="2.5" />
      <path d="M16.4 14.6c2.2.3 3.7 1.9 4.2 4.4" />
    </Svg>
  );
}

/** Lifebuoy — the Help / urge tool. */
export function IconHelp(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M5.7 5.7l3.5 3.5" />
      <path d="M14.8 14.8l3.5 3.5" />
      <path d="M18.3 5.7l-3.5 3.5" />
      <path d="M9.2 14.8l-3.5 3.5" />
    </Svg>
  );
}

/** Gear — Settings. */
export function IconSettings(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

/** Down arrow into a tray — backup export. */
export function IconDownload(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </Svg>
  );
}
