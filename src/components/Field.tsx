import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(234,242,244,0.8)" }}>
        {label}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: 12, color: "rgba(234,242,244,0.4)", lineHeight: 1.4 }}>
          {hint}
        </span>
      )}
    </div>
  );
}
