import type { CSSProperties, ReactNode } from "react";
import { closeBtnStyle, overlayStyle } from "../styles/tokens";

// Shared full-screen modal chrome: overlay container (with its entry
// animation via .clear-overlay), plus the top-right close button.
export function Overlay({
  onClose,
  style,
  children,
}: {
  onClose: () => void;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="clear-overlay" style={{ ...overlayStyle, ...style }}>
      <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
        ×
      </button>
      {children}
    </div>
  );
}
