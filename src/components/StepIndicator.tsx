import { ACCENT } from "../styles/tokens";

// Segmented progress bar (the onboarding idiom). With a label it also
// prints "Step N of M" so multi-step flows show where the user is.
export function StepIndicator({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= step ? ACCENT : "rgba(255,255,255,0.1)",
              transition: "background .3s",
            }}
          />
        ))}
      </div>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 11,
            color: "rgba(234,242,244,0.45)",
            letterSpacing: 0.5,
          }}
        >
          <span>{label}</span>
          <span>
            Step {step + 1} of {total}
          </span>
        </div>
      )}
    </div>
  );
}
