import { ACCENT, ACCENT2, WARM } from "../styles/tokens";
import type { JourneyMonth } from "../model/types";

// Past ~18 months the bars horizontally scroll rather than crush together
// (build spec §8.3). The >18-month no-throw guard is covered by derive.test.ts.
const SCROLL_THRESHOLD = 18;

export function JourneyChart({ data }: { data: JourneyMonth[] }) {
  const maxDays = 31;
  if (!data.length) return null;
  const scroll = data.length > SCROLL_THRESHOLD;
  return (
    <div style={{ overflowX: scroll ? "auto" : "visible" }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "flex-end",
          height: 120,
          minWidth: scroll ? data.length * 34 : undefined,
        }}
      >
        {data.map((m, i) => {
          const h = (m.clean / maxDays) * 100;
          const full = m.clean === m.total;
          return (
            <div
              key={i}
              style={{
                flex: scroll ? "0 0 28px" : 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 28,
                  borderRadius: 6,
                  minHeight: 8,
                  height: `${h}%`,
                  background: full
                    ? `linear-gradient(180deg, ${ACCENT}, ${ACCENT2})`
                    : `linear-gradient(180deg, ${WARM}, #b87f42)`,
                  transition: "height .8s ease-out",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: "rgba(234,242,244,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
